from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .serializers import (
    StockBatchBulkCreateSerializer, StockBatchDetailSerializer,
    BatchStatusUpdateSerializer, StockBatchUpdateSerializer
)
from .models import StockBatch
from products.models import Product
from django.db import transaction
from accounts.premissions import IsAdminRole, HasModuleAccess, IsOwnerOrAdmin
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils.timezone import now
from django.db.models import Case, When, Value, IntegerField

#CREATE stock batches in bulk
class StockBatchBulkCreateView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "add-stock-batch"
    def post(self, request):
        serializer = StockBatchBulkCreateSerializer(data=request.data,context={'auto_activate_first': True,'request':request})      
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    result = serializer.save()
                return Response({
                    "message": "Stock batches created successfully",
                    "vendor_id": result['vendor_id'],
                    "created_count": result['created_count'],
                    # "batch_codes": result['batch_codes']
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({
                    "error": "Failed to create stock batches",
                    "details": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "error": "Validation failed",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#Particular User Stock Batchs --admin only
class ParticularUserActiveStockView(APIView):
    permission_classes = [IsAuthenticated,IsAdminRole] 
    def get(self, request,user_id):
        today = now().date()
        batches = (
            StockBatch.objects.filter(batch_status='active',user_id=user_id).select_related('product', 'vendor').annotate(
                expiry_priority=Case(
                    When(expiry_date__lt=today, then=Value(0)),  
                    When(expiry_date=today, then=Value(1)),      
                    default=Value(2),                           
                    output_field=IntegerField()
                )
            )
            .order_by('expiry_priority', 'expiry_date')  
        )
        paginator = PageNumberPagination()
        paginated_batches = paginator.paginate_queryset(batches, request)
        product_data = {}
        for batch in paginated_batches:
            p_id = batch.product.id
            if p_id not in product_data:
                product_data[p_id] = {
                    'product_id': p_id,
                    'product_name': batch.product.product_name,
                    'active_batches': []
                }
            product_data[p_id]['active_batches'].append({
                'batch_id': batch.id,
                # 'batch_code': batch.batch_code,
                'quantity': batch.quantity,
                'purchase_price': batch.purchase_price,
                'selling_price': batch.selling_price,
                'manufacture_date': batch.manufacture_date,
                'expiry_date': batch.expiry_date,
                'vendor_id': batch.vendor.id,
                'vendor_name': batch.vendor.vendor_name,
            })
        return paginator.get_paginated_response(list(product_data.values()))

#Particular User Stock Batchs --admin only
class AllUserActiveStockView(APIView):
    permission_classes = [IsAuthenticated,IsAdminRole] 
    def get(self, request):
        today = now().date()
        batches = (
            StockBatch.objects.filter(batch_status='active').select_related('product', 'vendor').annotate(
                expiry_priority=Case(
                    When(expiry_date__lt=today, then=Value(0)),  
                    When(expiry_date=today, then=Value(1)),      
                    default=Value(2),                           
                    output_field=IntegerField()
                )
            )
            .order_by('expiry_priority', 'expiry_date')  
        )
        paginator = PageNumberPagination()
        paginated_batches = paginator.paginate_queryset(batches, request)
        product_data = {}
        for batch in paginated_batches:
            p_id = batch.product.id
            if p_id not in product_data:
                product_data[p_id] = {
                    'product_id': p_id,
                    'product_name': batch.product.product_name,
                    'active_batches': []
                }
            product_data[p_id]['active_batches'].append({
                'batch_id': batch.id,
                # 'batch_code': batch.batch_code,
                'quantity': batch.quantity,
                'purchase_price': batch.purchase_price,
                'selling_price': batch.selling_price,
                'manufacture_date': batch.manufacture_date,
                'expiry_date': batch.expiry_date,
                'vendor_id': batch.vendor.id,
                'vendor_name': batch.vendor.vendor_name,
            })
        return paginator.get_paginated_response(list(product_data.values()))

#Particular Product Stock Batches
class ProductStockBatchesAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, product_id):
        product = get_object_or_404(Product,pk=product_id, is_active=True)
        batch_status = request.query_params.get('status', None)
        vendor_id = request.query_params.get('vendor_id', None)
        queryset = StockBatch.objects.filter(
            product=product,user_id=request.user.id
        ).select_related('vendor', 'product').order_by('expiry_date')
        if batch_status:
            if batch_status not in dict(StockBatch.BATCH_STATUS_CHOICES):
                return Response({
                    'error': f'Invalid status. Valid options: {[choice[0] for choice in StockBatch.BATCH_STATUS_CHOICES]}'
                }, status=status.HTTP_400_BAD_REQUEST)
            queryset = queryset.filter(batch_status=batch_status)
        
        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)

        serializer = StockBatchDetailSerializer(queryset, many=True)
        total_batches = queryset.count()
        total_active_quantity = sum(batch.quantity for batch in queryset if batch.batch_status == 'active')
        total_quantity = sum(batch.quantity for batch in queryset)
        active_batches = queryset.filter(batch_status='active').count()
        return Response({
            'product_id': product.id,
            'product_name': product.product_name,
            'total_batches': total_batches,
            'active_batches': active_batches,
            'total_quantity': total_quantity, 
            'total_active_quantity': total_active_quantity,
            'stock_batches': serializer.data
        })

#change stock batch status
class BatchStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess,IsOwnerOrAdmin]
    required_permission = "change-batch-status"
    def patch(self, request, batch_id):
        try:
            batch = StockBatch.objects.get(id=batch_id)
            self.check_object_permissions(request, batch)
        except StockBatch.DoesNotExist:
            return Response({
                'error': 'Batch not found'
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = BatchStatusUpdateSerializer(batch, data=request.data, partial=True,context={'mark_as_sold': True})
        if serializer.is_valid():
            updated_batch = serializer.save()
            response_data = {
                'message': 'Batch status updated successfully',
                'batch_id': updated_batch.id,
                # 'batch_code': updated_batch.batch_code,
                'new_status': updated_batch.batch_status
            }
            if hasattr(updated_batch, '_next_active_batch') and updated_batch._next_active_batch:
                response_data['next_active_batch'] = updated_batch._next_active_batch.id
            return Response(response_data, status=status.HTTP_200_OK)
        return Response({
            'error': 'Validation failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#Update stock batch
class UpdateBatchView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess,IsOwnerOrAdmin]
    required_permission = "update-stock-batch"
    def put(self, request, batch_id):
        stockbatch = get_object_or_404(StockBatch, pk=batch_id)
        self.check_object_permissions(request, stockbatch)
        if stockbatch.batch_status in ['sold', 'damaged']:
            return Response({
                'error': f'Cannot update {stockbatch.batch_status} batch'
            }, status=status.HTTP_400_BAD_REQUEST)

        if 'batch_status' in request.data:
            return Response({
                'error': 'Cannot Update batch status',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = StockBatchUpdateSerializer(stockbatch, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    updated_batch = serializer.save()
                    
                return Response({
                    'message': 'Batch updated successfully',
                    'batch_id': updated_batch.id,
                    # 'batch_code': updated_batch.batch_code,
                    'batch_status': updated_batch.batch_status,
                    'updated_fields': list(request.data.keys())
                })
                
            except Exception as e:
                return Response({
                    "error": "Failed to update batch",
                    "details": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'error': 'Validation failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#DELETE stock batch
# class DeleteBatchView(APIView):
#     permission_classes = [IsAuthenticated, HasModuleAccess]
#     required_permission = "delete-stock-batch"
#     def delete(self, request, batch_id):
#         stockbatch = get_object_or_404(StockBatch, pk=batch_id)
#         # Prevent deletion of active batches
#         if stockbatch.batch_status == 'active':
#             return Response({
#                 'error': 'Cannot delete active batch',
#                 'message': 'Please change batch status first or activate another batch for this product',
#                 'current_status': stockbatch.batch_status
#             }, status=status.HTTP_400_BAD_REQUEST)
#         try:
#             with transaction.atomic():
#                 stockbatch.delete() 
#             return Response({
#                 'message': 'Batch deleted successfully',
#             }, status=status.HTTP_200_OK)   
#         except Exception as e:
#             return Response({
#                 "error": "Failed to delete batch",
#                 "details": str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#User Active Stock Batches --user only 
class UserProductsActiveStockView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "view-stock-batch"
    def get(self, request):
        today = now().date()
        batches = (
            StockBatch.objects.filter(
                batch_status='active',
                user_id=request.user.id
            )
            .select_related('product', 'vendor')
            .annotate(
                expiry_priority=Case(
                    When(expiry_date__lt=today, then=Value(0)),  
                    When(expiry_date=today, then=Value(1)),      
                    default=Value(2),                           
                    output_field=IntegerField()
                )
            )
            .order_by('expiry_priority', 'expiry_date')  
        )
        paginator = PageNumberPagination()
        paginated_batches = paginator.paginate_queryset(batches, request)
        product_data = {}
        for batch in paginated_batches:
            p_id = batch.product.id
            if p_id not in product_data:
                product_data[p_id] = {
                    'product_id': p_id,
                    'product_name': batch.product.product_name,
                    'active_batches': []
                }
            product_data[p_id]['active_batches'].append({
                'batch_id': batch.id,
                # 'batch_code': batch.batch_code,
                'quantity': batch.quantity,
                'original_quantity': batch.original_quantity,
                'purchase_price': batch.purchase_price,
                'selling_price': batch.selling_price,
                'manufacture_date': batch.manufacture_date,
                'expiry_date': batch.expiry_date,
                'vendor_id': batch.vendor.id,
                'vendor_name': batch.vendor.vendor_name,
            })
        return paginator.get_paginated_response(list(product_data.values()))

#batch detail view
class StockBatchDetailView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess,IsOwnerOrAdmin]
    required_permission = "update-stock-batch"
    def get(self, request, batch_id):
        try:
            batch = StockBatch.objects.select_related(
                'vendor', 'product'
            ).get(id=batch_id)
            self.check_object_permissions(request, batch)
        except StockBatch.DoesNotExist:
            return Response({
                'error': 'Batch not found'
            }, status=status.HTTP_404_NOT_FOUND)        
        serializer = StockBatchDetailSerializer(batch) 
        return Response(serializer.data, status=status.HTTP_200_OK)
