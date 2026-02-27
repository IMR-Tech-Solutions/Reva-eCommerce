from django.urls import path
from .views import (
    StockBatchBulkCreateView, ProductStockBatchesAPIView,
    BatchStatusUpdateView,UpdateBatchView,ParticularUserActiveStockView,AllUserActiveStockView,UserProductsActiveStockView, StockBatchDetailView 
)

urlpatterns = [
    path('stock-batches/bulk-create/', StockBatchBulkCreateView.as_view(), name='stockbatch-bulk-create'),
    path('stock-batches/product/<int:product_id>/', ProductStockBatchesAPIView.as_view(), name='product-stock-batches'),
    path('stock-batches/<int:batch_id>/status/', BatchStatusUpdateView.as_view(), name='batch-status-update'),
    # path('stock-batches/delete/<int:batch_id>/', DeleteBatchView.as_view(), name='batch-update'),
    path('stock-batches/update/<int:batch_id>/', UpdateBatchView.as_view(), name='batch-update'),
    path('stock-batches/stock/<int:batch_id>/', StockBatchDetailView.as_view(), name='batch-detail'),
    path('user/stock-batches/', UserProductsActiveStockView.as_view(), name='all-active-batches'),
    #admin urls
    path('admin/stock-batches/<int:user_id>/', ParticularUserActiveStockView.as_view(), name='particular-user-stock-batches'),
    path('admin/stock-batches/', AllUserActiveStockView.as_view(), name='all-active-batches'),
]