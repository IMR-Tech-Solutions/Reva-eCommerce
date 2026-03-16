from django.db import models
from django.utils.text import slugify
from accounts.models import UserMaster

def default_category_image():
    return 'category_images/default.png'

class Category(models.Model):
    user = models.ForeignKey(UserMaster, on_delete=models.CASCADE)
    category_name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    category_image = models.ImageField(
        upload_to="category_images/",
        null=True,
        blank=True,
        default=default_category_image
    )
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.category_name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category_name} ({self.user.email})"
