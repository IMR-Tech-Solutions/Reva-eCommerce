from django.db import models
from accounts.models import UserMaster
from categories.models import Category


def default_product_image():
    return "product_images/default.png"


class Product(models.Model):

    user = models.ForeignKey(
        UserMaster,
        on_delete=models.CASCADE,
        related_name="products"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products"
    )

    product_name = models.CharField(max_length=150)
    sku_code = models.CharField(max_length=50)

    # Equipment Specifications
    material = models.CharField(max_length=100, blank=True, null=True)
    capacity = models.CharField(max_length=100, blank=True, null=True)
    pressure = models.CharField(max_length=100, blank=True, null=True)
    flow_rate = models.CharField(max_length=100, blank=True, null=True)
    motor_hp = models.CharField(max_length=100, blank=True, null=True)

    # Ecommerce price
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    product_image = models.ImageField(
        upload_to="product_images/",
        default=default_product_image,
        blank=True,
        null=True
    )

    description = models.TextField(blank=True, null=True)

    unit = models.CharField(max_length=50)

    low_stock_threshold = models.PositiveIntegerField(default=10)

    is_live = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "sku_code"],
                name="unique_sku_per_user"
            )
        ]

    def __str__(self):
        return f"{self.product_name} ({self.category.category_name})"