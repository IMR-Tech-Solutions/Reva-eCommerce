from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from .models import ManagerRequest, ShopOwnerProducts
from .serializers import ManagerRequestListSerializer, ManagerRequestSerializer
from accounts.premissions import HasModuleAccess
from inventory.models import StockBatch
from notifications.services import firebase_service


class ManagerPendingRequestsView(APIView):
    permission_classes = [IsAuthenticated,HasModuleAccess ]
    required_permission = "shop-request"
    
    def get(self, request):
        manager = request.user
        pending_requests = ManagerRequest.objects.filter(
            manager=manager,
            status='pending'
        ).select_related('product', 'order_item__order').order_by('-created_at')
        
        paginator = PageNumberPagination()
        paginated_requests = paginator.paginate_queryset(pending_requests, request)
        
        serializer = ManagerRequestListSerializer(paginated_requests, many=True)
        return paginator.get_paginated_response(serializer.data)


class ManagerRequestDetailView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-request"
    
    def get(self, request, request_id):
        manager_request = get_object_or_404(
            ManagerRequest, 
            id=request_id, 
            manager=request.user
        )

        try:
            active_batch = StockBatch.objects.get(
                product=manager_request.product,
                user=request.user,
                batch_status='active'
            )
            available_quantity = active_batch.quantity
        except StockBatch.DoesNotExist:
            available_quantity = 0
        
        serializer_data = ManagerRequestSerializer(manager_request).data

        return Response({
            'request_details': serializer_data,
            'stock_info': {
                'available_quantity': available_quantity,
                'requested_quantity': manager_request.requested_quantity,
                'can_fulfill_fully': available_quantity >= manager_request.requested_quantity,
                'shortage': max(0, manager_request.requested_quantity - available_quantity)
            }
        })


from django.db.models import F, DecimalField
class ManagerAcceptRequestView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-request"
    
    @transaction.atomic
    def post(self, request, request_id):
        manager_request = get_object_or_404(
            ManagerRequest,
            id=request_id,
            manager=request.user,
            status='pending'
        )
    
        offered_quantity = int(request.data.get('offered_quantity', manager_request.requested_quantity))
        if offered_quantity <= 0:
            return Response({
                'error': 'Offered quantity must be greater than 0'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if offered_quantity > manager_request.requested_quantity:
            return Response({
                'error': f'Cannot offer more than requested quantity. Requested: {manager_request.requested_quantity}, Offered: {offered_quantity}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            active_batch = StockBatch.objects.select_for_update().get(
                product=manager_request.product,
                user=request.user,
                batch_status='active'
            )
            if active_batch.quantity < offered_quantity:
                return Response({
                    'error': f'Insufficient stock. Available: {active_batch.quantity}, Requested: {offered_quantity}'
                }, status=status.HTTP_400_BAD_REQUEST)

            final_offered_price = active_batch.selling_price
            original_requested = manager_request.requested_quantity
            manager_request.status = 'accepted'
            manager_request.offered_price = final_offered_price
            manager_request.response_date = timezone.now()
            manager_request.save()
            try:
                shop_owner = manager_request.order_item.order.shop_owner
                manager_name = f"{request.user.first_name} {request.user.last_name}"
                notification_result = firebase_service.notify_shop_owner_request_accepted(
                    shop_owner_id=shop_owner.id,
                    manager_name=manager_name,
                    product_name=manager_request.product.product_name,
                    quantity=offered_quantity,
                    request_id=manager_request.id
                )
                if notification_result['success']:
                    print(f"Shop owner {shop_owner.id} notified about accepted request {manager_request.id}")
                else:
                    print(f"Failed to notify shop owner: {notification_result['error']}")
            except Exception as e:
                print(f"Error sending notification to shop owner: {e}")

            ManagerRequest.objects.filter(
                order_item=manager_request.order_item,
                status='pending'
            ).exclude(id=manager_request.id).update(
                status='cancelled',
                response_date=timezone.now()
            )
            fulfillment_result = self._fulfill_request(
                manager_request, 
                active_batch, 
                offered_quantity,
                final_offered_price
            )
            
            if fulfillment_result['success']:
                return Response({
                    'message': f'Request accepted! {offered_quantity} units !',
                    'partial_fulfillment': offered_quantity < original_requested,
                    'original_requested': original_requested,
                    'quantity_fulfilled': offered_quantity,
                    'price_per_unit': final_offered_price,
                    'request': ManagerRequestSerializer(manager_request).data,
                    'fulfillment': fulfillment_result
                })
            else:
                return Response({
                    'error': 'Request accepted but fulfillment failed',
                    'details': fulfillment_result['error']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except StockBatch.DoesNotExist:
            return Response({
                'error': 'No active stock batch found for this product'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to accept request: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _fulfill_request(self, manager_request, stock_batch, offered_quantity, offered_price):
        try:
            stock_batch.quantity -= offered_quantity
            if stock_batch.quantity == 0:
                stock_batch.batch_status = 'sold'
            stock_batch.save()
            
            if stock_batch.batch_status == 'sold':
                self._activate_next_batch(manager_request.manager, manager_request.product)
            
            # shop_owner_product, created = ShopOwnerProducts.objects.get_or_create(
            #     shop_owner=manager_request.order_item.order.shop_owner,
            #     product=manager_request.product,
            #     defaults={
            #         'quantity': offered_quantity,
            #         'purchase_price': offered_price,
            #         'selling_price': offered_price, 
            #         'source_manager': manager_request.manager,
            #         'is_active': False,
            #         'delivery_confirmed': False
            #     }
            # )
            
            # if not created:
            #     shop_owner_product.quantity += offered_quantity
            #     shop_owner_product.purchase_price = offered_price
            #     shop_owner_product.delivery_confirmed = False
            #     shop_owner_product.is_active = False
            #     shop_owner_product.save()

            # manager_request.status = 'fulfilled'
            # manager_request.save()
            
            order_item = manager_request.order_item
            order_item.fulfilled_by_manager = manager_request.manager
            order_item.fulfilled_quantity = offered_quantity
            order_item.actual_price = offered_price
            order_item.save()
            
            self._check_order_completion(order_item.order)
            self._update_order_total(order_item.order)
            
            return {
                'success': True,
                'message': f'Successfully prepared {offered_quantity} units to delivery',
                'manager_remaining_stock': stock_batch.quantity,
                'batch_completed': stock_batch.batch_status == 'sold',
                'order_status': order_item.order.status,
                'delivery_status': 'Products prepared, awaiting delivery confirmation'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    def _check_order_completion(self, shop_order):
        total_items = shop_order.order_items.count()
        fulfilled_items = shop_order.order_items.filter(
            fulfilled_by_manager__isnull=False
            ).count()
        
        if fulfilled_items == total_items:
            shop_order.status = 'delivery_in_progress'
        elif fulfilled_items > 0:
            shop_order.status = 'partially_fulfilled'
        else:
            shop_order.status = 'order_placed'
        shop_order.save()

    def _activate_next_batch(self, manager, product):
        try:
            next_batch = StockBatch.objects.filter(
                user=manager,
                product=product,
                batch_status='not_active',
                quantity__gt=0
            ).order_by('created_at').first() 
            
            if next_batch:
                next_batch.batch_status = 'active'
                next_batch.save()
                print(f"Activated next batch {next_batch.id} for {manager.first_name} - {product.product_name}")
                return True
            else:
                print(f"No more batches available for {manager.first_name} - {product.product_name}")
                return False
                
        except Exception as e:
            print(f"Failed to activate next batch: {str(e)}")
            return False
        
    def _update_order_total(self, shop_order):
        from django.db.models import Sum
        result = shop_order.order_items.filter(
            fulfilled_by_manager__isnull=False 
        ).aggregate(
            total=Sum(
                F('fulfilled_quantity') * F('actual_price'),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
        )
        shop_order.total_amount = result['total'] or 0
        shop_order.save()
        print(f"Updated order {shop_order.order_number} total to ₹{shop_order.total_amount}")

class ManagerRejectRequestView(APIView):
    permission_classes = [IsAuthenticated,HasModuleAccess ]
    required_permission = "shop-request"
    
    def post(self, request, request_id):
        manager_request = get_object_or_404(
            ManagerRequest,
            id=request_id,
            manager=request.user,
            status='pending'
        )
        
        manager_request.status = 'rejected'
        manager_request.response_date = timezone.now()
        manager_request.manager_response_notes = request.data.get('reason', 'No reason provided')
        manager_request.save()
        
        return Response({
            'message': 'Request rejected successfully',
            'request': ManagerRequestSerializer(manager_request).data
        })


class ManagerRequestHistoryView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-request"
    
    def get(self, request):
        manager = request.user
        request_status = request.query_params.get('status', None)
        
        requests_query = ManagerRequest.objects.filter(manager=manager)
        
        if request_status:
            requests_query = requests_query.filter(status=request_status)
        
        requests = requests_query.select_related(
            'product', 'order_item__order'
        ).order_by('-created_at')
        
        paginator = PageNumberPagination()
        paginated_requests = paginator.paginate_queryset(requests, request)
        
        serializer = ManagerRequestListSerializer(paginated_requests, many=True)
        return paginator.get_paginated_response(serializer.data)


from .models import ShopOwnerOrders, ShopOrderItem, ShopOwnerProducts
from .serializers import ShopOwnerOrderSerializer, ShopOrderListSerializer, ShopOwnerProductsSerializer
from .services import ShopOrderDistributionService

class PlaceShopOrderView(APIView):
    """Shop owner places an order to managers"""
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-access"
    @transaction.atomic
    def post(self, request):
        # Validate order data
        serializer = ShopOwnerOrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Create the order
            order = serializer.save()
            distribution_result = ShopOrderDistributionService.distribute_order_to_managers(order.id)
            
            if distribution_result['success']:
                return Response({
                    'message': 'Order placed successfully and distributed to managers',
                    'order': ShopOwnerOrderSerializer(order).data,
                    'distribution': distribution_result['distribution_results']
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'Order created but distribution failed',
                    'order': ShopOwnerOrderSerializer(order).data,
                    'distribution_error': distribution_result['error']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShopOwnerOrdersView(APIView):
    """View all orders placed by shop owner"""
    permission_classes = [IsAuthenticated,HasModuleAccess ]
    required_permission = "shop-access"
    
    def get(self, request):
        shop_owner = request.user
        status_filter = request.query_params.get('status', None)
        
        orders_query = ShopOwnerOrders.objects.filter(shop_owner=shop_owner)
        
        if status_filter:
            orders_query = orders_query.filter(status=status_filter)
        
        orders = orders_query.order_by('-created_at')
        
        paginator = PageNumberPagination()
        paginated_orders = paginator.paginate_queryset(orders, request)
        
        serializer = ShopOrderListSerializer(paginated_orders, many=True)
        return paginator.get_paginated_response(serializer.data)


class ShopOwnerOrderDetailView(APIView):
    """View detailed information about a specific order"""
    permission_classes = [IsAuthenticated, HasModuleAccess ]
    required_permission = "shop-access"
    
    def get(self, request, order_id):
        order = get_object_or_404(
            ShopOwnerOrders,
            id=order_id,
            shop_owner=request.user
        )
        
        serializer = ShopOwnerOrderSerializer(order)
        
        # Also get the manager requests for this order
        manager_requests = []
        for order_item in order.order_items.all():
            item_requests = order_item.manager_requests.select_related('manager').all()
            for req in item_requests:
                manager_requests.append({
                    'product_name': req.product.product_name,
                    'manager_name': f"{req.manager.first_name} {req.manager.last_name}",
                    'requested_quantity': req.requested_quantity,
                    'status': req.status,
                    'offered_price': req.offered_price,
                    'response_date': req.response_date
                })
        
        return Response({
            'order': serializer.data,
            'manager_requests': manager_requests
        })


class ShopOwnerProductsView(APIView):
    """View products owned by shop owner (their inventory)"""
    permission_classes = [IsAuthenticated,HasModuleAccess ]
    required_permission = "shop-access"
    def get(self, request):
        shop_owner = request.user
        owned_products = ShopOwnerProducts.objects.filter(
            shop_owner=shop_owner,
            quantity__gt=0  
        ).select_related('product', 'source_manager').order_by('product__product_name')
        owned_products = owned_products.order_by('product__product_name')
        paginator = PageNumberPagination()
        paginated_products = paginator.paginate_queryset(owned_products, request)
        serializer = ShopOwnerProductsSerializer(paginated_products, many=True)
        return paginator.get_paginated_response(serializer.data)
    
class ShopOwnerActiveProductsView(APIView):
    """View Active products owned by shop owner (their inventory)"""
    permission_classes = [IsAuthenticated,HasModuleAccess ]
    required_permission = "shop-access"
    def get(self, request):
        shop_owner = request.user
        owned_products = ShopOwnerProducts.objects.filter(
            shop_owner=shop_owner,
            is_active= True,
            quantity__gt=0  
        ).select_related('product', 'source_manager').order_by('product__product_name')
        owned_products = owned_products.order_by('product__product_name')
        paginator = PageNumberPagination()
        paginated_products = paginator.paginate_queryset(owned_products, request)
        serializer = ShopOwnerProductsSerializer(paginated_products, many=True)
        return paginator.get_paginated_response(serializer.data)


class CancelShopOrderView(APIView):
    """Cancel a shop owner order (only if not yet fulfilled)"""
    permission_classes = [IsAuthenticated, HasModuleAccess ]
    required_permission = "shop-access"
    @transaction.atomic
    def put(self, request, order_id):
        order = get_object_or_404(
            ShopOwnerOrders,
            id=order_id,
            shop_owner=request.user
        )
        
        # Check if order can be cancelled
        if order.status in ['completed', 'cancelled']:
            return Response({
                'error': f'Cannot cancel order with status: {order.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Cancel all pending manager requests
            from .models import ManagerRequest
            cancelled_requests = ManagerRequest.objects.filter(
                order_item__order=order,
                status='pending'
            ).update(
                status='cancelled',
                response_date=timezone.now()
            )
            
            # Update order status
            order.status = 'cancelled'
            order.save()
            
            return Response({
                'message': f'Order cancelled successfully. {cancelled_requests} pending requests were cancelled.',
                'order': ShopOwnerOrderSerializer(order).data
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to cancel order: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ShopOrderStatusView(APIView):
    """Get order fulfillment status summary"""
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-access"
    def get(self, request, order_id):
        order = get_object_or_404(
            ShopOwnerOrders,
            id=order_id,
            shop_owner=request.user
        )
        total_items = order.order_items.count()
        fulfilled_items = order.order_items.filter(fulfilled_by_manager__isnull=False).count()
        pending_items = total_items - fulfilled_items
        items_status = []
        for item in order.order_items.all():
            items_status.append({
                'item_id': item.id,
                'product_name': item.product.product_name,
                'requested_quantity': item.requested_quantity,
                'fulfilled_quantity': item.fulfilled_quantity or 0,
                'fulfilled_by_manager': f"{item.fulfilled_by_manager.first_name} {item.fulfilled_by_manager.last_name}" if item.fulfilled_by_manager else None,
                'actual_price': item.actual_price,
                'status': 'fulfilled' if item.fulfilled_by_manager else 'pending'
            })
        
        return Response({
            'order_number': order.order_number,
            'order_status': order.status,
            'fulfillment_summary': {
                'total_items': total_items,
                'fulfilled_items': fulfilled_items,
                'pending_items': pending_items,
                'completion_percentage': round((fulfilled_items / total_items) * 100, 2) if total_items > 0 else 0
            },
            'items_status': items_status,
            'total_amount': order.total_amount,
            'created_at': order.created_at
        })


class UpdateShopOwnerProductPriceView(APIView):
    permission_classes = [IsAuthenticated,HasModuleAccess ]
    required_permission = "shop-access"
    
    def put(self, request, product_id):
        shop_owner_product = get_object_or_404(
            ShopOwnerProducts,
            id=product_id,
            shop_owner=request.user
        )
        
        new_selling_price = request.data.get('selling_price')
        try:
            new_selling_price = Decimal(new_selling_price)
        except (TypeError):
            return Response({"error": "Invalid selling price"},status=status.HTTP_400_BAD_REQUEST)
        
        if not new_selling_price or new_selling_price <= 0:
            return Response({
                'error': 'Valid selling price is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate selling price is not below purchase price (prevent losses)
        if Decimal(new_selling_price) < shop_owner_product.purchase_price:
            return Response({
                'error': f'Selling price cannot be below purchase price: ₹{shop_owner_product.purchase_price}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        shop_owner_product.selling_price = new_selling_price
        shop_owner_product.save()
        
        # Calculate profit margin
        profit_margin = ((Decimal(new_selling_price) - shop_owner_product.purchase_price) / shop_owner_product.purchase_price) * 100
        
        return Response({
            'message': 'Selling price updated successfully',
            'product': ShopOwnerProductsSerializer(shop_owner_product).data,
            'profit_margin': round(profit_margin, 2)
        })


class ShopOwnerConfirmDeliveryView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-access"    
    @transaction.atomic
    def post(self, request, order_id):
        shop_order = get_object_or_404(
            ShopOwnerOrders,
            id=order_id,
            shop_owner=request.user,
            status='delivery_in_progress'
        )
        products_added = 0
        for order_item in shop_order.order_items.all():
            if order_item.fulfilled_by_manager:  
                shop_owner_product, created = ShopOwnerProducts.objects.get_or_create(
                    shop_owner=request.user,
                    product=order_item.product,
                    defaults={
                        'quantity': order_item.fulfilled_quantity,
                        'purchase_price': order_item.actual_price,
                        'selling_price': order_item.actual_price,
                        'source_manager': order_item.fulfilled_by_manager,
                        'delivery_confirmed': True
                    }
                )
                
                if not created:
                    shop_owner_product.quantity += order_item.fulfilled_quantity
                    shop_owner_product.purchase_price = order_item.actual_price
                    shop_owner_product.is_active = True
                    shop_owner_product.delivery_confirmed = True
                    shop_owner_product.save()
                
                products_added += 1

        ManagerRequest.objects.filter(
            order_item__order=shop_order,
            status='accepted'
        ).update(status='fulfilled')

        shop_order.status = 'completed'
        shop_order.save()
        
        return Response({
            'message': f'Delivery confirmed! {products_added} products added to your inventory',
            'order_status': 'completed',
            'products_added': products_added
        })


class ToggleShopProductActiveView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-access"
    
    def post(self, request, product_id):
        shop_product = get_object_or_404(
            ShopOwnerProducts,
            id=product_id,
            shop_owner=request.user,
        )
        
        shop_product.is_active = not shop_product.is_active
        shop_product.save()
        
        status_text = "activated" if shop_product.is_active else "deactivated"
        return Response({
            'message': f'Product {status_text} successfully',
            'product_name': shop_product.product.product_name,
            'is_active': shop_product.is_active
        })


class ShopOwnerProductPurchaseHistoryView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-access"
    
    def get(self, request, product_id):
        try:
            # Get the shop owner product
            shop_product = get_object_or_404(
                ShopOwnerProducts,
                id=product_id,
                shop_owner=request.user
            )
            
            # Get all purchase history for this product by this shop owner
            purchase_history = []
            
            # Find all orders that contain this product and were fulfilled
            order_items = ShopOrderItem.objects.filter(
                product=shop_product.product,
                order__shop_owner=request.user,
                fulfilled_by_manager__isnull=False  # Only fulfilled orders
            ).select_related('order').order_by('-order__created_at')
            
            for order_item in order_items:
                purchase_history.append({
                    'purchase_date': order_item.order.created_at.date(),
                    'quantity': order_item.fulfilled_quantity,
                    'order_number': order_item.order.order_number,
                    'purchase_price': order_item.actual_price,
                    'manager_name': f"{order_item.fulfilled_by_manager.first_name} {order_item.fulfilled_by_manager.last_name}",
                    'order_status': order_item.order.status
                })
            
            return Response({
                'product_info': {
                    'product_name': shop_product.product.product_name,
                    'product_sku': shop_product.product.sku_code,
                    'current_quantity': shop_product.quantity,
                    'current_selling_price': shop_product.selling_price,
                    'is_active': shop_product.is_active
                },
                'purchase_history': purchase_history,
                'total_purchases': len(purchase_history),
                'total_quantity_purchased': sum(item['quantity'] for item in purchase_history)
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to fetch purchase history: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ManagerFulfilledOrdersListView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-request"
    
    def get(self, request):
        fulfilled_orders = ShopOwnerOrders.objects.filter(
            order_items__fulfilled_by_manager=request.user
        ).distinct().select_related('shop_owner').prefetch_related('order_items')
        
        orders_data = []
        for order in fulfilled_orders:
            manager_items = order.order_items.filter(
                fulfilled_by_manager=request.user
            )
            
            total_amount = sum(
                item.fulfilled_quantity * item.actual_price 
                for item in manager_items
            )
            
            orders_data.append({
                'id': order.id,
                'order_number': order.order_number,
                'shop_owner_name': f"{order.shop_owner.first_name} {order.shop_owner.last_name}",
                'order_status': order.status,
                'items_count': manager_items.count(),
                'total_amount': total_amount,
                'created_at': order.created_at,
            })
        
        paginator = PageNumberPagination()
        paginated_orders = paginator.paginate_queryset(orders_data, request)
        return paginator.get_paginated_response(paginated_orders)

class ManagerOrderDetailView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-request"
    
    def get(self, request, order_id):
        order = get_object_or_404(
            ShopOwnerOrders,
            id=order_id,
            order_items__fulfilled_by_manager=request.user
        )
        
        # Get only items fulfilled by this manager
        manager_items = order.order_items.filter(
            fulfilled_by_manager=request.user
        ).select_related('product')
        
        items_data = []
        total_amount = 0
        
        for item in manager_items:
            item_total = item.fulfilled_quantity * item.actual_price
            total_amount += item_total
            
            items_data.append({
                'product_name': item.product.product_name,
                'product_sku': item.product.sku_code,
                'quantity': item.fulfilled_quantity,
                'unit_price': item.actual_price,
                'total_price': item_total,
            })
        
        return Response({
            'order_number': order.order_number,
            'shop_owner_name': f"{order.shop_owner.first_name} {order.shop_owner.last_name}",
            'shop_owner_mobile_number': order.shop_owner.mobile_number,
            'shop_owner_email': order.shop_owner.email,
            'order_status': order.status,
            'created_at': order.created_at,
            'items': items_data,
            'total_amount': total_amount,
        })
