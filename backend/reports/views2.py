from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, F, ExpressionWrapper, FloatField
from django.db.models.functions import TruncDate, TruncMonth, TruncYear
from datetime import datetime, timedelta
from django.utils import timezone
from accounts.models import UserMaster
from shop.models import ShopOwnerOrders, ShopOrderItem
from accounts.premissions import HasModuleAccess, IsAdminRole
from django.utils.dateparse import parse_date
from inventory.models import StockBatch
from broker.models import Broker

#shop Report
class ManagerProductSalesReportView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "shop-request"
    def get(self, request):
        try:
            user = get_object_or_404(UserMaster, pk=request.user.id)
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            filter_type = request.GET.get('filter_type', 'month')
            shop_owner_id = request.GET.get('shop_owner_id')
            
            # Parse dates
            if start_date:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            else:
                # Default to last 30 days if no start date
                start_date = timezone.now().date() - timedelta(days=30)
            
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            else:
                end_date = timezone.now().date()
            
            total_days = (end_date - start_date).days + 1
            if total_days <= 0:
                total_days = 1
            
            shop_order_items = ShopOrderItem.objects.filter(
                fulfilled_by_manager=user,
                fulfilled_quantity__isnull=False,
                actual_price__isnull=False
            )
            
            if start_date:
                shop_order_items = shop_order_items.filter(created_at__date__gte=start_date)
            if end_date:
                shop_order_items = shop_order_items.filter(created_at__date__lte=end_date)
            
            if shop_owner_id:
                shop_order_items = shop_order_items.filter(order__shop_owner_id=shop_owner_id)
            
            # Calculate totals
            total_quantity = shop_order_items.aggregate(
                total_qty=Sum('fulfilled_quantity')
            )['total_qty'] or 0
            
            total_revenue = shop_order_items.aggregate(
                total_rev=Sum(F('actual_price') * F('fulfilled_quantity'))
            )['total_rev'] or 0
            
            total_items = shop_order_items.count()
            
            trunc_func = {
                'day': TruncDate,
                'month': TruncMonth,
                'year': TruncYear
            }.get(filter_type, TruncMonth)
            
            trends = shop_order_items.annotate(
                period=trunc_func('created_at')
            ).values('period').annotate(
                quantity_sold=Sum('fulfilled_quantity'),
                revenue_earned=Sum(F('actual_price') * F('fulfilled_quantity')),
                items_sold=Count('id')
            ).order_by('period')

            products = shop_order_items.values(
                'product__product_name', 'product__id'
            ).annotate(
                total_quantity_sold=Sum('fulfilled_quantity'),
                total_revenue=Sum(F('actual_price') * F('fulfilled_quantity')),
                total_orders=Count('order_id', distinct=True),
                total_shop_owners=Count('order__shop_owner_id', distinct=True),

                avg_daily_quantity=ExpressionWrapper(
                    Sum('fulfilled_quantity') * 1.0 / total_days,
                    output_field=FloatField()
                ),

                avg_daily_revenue=ExpressionWrapper(
                    Sum(F('actual_price') * F('fulfilled_quantity')) * 1.0 / total_days,
                    output_field=FloatField()
                )
            ).order_by('-avg_daily_quantity')
            
            # Shop owners who bought from this manager
            shop_owners_summary = shop_order_items.values(
                'order__shop_owner__first_name', 'order__shop_owner__last_name',
                'order__shop_owner__id'
            ).annotate(
                total_quantity=Sum('fulfilled_quantity'),
                total_revenue=Sum(F('actual_price') * F('fulfilled_quantity')),
                total_orders=Count('order_id', distinct=True),
                unique_products=Count('product_id', distinct=True)
            ).order_by('-total_revenue')
            
            response_data = {
                "success": True,
                "data": {
                    "filter_type": filter_type,
                    "date_range": {
                        "start_date": start_date.isoformat(),
                        "end_date": end_date.isoformat(),
                        "total_days": total_days
                    },
                    "filtered_shop_owner_id": shop_owner_id,
                    "summary": {
                        "total_quantity_sold": total_quantity,
                        "total_revenue_earned": float(total_revenue),
                        "total_items_sold": total_items,
                        "unique_products_sold": shop_order_items.values('product_id').distinct().count(),
                        "unique_shop_owners_served": shop_order_items.values('order__shop_owner_id').distinct().count(),
                        "average_item_value": float(total_revenue / total_items) if total_items > 0 else 0,
                        "daily_average_quantity": float(total_quantity / total_days),
                        "daily_average_revenue": float(total_revenue / total_days)
                    },
                    "trends": [
                        {
                            "period": trend['period'].isoformat() if trend['period'] else None,
                            "quantity_sold": trend['quantity_sold'],
                            "revenue_earned": float(trend['revenue_earned'] or 0),
                            "items_sold": trend['items_sold']
                        }
                        for trend in trends
                    ],
                    "products": [
                        {
                            "product_id": product['product__id'],
                            "product_name": product['product__product_name'],
                            "total_quantity_sold": product['total_quantity_sold'],
                            "total_revenue": float(product['total_revenue'] or 0),
                            "total_orders": product['total_orders'],
                            "shop_owners_bought": product['total_shop_owners'],
                            "avg_daily_quantity": round(float(product['avg_daily_quantity'] or 0), 2),  
                            "avg_daily_revenue": round(float(product['avg_daily_revenue'] or 0), 2),   
                            "sales_velocity": "High" if product['avg_daily_quantity'] and product['avg_daily_quantity'] > 1 else "Medium" if product['avg_daily_quantity'] and product['avg_daily_quantity'] > 0.3 else "Low"
                        }
                        for product in products
                    ],
                    "shop_owners": [
                        {
                            "shop_owner_id": owner['order__shop_owner__id'],
                            "shop_owner_name": f"{owner['order__shop_owner__first_name']} {owner['order__shop_owner__last_name']}",
                            "total_quantity_bought": owner['total_quantity'],
                            "total_revenue_generated": float(owner['total_revenue'] or 0),
                            "total_orders": owner['total_orders'],
                            "unique_products_bought": owner['unique_products']
                        }
                        for owner in shop_owners_summary
                    ]
                },
                "message": "Manager product sales report retrieved successfully"
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response(
                {"error": f"Invalid date format. Use YYYY-MM-DD: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Admin shop report
class AdminManagerProductSalesReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request):
        try:
            user = get_object_or_404(UserMaster, pk=request.user.id)
            
            # Get query parameters
            manager_id = request.GET.get('manager_id')  # Filter by specific manager
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            filter_type = request.GET.get('filter_type', 'month')
            
            # Parse dates
            if start_date:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            else:
                start_date = timezone.now().date() - timedelta(days=30)
            
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            else:
                end_date = timezone.now().date()
            
            # Calculate total days
            total_days = (end_date - start_date).days + 1
            if total_days <= 0:
                total_days = 1
            
            # Base queryset - All fulfilled shop order items
            shop_order_items = ShopOrderItem.objects.filter(
                fulfilled_by_manager__isnull=False,
                fulfilled_quantity__isnull=False,
                actual_price__isnull=False
            )
            
            # Apply filters
            if manager_id:
                shop_order_items = shop_order_items.filter(fulfilled_by_manager_id=manager_id)
            if start_date:
                shop_order_items = shop_order_items.filter(created_at__date__gte=start_date)
            if end_date:
                shop_order_items = shop_order_items.filter(created_at__date__lte=end_date)
            
            # Calculate totals
            total_quantity = shop_order_items.aggregate(
                total_qty=Sum('fulfilled_quantity')
            )['total_qty'] or 0
            
            total_revenue = shop_order_items.aggregate(
                total_rev=Sum('actual_price')
            )['total_rev'] or 0
            
            # Products with manager info and sales velocity
            products = shop_order_items.values(
                'product__product_name', 'product__id',
                'fulfilled_by_manager__first_name', 'fulfilled_by_manager__last_name',
                'fulfilled_by_manager__id'
            ).annotate(
                total_quantity_sold=Sum('fulfilled_quantity'),
                total_revenue=Sum('actual_price'),
                avg_daily_quantity=ExpressionWrapper(
                    Sum('fulfilled_quantity') * 1.0 / total_days,
                    output_field=FloatField()
                )
            ).order_by('-avg_daily_quantity')
            
            response_data = {
                "success": True,
                "data": {
                    "filters_applied": {
                        "manager_id": manager_id,
                        "date_range": {
                            "start_date": start_date.isoformat(),
                            "end_date": end_date.isoformat(),
                            "total_days": total_days
                        },
                        "filter_type": filter_type
                    },
                    "summary": {
                        "total_quantity_sold": total_quantity,
                        "total_revenue_earned": float(total_revenue),
                        "active_managers": shop_order_items.values('fulfilled_by_manager_id').distinct().count(),
                        "active_shop_owners": shop_order_items.values('order__shop_owner_id').distinct().count(),
                        "unique_products": shop_order_items.values('product_id').distinct().count()
                    },
                    "products": [
                        {
                            "product_id": product['product__id'],
                            "product_name": product['product__product_name'],
                            "manager_id": product['fulfilled_by_manager__id'],
                            "manager_name": f"{product['fulfilled_by_manager__first_name']} {product['fulfilled_by_manager__last_name']}",
                            "total_quantity_sold": product['total_quantity_sold'],
                            "total_revenue": float(product['total_revenue'] or 0),
                            "avg_daily_quantity": round(float(product['avg_daily_quantity'] or 0), 2),
                            "sales_velocity": "High" if product['avg_daily_quantity'] and product['avg_daily_quantity'] > 1 else "Medium" if product['avg_daily_quantity'] and product['avg_daily_quantity'] > 0.3 else "Low"
                        }
                        for product in products
                    ]
                },
                "message": "Admin manager product sales report retrieved successfully"
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

#inventory Report
class InventoryReportView(APIView):
    permission_classes = [IsAuthenticated,HasModuleAccess]
    required_permission = "inventory-report"
    
    def get(self, request):
        user = request.user
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        status_filter = request.query_params.get('status')
        filter_type = request.query_params.get('filter_type', 'custom')  
        
        # Base queryset
        queryset = StockBatch.objects.filter(user=user)
        
        # Handle date filtering
        if start_date_str:
            start_date = parse_date(start_date_str)
            if start_date:
                queryset = queryset.filter(created_at__date__gte=start_date)
        
        if end_date_str:
            end_date = parse_date(end_date_str)
            if end_date:
                queryset = queryset.filter(created_at__date__lte=end_date)
                
        # Handle automatic date ranges
        if filter_type == 'month' and not start_date_str:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)
            queryset = queryset.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
            start_date_str = start_date.strftime('%Y-%m-%d')
            end_date_str = end_date.strftime('%Y-%m-%d')
            
        # Status filter
        if status_filter and status_filter in dict(StockBatch.BATCH_STATUS_CHOICES):
            queryset = queryset.filter(batch_status=status_filter)
        
        # Calculate date range info
        if start_date_str and end_date_str:
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)
            total_days = (end_date - start_date).days + 1 if start_date and end_date else 0
        else:
            total_days = 0
        
        total_batches = queryset.count()
        total_stock_value = sum([
            float(batch.original_quantity) * float(batch.purchase_price) 
            for batch in queryset
        ])
        total_commission = sum([
            float(batch.broker_commission_amount or 0) 
            for batch in queryset
        ])
        total_tax = sum([
            float(batch.tax_amount or 0) 
            for batch in queryset
        ])
        total_with_tax = total_stock_value + total_tax
        
        status_breakdown = queryset.values('batch_status').annotate(
            count=Count('id'),
            total_value=Sum('quantity')
        ).order_by('batch_status')
        
        products_by_status = []
        for status_choice, status_label in StockBatch.BATCH_STATUS_CHOICES:
            status_batches = queryset.filter(batch_status=status_choice).select_related('product', 'vendor', 'broker')
            
            if status_batches.exists():
                status_products = []
                for batch in status_batches:
                    status_products.append({
                        'batch_id': batch.id,
                        'product_id': batch.product.id,
                        'product_name': batch.product.product_name,
                        'product_sku': getattr(batch.product, 'product_sku', 'N/A'),
                        'quantity': batch.quantity,
                        'original_quantity': batch.original_quantity,
                        'purchase_price': float(batch.purchase_price),
                        'selling_price': float(batch.selling_price),
                        'vendor_name': batch.vendor.vendor_name,
                        'broker_name': batch.broker.broker_name if batch.broker else None,
                        'broker_commission': float(batch.broker_commission_amount) if batch.broker_commission_amount else 0.0,
                        'tax_amount': float(batch.tax_amount) if batch.tax_amount else 0.0,
                        'reference_number': batch.reference_number or 'N/A',
                        'manufacture_date': batch.manufacture_date.strftime('%Y-%m-%d') if batch.manufacture_date else None,
                        'expiry_date': batch.expiry_date.strftime('%Y-%m-%d') if batch.expiry_date else None,
                        'created_at': batch.created_at.strftime('%Y-%m-%d'),
                        'is_expired': batch.is_expired(),
                        'batch_status': batch.batch_status,
                        'batch_status_label': status_label
                    })
                
                products_by_status.append({
                    'status': status_choice,
                    'status_label': status_label,
                    'count': len(status_products),
                    'products': status_products
                })
        response_data = {
            "success": True,
            "data": {
                "filter_type": filter_type,
                "date_range": {
                    "start_date": start_date_str,
                    "end_date": end_date_str,
                    "total_days": total_days
                },
                "filtered_status": status_filter,
                "summary": {
                    "total_batches": total_batches,
                    "total_stock_value": round(total_stock_value, 2),
                    "total_commission": round(total_commission, 2),
                    "total_tax": round(total_tax, 2),
                    "total_with_tax": round(total_with_tax, 2),
                    "average_batch_value": round(total_stock_value / total_batches, 2) if total_batches > 0 else 0.0,
                    "active_batches": queryset.filter(batch_status='active').count(),
                    "expired_batches": queryset.filter(batch_status='expired').count(),
                },
                "status_breakdown": [
                    {
                        "status": item['batch_status'],
                        "status_label": dict(StockBatch.BATCH_STATUS_CHOICES)[item['batch_status']],
                        "count": item['count'],
                        "percentage": round((item['count'] / total_batches) * 100, 1) if total_batches > 0 else 0.0
                    }
                    for item in status_breakdown
                ],
                "products_by_status": products_by_status
            },
            "message": "Inventory report retrieved successfully"
        }
        
        return Response(response_data)
    
# Admin inventory Report
class AdminInventoryReportView(APIView):
    permission_classes = [IsAuthenticated,IsAdminRole]  
    
    def get(self, request):
        user_id = request.query_params.get('user_id') 
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        status_filter = request.query_params.get('status')
        filter_type = request.query_params.get('filter_type', 'custom')
        
        queryset = StockBatch.objects.all()
        target_user_name = "All Users"
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            try:
                target_user = UserMaster.objects.get(id=user_id)
                target_user_name = f"{target_user.first_name} {target_user.last_name}".strip()
            except UserMaster.DoesNotExist:
                return Response({
                    "success": False,
                    "error": f"User with id {user_id} not found"
                }, status=404)
        
        if start_date_str:
            start_date = parse_date(start_date_str)
            if start_date:
                queryset = queryset.filter(created_at__date__gte=start_date)
        
        if end_date_str:
            end_date = parse_date(end_date_str)
            if end_date:
                queryset = queryset.filter(created_at__date__lte=end_date)
                
        if filter_type == 'month' and not start_date_str:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)
            queryset = queryset.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
            start_date_str = start_date.strftime('%Y-%m-%d')
            end_date_str = end_date.strftime('%Y-%m-%d')
            
        # Status filter
        if status_filter and status_filter in dict(StockBatch.BATCH_STATUS_CHOICES):
            queryset = queryset.filter(batch_status=status_filter)
        
        # Calculate date range info
        if start_date_str and end_date_str:
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)
            total_days = (end_date - start_date).days + 1 if start_date and end_date else 0
        else:
            total_days = 0
        
        total_batches = queryset.count()
        total_stock_value = sum([
            float(batch.original_quantity) * float(batch.purchase_price) 
            for batch in queryset
        ])
        total_commission = sum([
            float(batch.broker_commission_amount or 0) 
            for batch in queryset
        ])
        total_tax = sum([
            float(batch.tax_amount or 0) 
            for batch in queryset
        ])
        
        total_with_tax = total_stock_value + total_tax
        
        # Status breakdown with counts
        status_breakdown = queryset.values('batch_status').annotate(
            count=Count('id')
        ).order_by('batch_status')
        
        # Products by status breakdown
        products_by_status = []
        for status_choice, status_label in StockBatch.BATCH_STATUS_CHOICES:
            status_batches = queryset.filter(batch_status=status_choice).select_related('product', 'vendor', 'broker')
            
            if status_batches.exists():
                status_products = []
                for batch in status_batches:
                    status_products.append({
                        'batch_id': batch.id,
                        'product_id': batch.product.id,
                        'product_name': batch.product.product_name,
                        'product_sku': getattr(batch.product, 'product_sku', 'N/A'),
                        'quantity': batch.quantity,  # Current remaining stock
                        'original_quantity': batch.original_quantity,  # Original purchased
                        'purchase_price': float(batch.purchase_price),
                        'selling_price': float(batch.selling_price),
                        'vendor_name': batch.vendor.vendor_name,
                        'broker_name': batch.broker.broker_name if batch.broker else None,
                        'broker_commission': float(batch.broker_commission_amount) if batch.broker_commission_amount else 0.0,
                        'tax_amount': float(batch.tax_amount) if batch.tax_amount else 0.0,
                        'reference_number': batch.reference_number or 'N/A',
                        'manufacture_date': batch.manufacture_date.strftime('%Y-%m-%d') if batch.manufacture_date else None,
                        'expiry_date': batch.expiry_date.strftime('%Y-%m-%d') if batch.expiry_date else None,
                        'created_at': batch.created_at.strftime('%Y-%m-%d'),
                        'is_expired': batch.is_expired(),
                        'batch_status': batch.batch_status,
                        'batch_status_label': status_label,
                        'user_id': batch.user.id,
                        'user_name': f"{batch.user.first_name} {batch.user.last_name}".strip(),
                    })
                
                products_by_status.append({
                    'status': status_choice,
                    'status_label': status_label,
                    'count': len(status_products),
                    'products': status_products
                })
        
        # Response data matching your structure
        response_data = {
            "success": True,
            "data": {
                "filter_type": filter_type,
                "date_range": {
                    "start_date": start_date_str,
                    "end_date": end_date_str,
                    "total_days": total_days
                },
                "filtered_user_id": int(user_id) if user_id else None, 
                "target_user_name": target_user_name,  
                "filtered_status": status_filter,
                "summary": {
                    "total_batches": total_batches,
                    "total_stock_value": round(total_stock_value, 2),
                    "total_commission": round(total_commission, 2),
                    "total_tax": round(total_tax, 2),
                    "total_with_tax": round(total_with_tax, 2), 
                    "average_batch_value": round(total_stock_value / total_batches, 2) if total_batches > 0 else 0.0,
                    "active_batches": queryset.filter(batch_status='active').count(),
                    "expired_batches": queryset.filter(batch_status='expired').count(),
                },
                "status_breakdown": [
                    {
                        "status": item['batch_status'],
                        "status_label": dict(StockBatch.BATCH_STATUS_CHOICES)[item['batch_status']],
                        "count": item['count'],
                        "percentage": round((item['count'] / total_batches) * 100, 1) if total_batches > 0 else 0.0
                    }
                    for item in status_breakdown
                ],
                "products_by_status": products_by_status
            },
            "message": f"Admin inventory report for {target_user_name} retrieved successfully"
        }
        
        return Response(response_data)
    
#broker report
class BrokerCommissionReportView(APIView):
    permission_classes = [IsAuthenticated,HasModuleAccess]
    required_permission = "broker-report"
    
    def get(self, request):
        user = request.user
        broker_id = request.query_params.get('broker_id') 
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        filter_type = request.query_params.get('filter_type', 'custom')

        queryset = StockBatch.objects.filter(
            user=user,
            broker__isnull=False,  
            broker_commission_amount__gt=0  
        )

        target_broker_name = "All Brokers"
        if broker_id:
            queryset = queryset.filter(broker_id=broker_id)
            try:
                target_broker = Broker.objects.get(id=broker_id, created_by=user)
                target_broker_name = target_broker.broker_name
            except Broker.DoesNotExist:
                return Response({
                    "success": False,
                    "error": f"Broker with id {broker_id} not found or not accessible"
                }, status=404)
        
        # Handle date filtering
        if start_date_str:
            start_date = parse_date(start_date_str)
            if start_date:
                queryset = queryset.filter(created_at__date__gte=start_date)
        
        if end_date_str:
            end_date = parse_date(end_date_str)
            if end_date:
                queryset = queryset.filter(created_at__date__lte=end_date)
                
        # Handle automatic date ranges
        if filter_type == 'month' and not start_date_str:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)
            queryset = queryset.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
            start_date_str = start_date.strftime('%Y-%m-%d')
            end_date_str = end_date.strftime('%Y-%m-%d')
        
        # Calculate date range info
        if start_date_str and end_date_str:
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)
            total_days = (end_date - start_date).days + 1 if start_date and end_date else 0
        else:
            total_days = 0
        
        # Calculate commission statistics
        total_commission = queryset.aggregate(
            total=Sum('broker_commission_amount')
        )['total'] or 0.0
        
        total_batches = queryset.count()
        total_purchase_value = sum([
            float(batch.original_quantity) * float(batch.purchase_price) 
            for batch in queryset
        ])
        
        # Commission breakdown by broker
        broker_breakdown = queryset.values(
            'broker_id', 'broker__broker_name'
        ).annotate(
            commission_earned=Sum('broker_commission_amount'),
            batches_count=Count('id')
        ).order_by('-commission_earned')
        
        # Commission trend by month (for graphs)
        commission_trends = []
        if queryset.exists():
            from django.db.models.functions import TruncMonth
            monthly_trends = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                monthly_commission=Sum('broker_commission_amount'),
                monthly_batches=Count('id')
            ).order_by('month')
            
            commission_trends = [
                {
                    "period": item['month'].strftime('%Y-%m-%d'),
                    "commission_earned": float(item['monthly_commission'] or 0),
                    "batches_count": item['monthly_batches']
                }
                for item in monthly_trends
            ]
        
        # Detailed batch breakdown
        batch_details = []
        for batch in queryset.select_related('product', 'vendor', 'broker').order_by('-created_at'):
            batch_details.append({
                'batch_id': batch.id,
                'product_id': batch.product.id,
                'product_name': batch.product.product_name,
                'product_sku': getattr(batch.product, 'product_sku', 'N/A'),
                'vendor_name': batch.vendor.vendor_name,
                'broker_id': batch.broker.id, 
                'broker_name': batch.broker.broker_name,
                'quantity': batch.quantity,
                'original_quantity': batch.original_quantity,
                'purchase_price': float(batch.purchase_price),
                'total_purchase_value': float(batch.original_quantity) * float(batch.purchase_price),
                'commission_percent': float(batch.broker_commission_percent or 0),
                'commission_amount': float(batch.broker_commission_amount or 0),
                'reference_number': batch.reference_number or 'N/A',
                'created_at': batch.created_at.strftime('%Y-%m-%d'),
                'batch_status': batch.batch_status,
            })
        
        # Response data matching your structure
        response_data = {
            "success": True,
            "data": {
                "filter_type": filter_type,
                "date_range": {
                    "start_date": start_date_str,
                    "end_date": end_date_str,
                    "total_days": total_days
                },
                "filtered_broker_id": int(broker_id) if broker_id else None, 
                "target_broker_name": target_broker_name,  
                "summary": {
                    "total_commission_earned": round(float(total_commission), 2),
                    "total_batches": total_batches,
                    "total_purchase_value": round(total_purchase_value, 2),
                    "average_commission_per_batch": round(float(total_commission) / total_batches, 2) if total_batches > 0 else 0.0,
                    "commission_percentage_of_purchases": round((float(total_commission) / total_purchase_value) * 100, 2) if total_purchase_value > 0 else 0.0,
                    "daily_average_commission": round(float(total_commission) / total_days, 2) if total_days > 0 else 0.0,
                    "unique_brokers": len(set(batch.broker.id for batch in queryset)) if queryset.exists() else 0,
                },
                "broker_breakdown": [
                    {
                        "broker_id": item['broker_id'],
                        "broker_name": item['broker__broker_name'],
                        "commission_earned": float(item['commission_earned'] or 0),
                        "batches_count": item['batches_count'],
                        "percentage_of_total": round((float(item['commission_earned'] or 0) / float(total_commission)) * 100, 1) if total_commission > 0 else 0.0
                    }
                    for item in broker_breakdown
                ],
                "trends": commission_trends,
                "batch_details": batch_details
            },
            "message": f"Broker commission report for {target_broker_name} retrieved successfully"
        }
        
        return Response(response_data)
    
# admin broker report
class AdminBrokerCommissionReportView(APIView):
    permission_classes = [IsAuthenticated,IsAdminRole]
    
    def get(self, request):
        broker_id = request.query_params.get('broker_id') 
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        filter_type = request.query_params.get('filter_type', 'custom')

        queryset = StockBatch.objects.filter(
            broker__isnull=False,  
            broker_commission_amount__gt=0  
        )

        target_broker_name = "All Brokers"
        if broker_id:
            queryset = queryset.filter(broker_id=broker_id)
            try:
                target_broker = Broker.objects.get(id=broker_id)
                target_broker_name = target_broker.broker_name
            except Broker.DoesNotExist:
                return Response({
                    "success": False,
                    "error": f"Broker with id {broker_id} not found or not accessible"
                }, status=404)
        
        # Handle date filtering
        if start_date_str:
            start_date = parse_date(start_date_str)
            if start_date:
                queryset = queryset.filter(created_at__date__gte=start_date)
        
        if end_date_str:
            end_date = parse_date(end_date_str)
            if end_date:
                queryset = queryset.filter(created_at__date__lte=end_date)
                
        # Handle automatic date ranges
        if filter_type == 'month' and not start_date_str:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)
            queryset = queryset.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
            start_date_str = start_date.strftime('%Y-%m-%d')
            end_date_str = end_date.strftime('%Y-%m-%d')
        
        # Calculate date range info
        if start_date_str and end_date_str:
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)
            total_days = (end_date - start_date).days + 1 if start_date and end_date else 0
        else:
            total_days = 0
        
        # Calculate commission statistics
        total_commission = queryset.aggregate(
            total=Sum('broker_commission_amount')
        )['total'] or 0.0
        
        total_batches = queryset.count()
        total_purchase_value = sum([
            float(batch.original_quantity) * float(batch.purchase_price) 
            for batch in queryset
        ])
        
        # Commission breakdown by broker
        broker_breakdown = queryset.values(
            'broker_id', 'broker__broker_name'
        ).annotate(
            commission_earned=Sum('broker_commission_amount'),
            batches_count=Count('id')
        ).order_by('-commission_earned')
        
        # Commission trend by month (for graphs)
        commission_trends = []
        if queryset.exists():
            from django.db.models.functions import TruncMonth
            monthly_trends = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                monthly_commission=Sum('broker_commission_amount'),
                monthly_batches=Count('id')
            ).order_by('month')
            
            commission_trends = [
                {
                    "period": item['month'].strftime('%Y-%m-%d'),
                    "commission_earned": float(item['monthly_commission'] or 0),
                    "batches_count": item['monthly_batches']
                }
                for item in monthly_trends
            ]
        
        # Detailed batch breakdown
        batch_details = []
        for batch in queryset.select_related('product', 'vendor', 'broker').order_by('-created_at'):
            batch_details.append({
                'batch_id': batch.id,
                'product_id': batch.product.id,
                'product_name': batch.product.product_name,
                'product_sku': getattr(batch.product, 'product_sku', 'N/A'),
                'vendor_name': batch.vendor.vendor_name,
                'broker_id': batch.broker.id, 
                'broker_name': batch.broker.broker_name,
                'quantity': batch.quantity,
                'original_quantity': batch.original_quantity,
                'purchase_price': float(batch.purchase_price),
                'total_purchase_value': float(batch.original_quantity) * float(batch.purchase_price),
                'commission_percent': float(batch.broker_commission_percent or 0),
                'commission_amount': float(batch.broker_commission_amount or 0),
                'reference_number': batch.reference_number or 'N/A',
                'created_at': batch.created_at.strftime('%Y-%m-%d'),
                'batch_status': batch.batch_status,
            })
        
        # Response data matching your structure
        response_data = {
            "success": True,
            "data": {
                "filter_type": filter_type,
                "date_range": {
                    "start_date": start_date_str,
                    "end_date": end_date_str,
                    "total_days": total_days
                },
                "filtered_broker_id": int(broker_id) if broker_id else None, 
                "target_broker_name": target_broker_name,  
                "summary": {
                    "total_commission_earned": round(float(total_commission), 2),
                    "total_batches": total_batches,
                    "total_purchase_value": round(total_purchase_value, 2),
                    "average_commission_per_batch": round(float(total_commission) / total_batches, 2) if total_batches > 0 else 0.0,
                    "commission_percentage_of_purchases": round((float(total_commission) / total_purchase_value) * 100, 2) if total_purchase_value > 0 else 0.0,
                    "daily_average_commission": round(float(total_commission) / total_days, 2) if total_days > 0 else 0.0,
                    "unique_brokers": len(set(batch.broker.id for batch in queryset)) if queryset.exists() else 0,
                },
                "broker_breakdown": [
                    {
                        "broker_id": item['broker_id'],
                        "broker_name": item['broker__broker_name'],
                        "commission_earned": float(item['commission_earned'] or 0),
                        "batches_count": item['batches_count'],
                        "percentage_of_total": round((float(item['commission_earned'] or 0) / float(total_commission)) * 100, 1) if total_commission > 0 else 0.0
                    }
                    for item in broker_breakdown
                ],
                "trends": commission_trends,
                "batch_details": batch_details
            },
            "message": f"Broker commission report for {target_broker_name} retrieved successfully"
        }
        
        return Response(response_data)
    
#Tax Report
class TaxReportView(APIView):
    permission_classes = [IsAuthenticated,HasModuleAccess]
    required_permission = "tax-report"

    def get(self, request):
        user = request.user
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        filter_type = request.query_params.get('filter_type', 'custom')
        queryset = StockBatch.objects.filter(
            user=user,
            tax_amount__gt=0 
        )
        if start_date_str:
            start_date = parse_date(start_date_str)
            if start_date:
                queryset = queryset.filter(created_at__date__gte=start_date)
        
        if end_date_str:
            end_date = parse_date(end_date_str)
            if end_date:
                queryset = queryset.filter(created_at__date__lte=end_date)
                
        # Handle automatic date ranges
        if filter_type == 'month' and not start_date_str:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)
            queryset = queryset.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
            start_date_str = start_date.strftime('%Y-%m-%d')
            end_date_str = end_date.strftime('%Y-%m-%d')
        
        # Calculate date range info
        if start_date_str and end_date_str:
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)
            total_days = (end_date - start_date).days + 1 if start_date and end_date else 0
        else:
            total_days = 0
        
        # Calculate tax statistics
        total_tax_paid = queryset.aggregate(
            total=Sum('tax_amount')
        )['total'] or 0.0
        
        total_batches = queryset.count()
        total_purchase_value = sum([
            float(batch.original_quantity) * float(batch.purchase_price) 
            for batch in queryset
        ])
        
        # Tax breakdown by vendor
        vendor_breakdown = queryset.values(
            'vendor_id', 'vendor__vendor_name'
        ).annotate(
            tax_paid=Sum('tax_amount'),
            batches_count=Count('id')
        ).order_by('-tax_paid')
        
        # Tax trend by month (for graphs)
        tax_trends = []
        if queryset.exists():
            from django.db.models.functions import TruncMonth
            monthly_trends = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                monthly_tax=Sum('tax_amount'),
                monthly_batches=Count('id')
            ).order_by('month')
            
            tax_trends = [
                {
                    "period": item['month'].strftime('%Y-%m-%d'),
                    "tax_paid": float(item['monthly_tax'] or 0),
                    "batches_count": item['monthly_batches']
                }
                for item in monthly_trends
            ]
        
        # Detailed batch breakdown
        batch_details = []
        for batch in queryset.select_related('product', 'vendor', 'broker').order_by('-created_at'):
            batch_details.append({
                'batch_id': batch.id,
                'product_id': batch.product.id,
                'product_name': batch.product.product_name,
                'product_sku': getattr(batch.product, 'product_sku', 'N/A'),
                'vendor_id': batch.vendor.id,
                'vendor_name': batch.vendor.vendor_name,
                'broker_name': batch.broker.broker_name if batch.broker else None,
                'quantity': batch.quantity,
                'original_quantity': batch.original_quantity,
                'purchase_price': float(batch.purchase_price),
                'total_purchase_value': float(batch.original_quantity) * float(batch.purchase_price),
                'tax_amount': float(batch.tax_amount or 0),
                'tax_percentage_of_purchase': round((float(batch.tax_amount or 0) / (float(batch.original_quantity) * float(batch.purchase_price))) * 100, 2),
                'reference_number': batch.reference_number or 'N/A',
                'created_at': batch.created_at.strftime('%Y-%m-%d'),
                'batch_status': batch.batch_status,
            })
        
        # Response data matching your structure
        response_data = {
            "success": True,
            "data": {
                "filter_type": filter_type,
                "date_range": {
                    "start_date": start_date_str,
                    "end_date": end_date_str,
                    "total_days": total_days
                },
                "summary": {
                    "total_tax_paid": round(float(total_tax_paid), 2),
                    "total_batches_with_tax": total_batches,
                    "total_purchase_value": round(total_purchase_value, 2),
                    "tax_percentage_of_purchases": round((float(total_tax_paid) / total_purchase_value) * 100, 2) if total_purchase_value > 0 else 0.0,
                    "average_tax_per_batch": round(float(total_tax_paid) / total_batches, 2) if total_batches > 0 else 0.0,
                    "daily_average_tax": round(float(total_tax_paid) / total_days, 2) if total_days > 0 else 0.0,
                    "unique_vendors": len(set(batch.vendor.id for batch in queryset)) if queryset.exists() else 0,
                },
                "vendor_breakdown": [
                    {
                        "vendor_id": item['vendor_id'],
                        "vendor_name": item['vendor__vendor_name'],
                        "tax_paid": float(item['tax_paid'] or 0),
                        "batches_count": item['batches_count'],
                        "percentage_of_total": round((float(item['tax_paid'] or 0) / float(total_tax_paid)) * 100, 1) if total_tax_paid > 0 else 0.0
                    }
                    for item in vendor_breakdown
                ],
                "trends": tax_trends,
                "batch_details": batch_details
            },
            "message": "Tax report retrieved successfully"
        }
        
        return Response(response_data)

#Admin Tax Report
class AdminTaxReportView(APIView):
    permission_classes = [IsAuthenticated,IsAdminRole] 
    
    def get(self, request):
        user_id = request.query_params.get('user_id') 
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        filter_type = request.query_params.get('filter_type', 'custom')
        
        queryset = StockBatch.objects.filter(
            tax_amount__gt=0 
        )
        
        target_user_name = "All Users"
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            try:
                target_user = UserMaster.objects.get(id=user_id)
                target_user_name = f"{target_user.first_name} {target_user.last_name}".strip()
            except UserMaster.DoesNotExist:
                return Response({
                    "success": False,
                    "error": f"User with id {user_id} not found"
                }, status=404)
        
        # Handle date filtering
        if start_date_str:
            start_date = parse_date(start_date_str)
            if start_date:
                queryset = queryset.filter(created_at__date__gte=start_date)
        
        if end_date_str:
            end_date = parse_date(end_date_str)
            if end_date:
                queryset = queryset.filter(created_at__date__lte=end_date)
                
        # Handle automatic date ranges
        if filter_type == 'month' and not start_date_str:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)
            queryset = queryset.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
            start_date_str = start_date.strftime('%Y-%m-%d')
            end_date_str = end_date.strftime('%Y-%m-%d')
        
        # Calculate date range info
        if start_date_str and end_date_str:
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)
            total_days = (end_date - start_date).days + 1 if start_date and end_date else 0
        else:
            total_days = 0
        
        # Calculate tax statistics
        total_tax_paid = queryset.aggregate(
            total=Sum('tax_amount')
        )['total'] or 0.0
        
        total_batches = queryset.count()
        total_purchase_value = sum([
            float(batch.original_quantity) * float(batch.purchase_price) 
            for batch in queryset
        ])
        
        user_breakdown = queryset.values(
            'user_id', 'user__first_name', 'user__last_name'
        ).annotate(
            tax_paid=Sum('tax_amount'),
            batches_count=Count('id')
        ).order_by('-tax_paid')
        
        # Tax trend by month (for graphs)
        tax_trends = []
        if queryset.exists():
            from django.db.models.functions import TruncMonth
            monthly_trends = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                monthly_tax=Sum('tax_amount'),
                monthly_batches=Count('id')
            ).order_by('month')
            
            tax_trends = [
                {
                    "period": item['month'].strftime('%Y-%m-%d'),
                    "tax_paid": float(item['monthly_tax'] or 0),
                    "batches_count": item['monthly_batches']
                }
                for item in monthly_trends
            ]
        
        # Detailed batch breakdown
        batch_details = []
        for batch in queryset.select_related('product', 'vendor', 'broker', 'user').order_by('-created_at'):
            batch_details.append({
                'batch_id': batch.id,
                'user_id': batch.user.id, 
                'user_name': f"{batch.user.first_name} {batch.user.last_name}".strip(),
                'product_id': batch.product.id,
                'product_name': batch.product.product_name,
                'product_sku': getattr(batch.product, 'product_sku', 'N/A'),
                'vendor_id': batch.vendor.id,
                'vendor_name': batch.vendor.vendor_name,
                'broker_name': batch.broker.broker_name if batch.broker else None,
                'quantity': batch.quantity,
                'original_quantity': batch.original_quantity,
                'purchase_price': float(batch.purchase_price),
                'total_purchase_value': float(batch.original_quantity) * float(batch.purchase_price),
                'tax_amount': float(batch.tax_amount or 0),
                'tax_percentage_of_purchase': round((float(batch.tax_amount or 0) / (float(batch.original_quantity) * float(batch.purchase_price))) * 100, 2),
                'reference_number': batch.reference_number or 'N/A',
                'created_at': batch.created_at.strftime('%Y-%m-%d'),
                'batch_status': batch.batch_status,
            })
        
        # Response data matching your structure
        response_data = {
            "success": True,
            "data": {
                "filter_type": filter_type,
                "date_range": {
                    "start_date": start_date_str,
                    "end_date": end_date_str,
                    "total_days": total_days
                },
                "filtered_user_id": int(user_id) if user_id else None, 
                "target_user_name": target_user_name, 
                "summary": {
                    "total_tax_paid": round(float(total_tax_paid), 2),
                    "total_batches_with_tax": total_batches,
                    "total_purchase_value": round(total_purchase_value, 2),
                    "tax_percentage_of_purchases": round((float(total_tax_paid) / total_purchase_value) * 100, 2) if total_purchase_value > 0 else 0.0,
                    "average_tax_per_batch": round(float(total_tax_paid) / total_batches, 2) if total_batches > 0 else 0.0,
                    "daily_average_tax": round(float(total_tax_paid) / total_days, 2) if total_days > 0 else 0.0,
                    "unique_users": len(set(batch.user.id for batch in queryset)) if queryset.exists() else 0,
                },
                "user_breakdown": [
                    {
                        "user_id": item['user_id'],
                        "user_name": f"{item['user__first_name']} {item['user__last_name']}".strip(),
                        "tax_paid": float(item['tax_paid'] or 0),
                        "batches_count": item['batches_count'],
                        "percentage_of_total": round((float(item['tax_paid'] or 0) / float(total_tax_paid)) * 100, 1) if total_tax_paid > 0 else 0.0
                    }
                    for item in user_breakdown
                ],
                "trends": tax_trends,
                "batch_details": batch_details
            },
            "message": f"Admin tax report for {target_user_name} retrieved successfully"
        }
        
        return Response(response_data)