from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Vendor, VendorInvoice
from inventory.models import StockBatch
from decimal import Decimal
from .serializers import VendorSerializer
from django.shortcuts import get_object_or_404
from accounts.premissions import IsAdminRole, IsOwnerOrAdmin, HasModuleAccess
from rest_framework.pagination import PageNumberPagination


# Add Vendor (POST)
class AddVendorView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "add-vendor"
    def post(self, request):
        serializer = VendorSerializer(data=request.data,context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# All Vendors (GET) -- Admin
class AllVendorsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    def get(self, request):
        vendors = Vendor.objects.all().order_by('id')
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(vendors, request)
        serializer = VendorSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

# Vendors for specific user (GET) -- Admin
class AllUserVendorsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    def get(self, request, user_id):
        vendors = Vendor.objects.filter(user_id=user_id).order_by('id')
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(vendors, request)
        serializer = VendorSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

# My Vendors (GET) -- User
class UserVendorsView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "view-vendors"
    def get(self, request):
        vendors = Vendor.objects.filter(user_id=request.user.id).order_by('id')
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(vendors, request)
        serializer = VendorSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

# My Vendors (GET) --active -- User
class UserActiveVendorsView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "view-vendors"
    def get(self, request):
        vendors = Vendor.objects.filter(is_active=True,user_id=request.user.id).order_by('id')
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(vendors, request)
        serializer = VendorSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

# Update Vendor (PUT)
class UpdateVendorView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess, IsOwnerOrAdmin]
    required_permission = "update-vendor"
    def put(self, request, pk):
        vendor = get_object_or_404(Vendor, pk=pk)
        self.check_object_permissions(request, vendor)
        serializer = VendorSerializer( instance=vendor, data=request.data,partial=True,context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vendor Detail (GET)
class VendorDetailView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    def get(self, request, pk):
        vendor = get_object_or_404(Vendor, pk=pk)
        self.check_object_permissions(request, vendor)
        serializer = VendorSerializer(vendor)
        return Response(serializer.data)

# Delete Vendor (DELETE)
class DeleteVendorView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess, IsOwnerOrAdmin]
    required_permission = "delete-vendor"
    def delete(self, request, pk):
        vendor = get_object_or_404(Vendor, pk=pk)
        self.check_object_permissions(request, vendor)
        vendor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

#broker comission view for a vendor invoice
class VendorInvoiceBrokerCommissionView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "view-vendor-invoices"
    
    def get(self, request, invoice_id):
        try:
            user = request.user
            
            vendor_invoice = get_object_or_404(
                VendorInvoice, 
                id=invoice_id, 
                user=user
            )
            
            stock_batches = StockBatch.objects.filter(
                vendor_invoice=vendor_invoice,
                broker__isnull=False,
                broker_commission_amount__gt=0
            ).select_related('broker', 'product')
            
            if not stock_batches.exists():
                return Response({
                    "invoice_id": invoice_id,
                    "total_broker_commission": 0.0,
                    "broker_commissions": []
                })
            
            # Group stock batches by broker
            broker_data = {}
            total_commission = Decimal('0.00')
            
            for batch in stock_batches:
                broker_id = batch.broker.id
                commission_amount = batch.broker_commission_amount
                total_commission += commission_amount
                
                if broker_id not in broker_data:
                    broker_data[broker_id] = {
                        'broker_id': broker_id,
                        'broker_name': batch.broker.broker_name,
                        'commission_amount': Decimal('0.00'),
                        'batches': []
                    }
                
                broker_data[broker_id]['commission_amount'] += commission_amount
                broker_data[broker_id]['batches'].append({
                    'batch_id': batch.id,
                    'product': batch.product.product_name,
                    'percent': float(batch.broker_commission_percent),
                    'amount': float(commission_amount)
                })
            
            # Convert broker_data to list and format response
            broker_commissions = []
            for broker_info in broker_data.values():
                broker_commissions.append({
                    'broker_id': broker_info['broker_id'],
                    'broker_name': broker_info['broker_name'],
                    'commission_amount': float(broker_info['commission_amount']),
                    'batches': broker_info['batches']
                })
            
            # Sort by commission amount (highest first)
            broker_commissions.sort(key=lambda x: x['commission_amount'], reverse=True)
            
            response_data = {
                "invoice_id": invoice_id,
                "total_broker_commission": float(total_commission),
                "broker_commissions": broker_commissions
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )