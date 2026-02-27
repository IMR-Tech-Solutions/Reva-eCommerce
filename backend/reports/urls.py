from django.urls import path
from .views import SalesReportView,AdminSalesReportView,PurchaseReportView,AdminPurchaseReportView,ShopOwnerPurchaseReportView,AdminShopOwnerPurchaseReportView
from .views2 import ManagerProductSalesReportView,AdminManagerProductSalesReportView,InventoryReportView,AdminInventoryReportView,BrokerCommissionReportView,AdminBrokerCommissionReportView,TaxReportView,AdminTaxReportView

urlpatterns = [
    #sales report
    path('reports/sales/', SalesReportView.as_view(), name='sales_report'),
    #purchase/vendor report
    path('reports/purchase-report/', PurchaseReportView.as_view(), name='purchase_report'),
    #pruchase from manager report
    path('reports/shop-purchase/', ShopOwnerPurchaseReportView.as_view(), name='shop_owner_purchase_report'),
    #manager sold to shop report
    path('reports/manager-product-sales/', ManagerProductSalesReportView.as_view(), name='manager_product_sales_report'),
    #invetory report
    path('reports/inventory-report/', InventoryReportView.as_view(), name='inventory_report'),
    #broker report
    path('reports/broker-commission/', BrokerCommissionReportView.as_view(), name='broker_commission_report'),
    #tax report
    path('reports/tax-report/', TaxReportView.as_view(), name='tax_report'),
    #admins urls
    path('admin/reports/tax-report/', AdminTaxReportView.as_view(), name='admin_tax_report'),
    path('admin/reports/broker-commission/', AdminBrokerCommissionReportView.as_view(), name='broker_commission_report'),
    path('admin/reports/inventory-report/', AdminInventoryReportView.as_view(), name='admin_inventory_report'),
    path('admin/reports/shop-purchase/', AdminShopOwnerPurchaseReportView.as_view(), name='admin_shop_owner_purchase_report'),
    path('admin/reports/manager-product-sales/', AdminManagerProductSalesReportView.as_view(), name='admin_manager_product_sales_report'),
    path('admin/reports/sales/', AdminSalesReportView.as_view(), name='admin_sales_report'),
    path('admin/reports/purchase-report/', AdminPurchaseReportView.as_view(), name='admin_purchase_report'),
]
