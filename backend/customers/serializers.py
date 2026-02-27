from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "user",
            "user_name",
            "first_name",
            "last_name",
            "email",
            "phone",
            "address",
            "village",
            "city",
            "state",
            "zip_code",
            "country",
            "date_of_birth",
            "gender",
            "num_of_animals",
            "type_of_customer",
            "customer_image",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "user_name",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return ""

    def validate(self, data):
        user = self.instance.user if self.instance else self.context['request'].user
        email = data.get("email")
        phone = data.get("phone")

        # Check for unique email per user
        if email:
            qs = Customer.objects.filter(user=user, email=email)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"email": "Email must be unique per user."})

        # Check for unique phone per user
        if phone:
            qs = Customer.objects.filter(user=user, phone=phone)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"phone": "Phone must be unique per user."})

        return data
