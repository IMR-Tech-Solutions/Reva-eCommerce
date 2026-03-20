import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newproject.settings')
django.setup()

from roles.models import RoleMaster
from usermodules.models import UserRoleModulePermission

def check_vendor():
    role = RoleMaster.objects.filter(role_name='vendor').first()
    if not role:
        print("Vendor role not found.")
        return

    print(f"Role: {role.role_name} (ID: {role.pk})")
    perms = UserRoleModulePermission.objects.filter(user_role=role)
    print(f"Permissions: {[p.module_permission for p in perms]}")

if __name__ == "__main__":
    check_vendor()
