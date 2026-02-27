from rest_framework import serializers
from .models import StockBatch
from vendors.models import Vendor
from django.db import transaction
from django.utils import timezone
from vendors.models import VendorInvoice
from decimal import Decimal

class StockBatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockBatch
        fields = [
            'id','user_id', 'product', 'reference_number', 'quantity','original_quantity',
            'purchase_price', 'selling_price', 'manufacture_date','tax_amount',
            'expiry_date', 'batch_status', 'created_at','broker', 'broker_commission_percent','broker_commission_amount'
        ]
        read_only_fields = ['id', 'created_at','user_id',]
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate_tax_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Tax amount cannot be negative")
        return value
    
    def validate_batch_status(self, value):
        if value == 'expired':
            raise serializers.ValidationError("Cannot manually set batch status to 'expired'. Batches are automatically expired when expiry date passes.")
        return value
    
    def validate_reference_number(self, value):
        if not value:  
            return None
        return value

    def validate(self, attrs):
        purchase_price = attrs.get('purchase_price')
        selling_price = attrs.get('selling_price')
        broker = attrs.get('broker')
        commission_percent = attrs.get('broker_commission_percent')

        if broker and not commission_percent:
            pass
        elif broker and commission_percent is not None:
            if commission_percent < 0:
                raise serializers.ValidationError({
                    'broker_commission_percent': 'Commission percentage cannot be negative'
                })
            if commission_percent > 100:
                raise serializers.ValidationError({
                    'broker_commission_percent': 'Commission percentage cannot exceed 100%'
                })

        if purchase_price and selling_price:
            if selling_price < purchase_price:
                raise serializers.ValidationError({
                    'selling_price': 'Selling price must be greater than or equal to purchase price'
                })

        manufacture_date = attrs.get('manufacture_date')
        expiry_date = attrs.get('expiry_date')
        
        if manufacture_date and expiry_date:
            if expiry_date <= manufacture_date:
                raise serializers.ValidationError({
                    'expiry_date': 'Expiry date must be after manufacture date'
                })

        batch_status = attrs.get('batch_status')
        if batch_status == 'active' and expiry_date and expiry_date < timezone.now().date():
            raise serializers.ValidationError({
                'batch_status': 'Cannot set expired batch as active'
            })
        
        if attrs.get('batch_status') == 'active':
            product = attrs.get('product')
            user = self.context['request'].user if 'request' in self.context else attrs.get('user')
            if product and user:
                existing_active = StockBatch.objects.filter(
                    product=product,
                    user=user,
                    batch_status='active'
                )
                if hasattr(self, 'instance') and self.instance:
                    existing_active = existing_active.exclude(id=self.instance.id)          
                if existing_active.exists():
                    raise serializers.ValidationError({
                        'batch_status': f'User already has an active batch: {existing_active.first().id}'
                    })            
        return attrs

class StockBatchBulkCreateSerializer(serializers.Serializer):
    vendor_id = serializers.PrimaryKeyRelatedField(queryset=Vendor.objects.filter(is_active=True))
    stock_batches = StockBatchCreateSerializer(many=True)
    auto_activate_first = serializers.BooleanField(default=False, help_text="Automatically activate first batch if no active batch exists for products")
    
    def validate_stock_batches(self, value):
        if not value:
            raise serializers.ValidationError("At least one stock batch is required")

        batch_codes = [batch.get('id') for batch in value if batch.get('id')]
        if len(batch_codes) != len(set(batch_codes)):
            raise serializers.ValidationError("Duplicate batch ids found in the request")
        product_user_active_count = {}
        for batch in value:
            if batch.get('batch_status') == 'active':
                product_id = batch.get('product').id if hasattr(batch.get('product'), 'id') else batch.get('product')
                user_id = batch.get('user').id if hasattr(batch.get('user'), 'id') else batch.get('user') or self.context['request'].user.id
                key = (user_id, product_id)
                product_user_active_count[key] = product_user_active_count.get(key, 0) + 1
                
                if product_user_active_count[key] > 1:
                    raise serializers.ValidationError("Cannot have multiple active batches for the same product for the same user in one request")
        return value
    
    def create(self, validated_data):
        vendor = validated_data['vendor_id']
        batches_data = validated_data['stock_batches']
        user = self.context['request'].user
        auto_activate_first = self.context.get('auto_activate_first', False)
        batch_id = [batch_data.get('id') for batch_data in batches_data]
        existing_codes = StockBatch.objects.filter(id__in=batch_id).values_list('id', flat=True)
        if existing_codes:
            raise serializers.ValidationError({
            'stock_batches': f'Batch id already exist: {", ".join(existing_codes)}'
        })
    
        with transaction.atomic():
            vendor_invoice = VendorInvoice.objects.create(
            user=self.context['request'].user,
            vendor=vendor
            )
            created_batches = []
            products_with_new_batches = set()
            total_amount = Decimal('0.00')
            for batch_data in batches_data:
                stock_batch = StockBatch(vendor=vendor, user=user,**batch_data)
                stock_batch.vendor_invoice = vendor_invoice
                stock_batch.original_quantity = stock_batch.quantity
                stock_batch.save()
                created_batches.append(stock_batch)
                broker = batch_data.get('broker')
                commission_percent = batch_data.get('broker_commission_percent')
                if broker and not commission_percent:
                    batch_data['broker_commission_percent'] = broker.default_commission_percent
                products_with_new_batches.add(batch_data['product'].id)
                batch_total = Decimal(str(stock_batch.purchase_price)) * stock_batch.quantity
                total_amount += batch_total
                vendor_invoice.total_amount = total_amount
                vendor_invoice.save()
        
            if auto_activate_first:
                for product_id in products_with_new_batches:
                    if not StockBatch.objects.filter(
                        product_id=product_id,
                        user=user,
                        batch_status='active'
                        ).exists():
                        first_batch = StockBatch.objects.filter(product_id=product_id, user=user,batch_status='not_active').exclude(expiry_date__lt=timezone.now().date()).order_by('expiry_date').first()
                        if first_batch:
                            first_batch.make_active()
            return {
                "vendor_id": vendor.id, 
                "created_count": len(created_batches), 
                "auto_activated": auto_activate_first,
                "invoice_number": vendor_invoice.invoice_number,
                "invoice_id": vendor_invoice.id,
            }

class BatchStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockBatch
        fields = ['batch_status']
    
    def validate_batch_status(self, value):
        if value not in dict(StockBatch.BATCH_STATUS_CHOICES):
            raise serializers.ValidationError("Invalid batch status")
        
        if value == 'expired':
            raise serializers.ValidationError("Cannot manually set batch status to 'expired'. Batches are automatically expired when expiry date passes.")
        
        if hasattr(self, 'instance') and self.instance:
            if self.instance.batch_status == 'expired':
                raise serializers.ValidationError("Cannot change status of expired batch")
            
            if value == 'active' and self.instance.is_expired():
                raise serializers.ValidationError("Cannot activate expired batch")
        
        return value
    
    def update(self, instance, validated_data):
        new_status = validated_data['batch_status']
        old_status = instance.batch_status
        
        if old_status == 'expired':
            raise serializers.ValidationError("Cannot update expired batch status")
        with transaction.atomic():
            if new_status == 'active':
                instance.make_active()
            elif self.context.get('mark_as_sold') and new_status == 'sold':
                next_batch = instance.mark_as_sold()
                instance._next_active_batch = next_batch
            else:
                instance.batch_status = new_status
                instance.save()
        return instance

class StockBatchDetailSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    broker_name = serializers.CharField(source='broker.broker_name', read_only=True)
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    is_expired = serializers.SerializerMethodField()
    purchase_invoice_number = serializers.CharField(source='vendor_invoice.invoice_number', read_only=True)
    
    class Meta:
        model = StockBatch
        fields = [
            'id', 'vendor','user_id', 'vendor_name', 'product', 'product_name', 
            'reference_number', 'quantity','original_quantity', 'purchase_price', 'selling_price','purchase_invoice_number',
            'broker', 'broker_name', 'broker_commission_percent', 'broker_commission_amount',
            'manufacture_date', 'expiry_date', 'batch_status', 'is_expired', 'created_at'
        ]
        read_only_fields = ['id', 'created_at','user_id', 'vendor_name', 'product_name', 'broker_name', 'broker_commission_amount','is_expired']
    
    def get_is_expired(self, obj):
        return obj.is_expired()

class StockBatchUpdateSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    broker_name = serializers.CharField(source='broker.broker_name', read_only=True)
    class Meta:
        model = StockBatch
        fields = [
            'id', 'vendor','user_id', 'vendor_name', 'product', 'product_name', 
            'reference_number', 'quantity','original_quantity', 'purchase_price', 'selling_price','broker', 'broker_name',
            'broker_commission_percent', 'broker_commission_amount','manufacture_date', 'expiry_date', 'batch_status', 'created_at'
        ]
        read_only_fields = ['id','user_id', 'created_at','vendor','vendor_name', 'product_name', 'batch_status','product','original_quantity','broker_name', 'broker_commission_amount']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_reference_number(self, value):
        instance = getattr(self, 'instance', None)
        if instance and instance.reference_number != value:
            if StockBatch.objects.filter(reference_number=value).exists():
                raise serializers.ValidationError("Reference Number already exists")
        return value
    
    def validate(self, attrs):
        instance = getattr(self, 'instance', None)
        if instance and instance.batch_status == 'expired':
            raise serializers.ValidationError("Cannot update expired batch")
        purchase_price = attrs.get('purchase_price', instance.purchase_price if instance else None)
        selling_price = attrs.get('selling_price', instance.selling_price if instance else None)
        if purchase_price and selling_price:
            if selling_price < purchase_price:
                raise serializers.ValidationError({
                    'selling_price': 'Selling price must be greater than or equal to purchase price'
                })
        
        manufacture_date = attrs.get('manufacture_date', instance.manufacture_date if instance else None)
        expiry_date = attrs.get('expiry_date', instance.expiry_date if instance else None)
        
        if manufacture_date and expiry_date:
            if expiry_date <= manufacture_date:
                raise serializers.ValidationError({
                    'expiry_date': 'Expiry date must be after manufacture date'
                })
         
        if instance:
            if instance.batch_status in ['sold', 'damaged', 'expired']:
                raise serializers.ValidationError(
                    f'Cannot update {instance.batch_status} batch'
                )
            new_product = attrs.get('product')
            if new_product and new_product != instance.product and instance.batch_status == 'active':
                raise serializers.ValidationError({
                    'product': 'Cannot change product for an active batch'
                })
        
        return attrs