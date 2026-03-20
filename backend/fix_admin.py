import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newproject.settings')
django.setup()

from accounts.models import UserMaster
from roles.models import RoleMaster

def fix_admin_user():
    email = "nikhil0021divekar@gmail.com"
    try:
        user = UserMaster.objects.get(email=email.lower())
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Successfully updated user {email}: is_staff=True, is_superuser=True")
    except UserMaster.DoesNotExist:
        print(f"User {email} not found.")

if __name__ == "__main__":
    fix_admin_user()
