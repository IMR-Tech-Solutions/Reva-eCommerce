from rest_framework import serializers
from django.db import transaction
from .models import POSOrder, POSOrderItem
from products.models import Product
from customers.models import Customer
from inventory.models import StockBatch
from shop.models import ShopOwnerProducts
from utils.inventory_service import InventoryService
from decimal import Decimal

class POSOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    product_sku = serializers.CharField(source='product.sku_code', read_only=True)
    
    class Meta:
        model = POSOrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku', 
            'quantity', 'unit_price', 'original_stock_batch','total_price', 'notes'
        ]
        read_only_fields = ['id', 'unit_price', 'total_price', 'product_name', 'product_sku','original_stock_batch']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_product(self, value):
        user = self.context['request'].user
        try:
            active_batch = StockBatch.objects.get(user=user,product=value, batch_status='active')
            if active_batch.quantity <= 0:
                raise serializers.ValidationError(f"Product '{value.product_name}' is out of stock")
        except StockBatch.DoesNotExist:
            raise serializers.ValidationError(f"Product '{value.product_name}' has no active stock batch")
        return value

class POSOrderSerializer(serializers.ModelSerializer):
    order_items = POSOrderItemSerializer(many=True, write_only=True)
    order_items_details = POSOrderItemSerializer(source='order_items', many=True, read_only=True)
    customer_name = serializers.SerializerMethodField(read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    
    class Meta:
        model = POSOrder
        fields = [
            'id', 'order_number', 'customer', 'customer_name', 'customer_phone',
            'order_status', 'payment_status', 'payment_method',
            'address', 'city', 'zipcode',
            'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
            'notes', 'order_items', 'order_items_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'subtotal', 'total_amount', 
            'address', 'city', 'zipcode', 'created_at', 'updated_at', 
            'customer_name', 'customer_phone'
        ]
    
    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}"
    
    def validate_order_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item")
        
        # Check for duplicate products
        product_ids = [item['product'].id for item in value]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError("Duplicate products are not allowed in the same order")
        
        return value
    
    def validate_tax_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Tax amount cannot be negative")
        return value
    
    def validate_discount_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Discount amount cannot be negative")
        return value
    
    def validate(self, attrs):
        user = self.context['request'].user
        order_items_data = []
        for item_data in attrs['order_items']:
            order_items_data.append({
                'product': item_data['product'],
                'quantity': item_data['quantity']
            })
        
        # Check stock availability
        is_valid, error_messages = InventoryService.validate_order_items_stock(order_items_data,user)
        if not is_valid:
            raise serializers.ValidationError({
                'order_items': error_messages,
            })
        
        return attrs
    
    @transaction.atomic
    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items')
        user = self.context['request'].user
    
        # Create the order
        order = POSOrder.objects.create(user=user, **validated_data)
    
        # Prepare inventory data and create order items
        inventory_items = []
        order_items = []
        subtotal = 0
    
        for item_data in order_items_data:
            product = item_data['product']
            quantity = item_data['quantity']
        
        # Get unit_price from active stock batch
            try:
                active_batch = StockBatch.objects.get(user=user,product=product, batch_status='active')
                unit_price = active_batch.selling_price
            except StockBatch.DoesNotExist:
                raise serializers.ValidationError(f"No active stock batch found for product: {product.product_name}")
        
        # Create order item (but don't save yet - we need original_stock_batch)
            total_price = quantity * unit_price
            order_item = POSOrderItem(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price,
                notes=item_data.get('notes', '')
                # original_stock_batch will be set after inventory processing
            )
            order_items.append(order_item)
        
            # Calculate subtotal
            subtotal += total_price
        
            # Prepare inventory data
            inventory_items.append({
                'product': product,
                'quantity': quantity
            })
    
        # Process inventory reduction - GET ORIGINAL BATCHES!
        success, messages, original_batches = InventoryService.process_order_inventory(inventory_items,user)
        if not success:
            raise serializers.ValidationError({
                'inventory': 'Failed to process inventory',
                'details': messages
            })
    
        # NOW set original_stock_batch for each order item
        for order_item in order_items:
            product_id = order_item.product.id
            order_item.original_stock_batch = original_batches.get(product_id)
    
        # Bulk create order items with original_stock_batch info
        POSOrderItem.objects.bulk_create(order_items)
    
        # Calculate and update order totals
        order.subtotal = subtotal
        order.total_amount = subtotal + order.tax_amount - order.discount_amount
        order.save()
    
        return order

class POSOrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSOrder
        fields = ['order_status', 'payment_status', 'notes']
    
    def validate_order_status(self, value):
        # Add custom status transition validation if needed
        return value

class POSOrderListSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField(read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    items_count = serializers.IntegerField(source='order_items.count', read_only=True)
    
    class Meta:
        model = POSOrder
        fields = [
            'id', 'order_number', 'customer_name', 'customer_phone',
            'order_status', 'payment_status', 'total_amount',
            'items_count', 'created_at'
        ]

    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}"


class POSShopOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    product_sku = serializers.CharField(source='product.sku_code', read_only=True)
    
    class Meta:
        model = POSOrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku', 
            'quantity', 'unit_price', 'original_stock_batch','total_price', 'notes'
        ]
        read_only_fields = ['id', 'unit_price', 'total_price', 'product_name', 'product_sku','original_stock_batch']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_product(self, value):
        user = self.context['request'].user
        try:
            shop_product = ShopOwnerProducts.objects.get(shop_owner=user,product=value)
            if shop_product.quantity <= 0:
                raise serializers.ValidationError(f"Product '{value.product_name}' is out of stock")
        except ShopOwnerProducts.DoesNotExist:
            raise serializers.ValidationError(f"Product '{value.product_name}' not found in inventory")
        return value

class POSShopOrderSerializer(serializers.ModelSerializer):
    order_items = POSShopOrderItemSerializer(many=True, write_only=True)
    order_items_details = POSShopOrderItemSerializer(source='order_items', many=True, read_only=True)
    customer_name = serializers.SerializerMethodField(read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    
    class Meta:
        model = POSOrder
        fields = [
            'id', 'order_number', 'customer', 'customer_name', 'customer_phone',
            'order_status', 'payment_status', 'payment_method',
            'address', 'city', 'zipcode',
            'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
            'notes', 'order_items', 'order_items_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'subtotal', 'total_amount', 
            'address', 'city', 'zipcode', 'created_at', 'updated_at', 
            'customer_name', 'customer_phone'
        ]
    
    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}"
    
    def validate_order_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item")

        product_ids = [item['product'].id for item in value]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError("Duplicate products are not allowed in the same order")
        
        return value
    
    def validate_tax_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Tax amount cannot be negative")
        return value
    
    def validate_discount_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Discount amount cannot be negative")
        return value
    
    def validate(self, attrs):
        user = self.context['request'].user
        errors = []
        
        for item_data in attrs['order_items']:
            product = item_data['product']
            quantity = item_data['quantity']
            
            try:
                shop_product = ShopOwnerProducts.objects.get(
                    shop_owner=user,
                    product=product
                )
                if shop_product.quantity < quantity:
                    errors.append(
                        f"Insufficient stock for {product.product_name}. Available: {shop_product.quantity}, Requested: {quantity}"
                    )
            except ShopOwnerProducts.DoesNotExist:
                errors.append(f"Product {product.product_name} not found in your inventory")
        
        if errors:
            raise serializers.ValidationError({'order_items': errors})
        
        return attrs
    
    @transaction.atomic
    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items')
        user = self.context['request'].user
    
        # Create the order
        order = POSOrder.objects.create(user=user, **validated_data)
    
        order_items = []
        subtotal = Decimal('0.00')
    
        # ✅ STEP 1: Create order items with price from ShopOwnerProducts
        for item_data in order_items_data:
            product = item_data['product']
            quantity = item_data['quantity']
        
            try:
                shop_product = ShopOwnerProducts.objects.get(
                    product=product, 
                    shop_owner=user
                )
                unit_price = shop_product.selling_price
                
                if shop_product.quantity < quantity:
                    raise serializers.ValidationError(
                        f"Insufficient stock for {product.product_name}. Available: {shop_product.quantity}, Requested: {quantity}"
                    )
            except ShopOwnerProducts.DoesNotExist:
                raise serializers.ValidationError(f"Product {product.product_name} not found in your inventory")

            # Create order item
            total_price = quantity * unit_price
            order_item = POSOrderItem(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price,
                notes=item_data.get('notes', ''),
                original_stock_batch=None 
            )
            order_items.append(order_item)
            subtotal += total_price

        for item_data in order_items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            shop_product = ShopOwnerProducts.objects.get(
                shop_owner=user, 
                product=product
            )
            shop_product.quantity -= quantity
            shop_product.save()

        POSOrderItem.objects.bulk_create(order_items)
        
        order.subtotal = subtotal
        order.total_amount = subtotal + order.tax_amount - order.discount_amount
        order.save()
        
        return order
