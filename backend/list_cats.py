import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newproject.settings')
django.setup()

from categories.models import Category

def list_categories():
    categories = Category.objects.all()
    if not categories.exists():
        print("No categories found.")
        return

    print(f"Total categories: {categories.count()}")
    for cat in categories:
        print(f"Name: {cat.category_name}, Owner: {cat.user.email}, Is Staff: {cat.user.is_staff}")

if __name__ == "__main__":
    list_categories()
