from rest_framework import serializers
from .models import Vendor, VendorInvoice

class VendorSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'user_name')
        extra_kwargs = {
            'vendor_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'contact_person': {'required': False, 'allow_blank': True, 'allow_null': True},
            'contact_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'email': {'required': False, 'allow_blank': True, 'allow_null': True},
            'gst_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'pan_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'registration_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'address': {'required': False, 'allow_blank': True, 'allow_null': True},
            'state': {'required': False, 'allow_blank': True, 'allow_null': True},
            'city': {'required': False, 'allow_blank': True, 'allow_null': True},
            'postal_code': {'required': False, 'allow_blank': True, 'allow_null': True},
            'bank_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'account_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'ifsc_code': {'required': False, 'allow_blank': True, 'allow_null': True},
            'upi_id': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return ""

    def validate(self, data):
        user = self.instance.user if self.instance else self.context['request'].user
        is_self = data.get('is_self', getattr(self.instance, 'is_self', False))
        
        # Clean empty strings to None
        for field in data:
            if isinstance(data[field], str) and data[field].strip() == '':
                data[field] = None
        
        # Check for only one self vendor
        if is_self:
            existing = Vendor.objects.filter(user=user, is_self=True)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError({
                    "is_self": "You can only have one self vendor."
                })
        
        # Validate required fields for external vendors
        if not is_self:
            required_fields = {
                'vendor_name': 'Vendor Name',
                'contact_person': 'Contact Person',
                'contact_number': 'Contact Number',
                'email': 'Email'
            }
            
            for field, display_name in required_fields.items():
                value = data.get(field)
                if self.instance:
                    # For updates, get existing value if not provided
                    if value is None:
                        value = getattr(self.instance, field, None)
                
                if not value:
                    raise serializers.ValidationError({
                        field: f"{display_name} is required for external vendors."
                    })

        # Validate uniqueness for non-empty fields
        unique_fields = [
            'vendor_name', 'contact_number', 'email', 'gst_number', 
            'pan_number', 'registration_number', 'account_number', 'upi_id'
        ]
        
        for field in unique_fields:
            self._validate_unique_field(field, data, user)

        return data

    def _validate_unique_field(self, field_name, data, user):
        value = data.get(field_name)
        
        # If updating and field not provided, get current value
        if self.instance and field_name not in data:
            value = getattr(self.instance, field_name, None)
        
        # Skip validation for None or empty values
        if not value or value == "":
            return None
        
        # Check for existing values
        filter_dict = {field_name: value, 'user': user}
        qs = Vendor.objects.filter(**filter_dict)
        
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
            
        if qs.exists():
            field_display = field_name.replace('_', ' ').title()
            raise serializers.ValidationError({
                field_name: f"{field_display} already exists for this user."
            })
        
        return None

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['vendor_type'] = 'Self' if instance.is_self else 'External'
        
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if instance.user != request.user:
                # Hide sensitive info for other users' vendors
                sensitive_fields = ['account_number', 'pan_number', 'upi_id']
                for field in sensitive_fields:
                    if data.get(field):
                        data[field] = '***'
        return data


class VendorInvoiceSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorInvoice
        fields = [
            'id', 'invoice_number', 'created_at', 'vendor_name', 
            'total_amount', 'items_count'
        ]
    
    def get_items_count(self, obj):
        return obj.stock_batches.count()


class VendorInvoiceDetailSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    vendor_contact = serializers.CharField(source='vendor.contact_number', read_only=True)
    vendor_email = serializers.CharField(source='vendor.email', read_only=True)
    vendor_address = serializers.CharField(source='vendor.address', read_only=True)
    
    class Meta:
        model = VendorInvoice
        fields = [
            'id', 'invoice_number', 'created_at', 'vendor_name', 
            'vendor_contact', 'vendor_email', 'vendor_address', 'total_amount'
        ]