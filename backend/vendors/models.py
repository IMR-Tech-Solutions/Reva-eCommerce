from django.db import models
from accounts.models import UserMaster
from decimal import Decimal

class Vendor(models.Model):
    user = models.ForeignKey(UserMaster, on_delete=models.CASCADE)
    is_self = models.BooleanField(default=False)
    vendor_name = models.CharField(max_length=150, null=True, blank=True)
    contact_person = models.CharField(max_length=150, null=True, blank=True)
    contact_number = models.CharField(max_length=15, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    gst_number = models.CharField(max_length=15, null=True, blank=True)
    pan_number = models.CharField(max_length=10, null=True, blank=True)
    registration_number = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=10, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    account_number = models.CharField(max_length=30, null=True, blank=True)
    ifsc_code = models.CharField(max_length=15, null=True, blank=True)
    upi_id = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'vendor_name'], 
                name='unique_vendor_name_per_user',
                condition=models.Q(vendor_name__isnull=False) & ~models.Q(vendor_name='')
            ),
            models.UniqueConstraint(
                fields=['user', 'email'], 
                name='unique_email_per_user', 
                condition=models.Q(email__isnull=False) & ~models.Q(email='')
            ),
            models.UniqueConstraint(
                fields=['user', 'contact_number'], 
                name='unique_contact_per_user', 
                condition=models.Q(contact_number__isnull=False) & ~models.Q(contact_number='')
            ),
            models.UniqueConstraint(
                fields=['user', 'gst_number'], 
                name='unique_gst_per_user', 
                condition=models.Q(gst_number__isnull=False) & ~models.Q(gst_number='')
            ),
            models.UniqueConstraint(
                fields=['user', 'pan_number'], 
                name='unique_pan_per_user', 
                condition=models.Q(pan_number__isnull=False) & ~models.Q(pan_number='')
            ),
            models.UniqueConstraint(
                fields=['user', 'registration_number'], 
                name='unique_reg_per_user', 
                condition=models.Q(registration_number__isnull=False) & ~models.Q(registration_number='')
            ),
            models.UniqueConstraint(
                fields=['user', 'account_number'], 
                name='unique_acc_per_user', 
                condition=models.Q(account_number__isnull=False) & ~models.Q(account_number='')
            ),
            models.UniqueConstraint(
                fields=['user', 'upi_id'], 
                name='unique_upi_per_user', 
                condition=models.Q(upi_id__isnull=False) & ~models.Q(upi_id='')
            ),
            # Ensure only one self vendor per user
            models.UniqueConstraint(
                fields=['user'], 
                name='unique_self_vendor_per_user',
                condition=models.Q(is_self=True)
            ),
        ]

    def clean_fields(self, exclude=None):
        super().clean_fields(exclude)
        
        # List of fields that should be None if empty
        nullable_fields = [
            'gst_number', 'pan_number', 'registration_number', 'address',
            'state', 'city', 'postal_code', 'bank_name', 'account_number',
            'ifsc_code', 'upi_id'
        ]
        
        for field in nullable_fields:
            value = getattr(self, field)
            if value == '':
                setattr(self, field, None)

    def save(self, *args, **kwargs):
        # Clean empty strings to None before saving
        self.full_clean()
        
        if self.is_self:
            self.vendor_name = f"{self.user.first_name} {self.user.last_name}".strip()
            self.contact_person = self.vendor_name
            self.contact_number = self.user.mobile_number or self.contact_number
            self.email = self.user.email or self.email
            self.state = self.user.state or self.state
            self.city = self.user.city or self.city
            self.postal_code = self.user.postal_code or self.postal_code
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.vendor_name} ({'Self' if self.is_self else 'Vendor'})"


class VendorInvoice(models.Model):
    user = models.ForeignKey(UserMaster, on_delete=models.CASCADE, related_name="vendor_invoices")
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="invoices")
    invoice_number = models.CharField(max_length=50, unique=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'vendor']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.invoice_number} - {self.vendor.vendor_name}"
    
    def generate_invoice_number(self):
        """Generate unique invoice number"""
        from django.utils import timezone
        today = timezone.now()
        prefix = f"VI{today.year}{today.month:02d}{today.day:02d}"
        
        # Get last invoice number for today
        last_invoice = VendorInvoice.objects.filter(
            invoice_number__startswith=prefix
        ).order_by('invoice_number').last()
        
        if last_invoice:
            try:
                last_number = int(last_invoice.invoice_number[-3:])
                new_number = last_number + 1
            except:
                new_number = 1
        else:
            new_number = 1
            
        return f"{prefix}{new_number:03d}"
    
    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = self.generate_invoice_number()
        super().save(*args, **kwargs)