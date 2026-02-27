from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate, TruncMonth, TruncYear
from datetime import datetime
from accounts.models import UserMaster
from posorders.models import POSOrder
from accounts.premissions import IsAdminRole,HasModuleAccess
from vendors.models import Vendor
from inventory.models import StockBatch
from shop.models import ShopOwnerOrders,ShopOrderItem
from .utils.mixins import ReportExportMixin

# Sales Report 
class SalesReportView(APIView):
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "sales-report"
    def get_template_name(self):
        return 'sales_report_pdf.html'
    def get(self, request):
        try:
            user = get_object_or_404(UserMaster, pk=request.user.id)
            
            # Get query parameters
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            filter_type = request.GET.get('filter_type', 'month')
            
            # Parse dates
            if start_date:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            pos_orders = POSOrder.objects.filter(user=user)
            
            # Apply date filters
            if start_date:
                pos_orders = pos_orders.filter(created_at__date__gte=start_date)
            if end_date:
                pos_orders = pos_orders.filter(created_at__date__lte=end_date)
            
            # Calculate totals
            total_sales = pos_orders.aggregate(total=Sum('total_amount'))['total'] or 0
            total_orders = pos_orders.count()
            
            # Group by time period
            trunc_func = {
                'day': TruncDate,
                'month': TruncMonth,
                'year': TruncYear
            }.get(filter_type, TruncMonth)
            
            trends = pos_orders.annotate(
                period=trunc_func('created_at')
            ).values('period').annotate(
                sales=Sum('total_amount'),
                orders=Count('id')
            ).order_by('period')
            
            response_data = {
                "success": True,
                "data": {
                    "filter_type": filter_type,
                    "date_range": {
                        "start_date": start_date.isoformat() if start_date else None,
                        "end_date": end_date.isoformat() if end_date else None
                    },
                    "summary": {
                        "total_sales": float(total_sales),
                        "total_orders": total_orders,
                        "average_order_value": float(total_sales / total_orders) if total_orders > 0 else 0
                    },
                    "trends": [
                        {
                            "period": trend['period'].isoformat() if trend['period'] else None,
                            "sales": float(trend['sales'] or 0),
                            "orders": trend['orders']
                        }
                        for trend in trends
                    ]
                },
                "message": "Sales report retrieved successfully"
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

# Sales Report for admin
class AdminSalesReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request):
        try:
            user = get_object_or_404(UserMaster, pk=request.user.id)
            
            # Get query parameters
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            user_id = request.GET.get('user_id')
            filter_type = request.GET.get('filter_type', 'month')
            
            # Parse dates
            if start_date:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            if user_id:
                pos_orders = POSOrder.objects.filter(user_id=user_id)
            else:
                pos_orders = POSOrder.objects.all()
            
            # Apply date filters
            if start_date:
                pos_orders = pos_orders.filter(created_at__date__gte=start_date)
            if end_date:
                pos_orders = pos_orders.filter(created_at__date__lte=end_date)
            
            # Calculate totals
            total_sales = pos_orders.aggregate(total=Sum('total_amount'))['total'] or 0
            total_orders = pos_orders.count()
            
            # Group by time period
            trunc_func = {
                'day': TruncDate,
                'month': TruncMonth,
                'year': TruncYear
            }.get(filter_type, TruncMonth)
            
            trends = pos_orders.annotate(
                period=trunc_func('created_at')
            ).values('period').annotate(
                sales=Sum('total_amount'),
                orders=Count('id')
            ).order_by('period')
            
            # Top performing users
            top_users = POSOrder.objects.values(
                'user__first_name', 'user__last_name', 'user__id'
            ).annotate(
                total_sales=Sum('total_amount'),
                total_orders=Count('id')
            ).order_by('-total_sales')[:10]
            
            response_data = {
                "success": True,
                "data": {
                    "filter_type": filter_type,
                    "filtered_user_id": user_id,
                    "date_range": {
                        "start_date": start_date.isoformat() if start_date else None,
                        "end_date": end_date.isoformat() if end_date else None
                    },
                    "summary": {
                        "total_sales": float(total_sales),
                        "total_orders": total_orders,
                        "average_order_value": float(total_sales / total_orders) if total_orders > 0 else 0
                    },
                    "trends": [
                        {
                            "period": trend['period'].isoformat() if trend['period'] else None,
                            "sales": float(trend['sales'] or 0),
                            "orders": trend['orders']
                        }
                        for trend in trends
                    ],
                    "top_performers": [
                        {
                            "user_id": user['user__id'],
                            "username": f"{user['user__first_name']} {user['user__last_name']}",
                            "total_sales": float(user['total_sales'] or 0),
                            "total_orders": user['total_orders']
                        }
                        for user in top_users
                    ]
                },
                "message": "Admin sales report retrieved successfully"
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

#Purchase Report
class PurchaseReportView(ReportExportMixin,APIView):
    permission_classes = [IsAuthenticated,HasModuleAccess]
    required_permission = "purchase-report"

    def get_template_name(self):
        return 'purchase_report_pdf.html'

    def get(self, request):
        try:
            user = get_object_or_404(UserMaster, pk=request.user.id)
            vendor_id = request.GET.get('vendor_id') 
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            filter_type = request.GET.get('filter_type', 'month') 


            export_format = request.GET.get('export')
            
            selected_vendor = None
            if vendor_id:
                selected_vendor = get_object_or_404(Vendor, pk=vendor_id, user=user)
            
            if start_date:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            stock_batches = StockBatch.objects.filter(user=user)
            
            if vendor_id and selected_vendor:
                stock_batches = stock_batches.filter(vendor=selected_vendor)

            if start_date:
                stock_batches = stock_batches.filter(created_at__date__gte=start_date)
            if end_date:
                stock_batches = stock_batches.filter(created_at__date__lte=end_date)
            
            total_quantity = stock_batches.aggregate(
                total_qty=Sum('original_quantity')
            )['total_qty'] or 0
            
            total_amount = stock_batches.aggregate(
                total_amt=Sum(F('original_quantity') * F('purchase_price'))
            )['total_amt'] or 0
            
            total_batches = stock_batches.count()
            
            trunc_func = {
                'day': TruncDate,
                'month': TruncMonth,
                'year': TruncYear
            }.get(filter_type, TruncMonth)
            
            trends = stock_batches.annotate(
                period=trunc_func('created_at')
            ).values('period').annotate(
                quantity_purchased=Sum('original_quantity'),
                amount_spent=Sum(F('original_quantity') * F('purchase_price')),
                batches_count=Count('id')
            ).order_by('period')
            
            products = stock_batches.values(
                'product__product_name', 'product__id','vendor__vendor_name'
            ).annotate(
                total_quantity=Sum('original_quantity'),
                total_amount=Sum(F('original_quantity') * F('purchase_price'))
            ).order_by('-total_amount')
            
            vendor_breakdown = []
            if not vendor_id:
                vendor_breakdown = stock_batches.values(
                    'vendor__vendor_name', 'vendor__id'
                ).annotate(
                    vendor_quantity=Sum('original_quantity'),
                    vendor_amount=Sum(F('original_quantity') * F('purchase_price')),
                    vendor_batches=Count('id')
                ).order_by('-vendor_amount')[:10]  # Top 10 vendors
            
            response_data = {
                "success": True,
                "data": {
                    "vendor": {
                        "id": selected_vendor.id if selected_vendor else None,
                        "name": selected_vendor.vendor_name if selected_vendor else "All Vendors",
                        "contact_person": selected_vendor.contact_person if selected_vendor else None
                    },
                    "filter_type": filter_type,
                    "date_range": {
                        "start_date": start_date.isoformat() if start_date else None,
                        "end_date": end_date.isoformat() if end_date else None
                    },
                    "summary": {
                        "total_quantity_purchased": total_quantity,
                        "total_amount_spent": float(total_amount),
                        "total_batches": total_batches,
                        "average_batch_value": float(total_amount / total_batches) if total_batches > 0 else 0
                    },
                    "trends": [
                        {
                            "period": trend['period'].isoformat() if trend['period'] else None,
                            "quantity_purchased": trend['quantity_purchased'],
                            "amount_spent": float(trend['amount_spent'] or 0),
                            "batches_count": trend['batches_count']
                        }
                        for trend in trends
                    ],
                    "products": [
                        {
                            "product_id": product['product__id'],
                            "product_name": product['product__product_name'],
                            "vendor_name": product['vendor__vendor_name'],
                            "total_quantity": product['total_quantity'],
                            "total_amount": float(product['total_amount'] or 0)
                        }
                        for product in products
                    ],
                    "vendor_breakdown": [
                        {
                            "vendor_id": vendor['vendor__id'],
                            "vendor_name": vendor['vendor__vendor_name'],
                            "total_quantity": vendor['vendor_quantity'],
                            "total_amount": float(vendor['vendor_amount'] or 0),
                            "total_batches": vendor['vendor_batches']
                        }
                        for vendor in vendor_breakdown
                    ] if not vendor_id else []
                },
                "message": "Purchase report retrieved successfully"
            }

            if export_format == 'pdf':
                return self.generate_pdf_response(response_data['data'])
            elif export_format == 'excel':
                return self.generate_excel_response(response_data['data'])
            else:
                return Response(response_data, status=status.HTTP_200_OK)
            
            # return Response(response_data, status=status.HTTP_200_OK)
            
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
        
#Purchase report for admin
class AdminPurchaseReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request):
        try:
            user = get_object_or_404(UserMaster, pk=request.user.id)
        
            vendor_id = request.GET.get('vendor_id')
            manager_id = request.GET.get('user_id')
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            filter_type = request.GET.get('filter_type', 'month')

            selected_vendor = None
            selected_manager = None
            
            if vendor_id:
                selected_vendor = get_object_or_404(Vendor, pk=vendor_id)
            if manager_id:
                selected_manager = get_object_or_404(UserMaster, pk=manager_id)

            if start_date:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            # Base queryset - Admin sees ALL stock batches
            stock_batches = StockBatch.objects.all()
            
            # Apply filters if provided
            if vendor_id:
                stock_batches = stock_batches.filter(vendor_id=vendor_id)
            if manager_id:
                stock_batches = stock_batches.filter(user_id=manager_id)
            if start_date:
                stock_batches = stock_batches.filter(created_at__date__gte=start_date)
            if end_date:
                stock_batches = stock_batches.filter(created_at__date__lte=end_date)
            
            # Calculate totals
            total_quantity = stock_batches.aggregate(
                total_qty=Sum('original_quantity')
            )['total_qty'] or 0
            
            total_amount = stock_batches.aggregate(
                total_amt=Sum(F('original_quantity') * F('purchase_price'))
            )['total_amt'] or 0
            
            total_batches = stock_batches.count()
            
            # Group by time period
            trunc_func = {
                'day': TruncDate,
                'month': TruncMonth,
                'year': TruncYear
            }.get(filter_type, TruncMonth)
            
            trends = stock_batches.annotate(
                period=trunc_func('created_at')
            ).values('period').annotate(
                quantity_purchased=Sum('original_quantity'),
                amount_spent=Sum(F('original_quantity') * F('purchase_price')),
                batches_count=Count('id')
            ).order_by('period')
            
            # All products purchased (in filtered scope)
            products = stock_batches.values(
                'product__product_name', 'product__id','vendor__vendor_name','user__first_name','user__last_name'
            ).annotate(
                total_quantity=Sum('original_quantity'),
                total_amount=Sum(F('original_quantity') * F('purchase_price'))
            ).order_by('-total_amount')
            
            # System insights
            active_managers_count = stock_batches.values('user_id').distinct().count()
            active_vendors_count = stock_batches.values('vendor_id').distinct().count()
            unique_products_count = stock_batches.values('product_id').distinct().count()
            
            response_data = {
                "success": True,
                "data": {
                    "filters_applied": {
                        "vendor": {
                            "id": selected_vendor.id if selected_vendor else None,
                            "name": selected_vendor.vendor_name if selected_vendor else "All Vendors"
                        },
                        "manager": {
                            "id": selected_manager.id if selected_manager else None,
                            "name": f"{selected_manager.first_name} {selected_manager.last_name}" if selected_manager else "All Managers"
                        },
                        "date_range": {
                            "start_date": start_date.isoformat() if start_date else None,
                            "end_date": end_date.isoformat() if end_date else None
                        },
                        "filter_type": filter_type
                    },
                    "system_summary": {
                        "total_quantity_purchased": total_quantity,
                        "total_amount_spent": float(total_amount),
                        "total_batches": total_batches,
                        "average_batch_value": float(total_amount / total_batches) if total_batches > 0 else 0,
                        "active_managers": active_managers_count,
                        "active_vendors": active_vendors_count,
                        "unique_products": unique_products_count
                    },
                    "trends": [
                        {
                            "period": trend['period'].isoformat() if trend['period'] else None,
                            "quantity_purchased": trend['quantity_purchased'],
                            "amount_spent": float(trend['amount_spent'] or 0),
                            "batches_count": trend['batches_count']
                        }
                        for trend in trends
                    ],
                    "products": [
                        {
                            "product_id": product['product__id'],
                            "product_name": product['product__product_name'],
                            "vendor_name": product['vendor__vendor_name'],
                            "vendor_owner_name": f"{product['user__first_name']} {product['user__last_name']}".strip(),
                            "total_quantity": product['total_quantity'],
                            "total_amount": float(product['total_amount'] or 0)
                        }
                        for product in products
                    ]
                },
                "message": "Admin purchase report retrieved successfully"
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
        
# Shop Owner Purchase Report 
class ShopOwnerPurchaseReportView(APIView):
    permission_classes = [IsAuthenticated,HasModuleAccess]
    required_permission = "shop-access"    
    def get(self, request):
        try:
            user = get_object_or_404(UserMaster, pk=request.user.id)
            manager_id = request.GET.get('manager_id') 
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            filter_type = request.GET.get('filter_type', 'month')
            
            selected_manager = None
            if manager_id:
                selected_manager = get_object_or_404(UserMaster, pk=manager_id)
            
            # Parse dates
            if start_date:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            shop_order_items = ShopOrderItem.objects.filter(
                order__shop_owner=user,
                fulfilled_by_manager__isnull=False,  
                fulfilled_quantity__isnull=False,
                actual_price__isnull=False
            )
            
            # Filter by manager if provided
            if manager_id and selected_manager:
                shop_order_items = shop_order_items.filter(fulfilled_by_manager=selected_manager)
            
            # Apply date filters
            if start_date:
                shop_order_items = shop_order_items.filter(created_at__date__gte=start_date)
            if end_date:
                shop_order_items = shop_order_items.filter(created_at__date__lte=end_date)
            
            # Calculate totals
            total_quantity = shop_order_items.aggregate(
                total_qty=Sum('fulfilled_quantity')
            )['total_qty'] or 0
            
            total_amount = shop_order_items.aggregate(
                total_amt=Sum(F('fulfilled_quantity') * F('actual_price'))
            )['total_amt'] or 0
            
            total_items = shop_order_items.count()
            
            # Group by time period
            trunc_func = {
                'day': TruncDate,
                'month': TruncMonth,
                'year': TruncYear
            }.get(filter_type, TruncMonth)
            
            trends = shop_order_items.annotate(
                period=trunc_func('created_at')
            ).values('period').annotate(
                quantity_purchased=Sum('fulfilled_quantity'),
                amount_spent=Sum(F('fulfilled_quantity') * F('actual_price')),
                items_count=Count('id')
            ).order_by('period')
            
            # All products purchased (from selected manager or all managers)
            products = shop_order_items.values(
                'product__product_name', 'product__id',
                'fulfilled_by_manager__first_name', 'fulfilled_by_manager__last_name',
                'fulfilled_by_manager__id'
            ).annotate(
                total_quantity=Sum('fulfilled_quantity'),
                total_amount=Sum(F('fulfilled_quantity') * F('actual_price'))
            ).order_by('-total_amount')
            
            # Manager breakdown (if showing all managers)
            manager_breakdown = []
            if not manager_id:
                manager_breakdown = shop_order_items.values(
                    'fulfilled_by_manager__first_name', 'fulfilled_by_manager__last_name',
                    'fulfilled_by_manager__id'
                ).annotate(
                    manager_quantity=Sum('fulfilled_quantity'),
                    manager_amount=Sum(F('fulfilled_quantity') * F('actual_price')),
                    manager_items=Count('id'),
                    unique_products=Count('product_id', distinct=True)
                ).order_by('-manager_amount')
            
            response_data = {
                "success": True,
                "data": {
                    "manager": {
                        "id": selected_manager.id if selected_manager else None,
                        "name": f"{selected_manager.first_name} {selected_manager.last_name}" if selected_manager else "All Managers"
                    },
                    "filter_type": filter_type,
                    "date_range": {
                        "start_date": start_date.isoformat() if start_date else None,
                        "end_date": end_date.isoformat() if end_date else None
                    },
                    "summary": {
                        "total_quantity_purchased": total_quantity,
                        "total_amount_spent": float(total_amount),
                        "total_items": total_items,
                        "average_item_value": float(total_amount / total_items) if total_items > 0 else 0
                    },
                    "trends": [
                        {
                            "period": trend['period'].isoformat() if trend['period'] else None,
                            "quantity_purchased": trend['quantity_purchased'],
                            "amount_spent": float(trend['amount_spent'] or 0),
                            "items_count": trend['items_count']
                        }
                        for trend in trends
                    ],
                    "products": [
                        {
                            "product_id": product['product__id'],
                            "product_name": product['product__product_name'],
                            "manager_id": product['fulfilled_by_manager__id'],
                            "manager_name": f"{product['fulfilled_by_manager__first_name']} {product['fulfilled_by_manager__last_name']}",
                            "total_quantity": product['total_quantity'],
                            "total_amount": float(product['total_amount'] or 0)
                        }
                        for product in products
                    ],
                    "manager_breakdown": [
                        {
                            "manager_id": manager['fulfilled_by_manager__id'],
                            "manager_name": f"{manager['fulfilled_by_manager__first_name']} {manager['fulfilled_by_manager__last_name']}",
                            "total_quantity": manager['manager_quantity'],
                            "total_amount": float(manager['manager_amount'] or 0),
                            "total_items": manager['manager_items'],
                            "unique_products": manager['unique_products']
                        }
                        for manager in manager_breakdown
                    ] if not manager_id else []
                },
                "message": "Shop owner purchase report retrieved successfully"
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

# Admin Shop Owner Purchase Report
class AdminShopOwnerPurchaseReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request):
        try:
            user = get_object_or_404(UserMaster, pk=request.user.id)
            shop_owner_id = request.GET.get('shop_owner_id') 
            manager_id = request.GET.get('manager_id')      
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            filter_type = request.GET.get('filter_type', 'month')
            
            # Parse dates
            if start_date:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            # Base queryset - All fulfilled shop order items
            shop_order_items = ShopOrderItem.objects.filter(
                fulfilled_by_manager__isnull=False,
                fulfilled_quantity__isnull=False,
                actual_price__isnull=False
            )
            
            # Apply filters
            if shop_owner_id:
                shop_order_items = shop_order_items.filter(order__shop_owner_id=shop_owner_id)
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
            
            total_amount = shop_order_items.aggregate(
                total_amt=Sum(F('fulfilled_quantity') * F('actual_price'))
            )['total_amt'] or 0
            
            total_items = shop_order_items.count()
            
            # Group by time period
            trunc_func = {
                'day': TruncDate,
                'month': TruncMonth,
                'year': TruncYear
            }.get(filter_type, TruncMonth)
            
            trends = shop_order_items.annotate(
                period=trunc_func('created_at')
            ).values('period').annotate(
                quantity_purchased=Sum('fulfilled_quantity'),
                amount_spent=Sum(F('fulfilled_quantity') * F('actual_price')),
                items_count=Count('id')
            ).order_by('period')
            
            # Products with both shop owner and manager info
            products = shop_order_items.values(
                'product__product_name', 'product__id',
                'fulfilled_by_manager__first_name', 'fulfilled_by_manager__last_name',
                'fulfilled_by_manager__id',
                'order__shop_owner__first_name', 'order__shop_owner__last_name',
                'order__shop_owner__id'
            ).annotate(
                total_quantity=Sum('fulfilled_quantity'),
                total_amount=Sum(F('fulfilled_quantity') * F('actual_price'))
            ).order_by('-total_amount')
            
            response_data = {
                "success": True,
                "data": {
                    "filters_applied": {
                        "shop_owner_id": shop_owner_id,
                        "manager_id": manager_id,
                        "date_range": {
                            "start_date": start_date.isoformat() if start_date else None,
                            "end_date": end_date.isoformat() if end_date else None
                        },
                        "filter_type": filter_type
                    },
                    "summary": {
                        "total_quantity_purchased": total_quantity,
                        "total_amount_spent": float(total_amount),
                        "total_items": total_items,
                        "average_item_value": float(total_amount / total_items) if total_items > 0 else 0,
                        "active_shop_owners": shop_order_items.values('order__shop_owner_id').distinct().count(),
                        "active_managers": shop_order_items.values('fulfilled_by_manager_id').distinct().count()
                    },
                    "trends": [
                        {
                            "period": trend['period'].isoformat() if trend['period'] else None,
                            "quantity_purchased": trend['quantity_purchased'],
                            "amount_spent": float(trend['amount_spent'] or 0),
                            "items_count": trend['items_count']
                        }
                        for trend in trends
                    ],
                    "products": [
                        {
                            "product_id": product['product__id'],
                            "product_name": product['product__product_name'],
                            "manager_id": product['fulfilled_by_manager__id'],
                            "manager_name": f"{product['fulfilled_by_manager__first_name']} {product['fulfilled_by_manager__last_name']}",
                            "shop_owner_id": product['order__shop_owner__id'],
                            "shop_owner_name": f"{product['order__shop_owner__first_name']} {product['order__shop_owner__last_name']}",
                            "total_quantity": product['total_quantity'],
                            "total_amount": float(product['total_amount'] or 0)
                        }
                        for product in products
                    ]
                },
                "message": "Admin shop owner purchase report retrieved successfully"
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
