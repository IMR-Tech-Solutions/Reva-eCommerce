from rest_framework import serializers
from .models import Product
from inventory.models import StockBatch
from categories.models import Category

class ProductSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "user",
            "user_name",
            "category",
            "category_name",
            "product_name",
            "product_image",
            "sku_code",
            "description",
            "unit",
            "low_stock_threshold",
            "is_live",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "user_name", "category_name", "created_at", "updated_at"]

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return ""

    def get_category_name(self, obj):
        if obj.category:
            return obj.category.category_name
        return ""
    
    def validate(self, data):
        user = self.instance.user if self.instance else self.context['request'].user
        sku_code = data.get('sku_code')
        if sku_code:
            qs = Product.objects.filter(user=user, sku_code=sku_code)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({'sku_code': 'SKU code must be unique per user.'})
        return data

class ActiveStockSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    class Meta:
        model = StockBatch
        fields = [
            'reference_number', 'quantity', 'purchase_price', 'selling_price',
            'manufacture_date', 'expiry_date', 'vendor_name',
        ]

 
class ProductWithActiveStockSerializer(serializers.ModelSerializer):
    active_stock = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'product_name', 'description', 'unit', 'low_stock_threshold', 
            'is_active', 'product_image', 'category', 'category_name', 'user', 
            'user_name', 'sku_code', 'active_stock'
        ] 
        read_only_fields = ['id', 'user', 'user_name', 'category_name', 'active_stock']

    def get_active_stock(self, obj):
        request = self.context.get("request")
        user = request.user if request else None
        if user:
            active_batch = StockBatch.objects.filter(product=obj, batch_status='active',user_id=user.id).first()
        else:
            active_batch = None
        if active_batch:
            return ActiveStockSerializer(active_batch).data
        else:
            return {
                "reference_number": None,
                "quantity": 0,
                "purchase_price": "0.00",
                "selling_price": "0.00",
                "manufacture_date": None,
                "expiry_date": None,
                "vendor_name": None,
            }
        
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return ""

    def get_category_name(self, obj):
        if obj.category:
            return obj.category.category_name
        return ""
    
    def validate(self, data):
        user = self.instance.user if self.instance else self.context['request'].user
        sku_code = data.get('sku_code')
        if sku_code:
            qs = Product.objects.filter(user=user, sku_code=sku_code)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({
                    'sku_code': 'SKU code must be unique per user.'
                })
                    
        return data
    
class ProductBulkCreateSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        user = self.context['request'].user
        product_objects = [Product(user=user, **item) for item in validated_data]
        return Product.objects.bulk_create(product_objects)

class ProductBulkSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        list_serializer_class = ProductBulkCreateSerializer