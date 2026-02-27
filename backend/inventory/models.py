from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from products.models import Product
from vendors.models import Vendor, VendorInvoice
from accounts.models import UserMaster
from broker.models import Broker

class StockBatch(models.Model):
    BATCH_STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('not_active', 'Not Active'),
        ('damaged', 'Damaged'),
        ('expired', 'Expired'),
    ]
    
    user = models.ForeignKey(UserMaster, on_delete=models.CASCADE)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='stock_batches')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_batches')
    reference_number = models.CharField(max_length=100, null=True, blank=True)
    original_quantity = models.PositiveIntegerField(null=True, blank=True)
    quantity = models.PositiveIntegerField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        default=0.00,
    )
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    manufacture_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    batch_status = models.CharField(max_length=20, choices=BATCH_STATUS_CHOICES, default='not_active')
    vendor_invoice = models.ForeignKey(
        VendorInvoice,
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='stock_batches'
    )

    broker = models.ForeignKey(
        Broker, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='stock_batches',
        help_text="Broker who facilitated this purchase"
    )
    broker_commission_percent = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True,
        blank=True,
    )
    broker_commission_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        help_text="Calculated commission amount"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user','product'], 
                condition=models.Q(batch_status='active'),
                name='unique_active_batch_per_user_product'
            )
        ]

    def __str__(self):
        broker_info = f" | Broker: {self.broker.broker_name}" if self.broker else ""
        return f"{self.product.product_name} | Batch: {self.id} | Vendor: {self.vendor.vendor_name}{broker_info}"
    
    def is_expired(self):
        if self.expiry_date:
            return self.expiry_date < timezone.now().date()
        return False


    def calculate_commission(self):
        if self.broker and self.broker_commission_percent is not None and self.broker_commission_percent > 0:
            total_purchase_value = self.original_quantity * self.purchase_price
            commission = (total_purchase_value * self.broker_commission_percent) / 100
            return round(commission, 2)
        return 0.00

    def clean(self):
        super().clean()

        if self.tax_amount is not None and self.tax_amount < 0:
            raise ValidationError({'tax_amount': 'Tax amount cannot be negative'})
        
        if self.reference_number:
            user = self.product.user
            exists = StockBatch.objects.filter(
                reference_number=self.reference_number,
                product__user=user
            ).exclude(id=self.id)
            if exists.exists():
                raise ValidationError(
                    f'Reference number "{self.reference_number}" already exists for one of your products.'
                )
        
        if self.broker:
            if self.broker_commission_percent is not None:
                if self.broker_commission_percent < 0:
                    raise ValidationError({'broker_commission_percent': 'Commission percentage cannot be negative'})
                if self.broker_commission_percent > 100:
                    raise ValidationError({'broker_commission_percent': 'Commission percentage cannot exceed 100%'})
        
        self.broker_commission_amount = self.calculate_commission()
        
        if self.is_expired() and self.batch_status not in ['expired', 'sold', 'damaged']:
            self.batch_status = 'expired'
        
        if self.batch_status == 'expired' and not self.is_expired():
            raise ValidationError(
                'Cannot manually set batch status to expired. Batches are automatically expired when expiry date passes.'
            )
        
        if self.batch_status == 'active' and self.is_expired():
            raise ValidationError('Cannot activate expired batch')
        
        if self.batch_status == 'active':
            existing_active = StockBatch.objects.filter(
                user=self.user,
                product=self.product, 
                batch_status='active'
            ).exclude(id=self.id)
            
            if existing_active.exists():
                raise ValidationError(
                    f'User "{self.user.first_name}" already has an active batch: {existing_active.first().id}'
                )

    def save(self, *args, **kwargs):

        if self.broker and not self.broker_commission_percent:
            self.broker_commission_percent = self.broker.default_commission_percent

        if self.broker and self.broker_commission_percent > 0:
            self.broker_commission_amount = self.calculate_commission()
        
        if self.is_expired() and self.batch_status not in ['expired', 'sold', 'damaged']:
            self.batch_status = 'expired'
        self.clean()
        super().save(*args, **kwargs)

    @property
    def total_cost_including_all(self):
        base_cost = self.quantity * self.purchase_price
        commission = self.broker_commission_amount or 0
        tax = self.tax_amount or 0
        return base_cost + commission + tax

    def make_active(self):
        if self.is_expired():
            raise ValidationError("Cannot activate expired batch")
        with transaction.atomic():
            StockBatch.objects.filter(
                user=self.user,
                product=self.product,
                batch_status='active'
            ).exclude(id=self.id).update(batch_status='not_active')
            self.batch_status = 'active'
            self.save()

    def mark_as_sold(self):
        with transaction.atomic():
            self.batch_status = 'sold'
            self.save()
            next_batch = StockBatch.objects.filter(
                user=self.user,
                product=self.product,
                batch_status='not_active',
                quantity__gt=0
            ).exclude(
                expiry_date__lt=timezone.now().date() 
            ).order_by('expiry_date').first()
            
            if next_batch:
                next_batch.make_active()
                return next_batch
            return None

    def mark_as_expired(self):
        with transaction.atomic():
            was_active = self.batch_status == 'active'
            self.batch_status = 'expired'
            self.save()
            if was_active:
                next_batch = StockBatch.objects.filter(
                    user=self.user,
                    product=self.product,
                    batch_status='not_active',
                    quantity__gt=0
                ).exclude(
                    expiry_date__lt=timezone.now().date()
                ).order_by('expiry_date').first()
                
                if next_batch:
                    next_batch.make_active()
                    return next_batch
            return None

    @classmethod
    def update_expired_batches(cls):
        today = timezone.now().date()
        expired_batches = cls.objects.filter(
            expiry_date__lt=today,
            batch_status__in=['active', 'not_active']
        )
        
        if expired_batches.exists():
            with transaction.atomic():
                count = 0
                active_expired = expired_batches.filter(batch_status='active')
                for batch in active_expired:
                    batch.mark_as_expired()
                    count += 1
                inactive_count = expired_batches.filter(batch_status='not_active').count()
                expired_batches.filter(batch_status='not_active').update(batch_status='expired')
                count += inactive_count
                
                return count
        return 0
