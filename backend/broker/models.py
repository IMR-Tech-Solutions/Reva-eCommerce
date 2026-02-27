from django.db import models
from django.core.validators import RegexValidator
from accounts.models import UserMaster

class Broker(models.Model):
    broker_name = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$', 
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=10)

    pan_number = models.CharField(max_length=10, blank=True, null=True)
    gst_number = models.CharField(max_length=15, blank=True, null=True)
    license_number = models.CharField(max_length=50, blank=True, null=True)
    default_commission_percent = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        help_text="Default commission percentage (e.g., 2.50 for 2.5%)"
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserMaster, on_delete=models.CASCADE, related_name='created_brokers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['broker_name']
        indexes = [
            models.Index(fields=['broker_name', 'is_active']),
            models.Index(fields=['created_by', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.broker_name} ({self.contact_person})"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        super().clean()
        
        if self.pan_number:
            import re
            if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', self.pan_number):
                raise ValidationError({'pan_number': 'PAN number must be in format: ABCDE1234F'})
        
        if self.gst_number:
            if not re.match(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$', self.gst_number):
                raise ValidationError({'gst_number': 'Invalid GST number format'})
    
    @property
    def total_commission_earned(self):
        from inventory.models import StockBatch
        return StockBatch.objects.filter(
            broker=self,
            broker_commission_amount__isnull=False
        ).aggregate(
            total=models.Sum('broker_commission_amount')
        )['total'] or 0
    
    @property
    def active_stock_batches_count(self):
        return self.stock_batches.filter(batch_status='active').count()
