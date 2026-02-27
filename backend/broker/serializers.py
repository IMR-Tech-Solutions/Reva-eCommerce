from rest_framework import serializers
from .models import Broker

class BrokerSerializer(serializers.ModelSerializer):
    total_commission_earned = serializers.ReadOnlyField()
    active_stock_batches_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Broker
        fields = [
            'id', 'broker_name', 'contact_person', 'phone_number', 'email',
            'address', 'city', 'state', 'postal_code', 'pan_number', 'gst_number',
            'license_number', 'default_commission_percent', 'is_active',
            'total_commission_earned', 'active_stock_batches_count',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']
    
    def validate_broker_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Broker name must be at least 2 characters long")
        return value.strip()
    
    def validate_default_commission_percent(self, value):
        if value < 0:
            raise serializers.ValidationError("Commission percentage cannot be negative")
        if value > 100:
            raise serializers.ValidationError("Commission percentage cannot exceed 100%")
        return value

class BrokerListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Broker
        fields = ['id', 'broker_name', 'contact_person', 'phone_number', 'default_commission_percent', 'is_active']
