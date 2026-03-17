from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from .models import POSOrder, POSOrderItem
from .serializers import POSOrderSerializer, POSOrderListSerializer, POSOrderStatusUpdateSerializer,POSShopOrderSerializer
from customers.models import Customer
from products.models import Product
from accounts.premissions import IsAdminRole, IsOwnerOrAdmin, HasModuleAccess
from utils.inventory_service import InventoryService

# Add-POS-Order View (POST)
class AddPOSOrderView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "add-pos-order"
    
    def post(self, request):
        # Validate customer belongs to user
        customer_id = request.data.get('customer')
        if customer_id:
            customer = get_object_or_404(Customer, pk=customer_id)
            self.check_object_permissions(request, customer)
        
        # Validate all products belong to user
        order_items = request.data.get('order_items', [])
        for item in order_items:
            product_id = item.get('product')
            if product_id:
                product = get_object_or_404(Product, pk=product_id)
                self.check_object_permissions(request, product)
        
        serializer = POSOrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# All-POS-Orders View (GET) -- admin only
class AllPOSOrdersView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request):
        orders = POSOrder.objects.all().order_by('-created_at')
        paginator = PageNumberPagination()
        paginated_orders = paginator.paginate_queryset(orders, request)
        serializer = POSOrderListSerializer(paginated_orders, many=True)
        return paginator.get_paginated_response(serializer.data)

# POS-Orders based on a user (GET) -- For Admin
class AllUserPOSOrdersView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request, user_id):
        orders = POSOrder.objects.filter(user_id=user_id).order_by('-created_at')
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(orders, request)
        serializer = POSOrderListSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

# POS-Orders based on a user (GET) -- For User
class UserPOSOrdersView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "view-pos-orders"
    
    def get(self, request):
        user_id = request.user.id
        orders = POSOrder.objects.filter(user_id=user_id).order_by('-created_at')
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(orders, request)
        serializer = POSOrderListSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

# Update-POS-Order View (PUT)
class UpdatePOSOrderView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess, IsOwnerOrAdmin]
    required_permission = "update-pos-order"
    
    def put(self, request, pk):
        pos_order = get_object_or_404(POSOrder, pk=pk)
        self.check_object_permissions(request, pos_order)
        
        # Prevent updating order_items after creation
        if 'order_items' in request.data:
            return Response({
                'error': 'Cannot update order items after order creation',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = POSOrderStatusUpdateSerializer(pos_order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# POS-Order-Detail View (GET)
class POSOrderDetailView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def get(self, request, pk):
        pos_order = get_object_or_404(POSOrder, pk=pk)
        self.check_object_permissions(request, pos_order)
        serializer = POSOrderSerializer(pos_order)
        return Response(serializer.data)

# Cancel-POS-Order (PUT) - Special handling for stock rollback
class CancelPOSOrderView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess, IsOwnerOrAdmin]
    required_permission = "cancel-pos-order"
    
    def put(self, request, pk):
        pos_order = get_object_or_404(POSOrder, pk=pk)
        self.check_object_permissions(request, pos_order)
        
        # Check if order can be cancelled
        if pos_order.order_status in ['completed', 'cancelled']:
            return Response({
                'error': f'Cannot cancel order with status: {pos_order.order_status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Rollback inventory for each order item
            rollback_messages = []
            rollback_warnings = []
            for order_item in pos_order.order_items.all():
                # Check if order item has original_stock_batch info
                if order_item.original_stock_batch:
                    success, message = InventoryService.rollback_stock_to_original_batch(
                        order_item.original_stock_batch, 
                        order_item.quantity
                    )
                else:
                    # Fallback for old orders without original_stock_batch
                    success, message = InventoryService.rollback_stock(
                        order_item.product, 
                        order_item.quantity,
                        user=pos_order.user
                    )
                
                rollback_messages.append(f"{order_item.product.product_name}: {message}")
                
                if not success:
                    # Log warning but don't block cancellation
                    rollback_warnings.append(f"{order_item.product.product_name}: {message}")
            
            # Update order status regardless of rollback outcome
            pos_order.order_status = 'cancelled'
            pos_order.payment_status = 'refunded' if pos_order.payment_status == 'paid' else 'failed'
            pos_order.save()
            
            response_data = {
                'message': 'Order cancelled successfully',
                'inventory_rollback': rollback_messages,
                'order': POSOrderSerializer(pos_order).data
            }
            if rollback_warnings:
                response_data['warnings'] = rollback_warnings
            
            return Response(response_data)
            
        except Exception as e:
            return Response({
                'error': f'Failed to cancel order: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Delete POS Order (DELETE) - Permanently remove order
class DeletePOSOrderView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess, IsOwnerOrAdmin]
    required_permission = "cancel-pos-order"
    
    def delete(self, request, pk):
        pos_order = get_object_or_404(POSOrder, pk=pk)
        self.check_object_permissions(request, pos_order)
        
        try:
            order_number = pos_order.order_number
            pos_order.delete()
            return Response({
                'message': f'Order {order_number} deleted successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Failed to delete order: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from shop.models import ShopOwnerProducts
class AddShopPOSOrderView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "add-pos-order"
    def post(self, request):
        customer_id = request.data.get('customer')
        if customer_id:
            customer = get_object_or_404(Customer, pk=customer_id)
            self.check_object_permissions(request, customer)
        order_items = request.data.get('order_items', [])
        for item in order_items:
            product_id = item.get('id')
            if product_id:
                product = get_object_or_404(ShopOwnerProducts, pk=product_id)
        serializer = POSShopOrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)