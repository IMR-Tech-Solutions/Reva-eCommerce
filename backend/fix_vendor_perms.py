import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newproject.settings')
django.setup()

from roles.models import RoleMaster
from usermodules.models import UserRoleModulePermission

def fix_vendor_permissions():
    role = RoleMaster.objects.filter(role_name='vendor').first()
    if not role:
        print("Vendor role not found.")
        return

    print(f"Fixing permissions for role: {role.role_name}")
    
    required_permissions = [
        'view-categories', 'add-product', 'view-products', 
        'update-product', 'delete-product', 'view-stock-batch',
        'add-stock-batch', 'update-stock-batch', 'view-customers',
        'view-pos-orders', 'view-pos', 'shop-access'
    ]
    
    current_perms = set(UserRoleModulePermission.objects.filter(user_role=role).values_list('module_permission', flat=True))
    
    to_add = [perm for perm in required_permissions if perm not in current_perms]
    
    if to_add:
        permission_objs = [
            UserRoleModulePermission(user_role=role, module_permission=perm)
            for perm in to_add
        ]
        UserRoleModulePermission.objects.bulk_create(permission_objs)
        print(f"Added permissions: {to_add}")
    else:
        print("Vendor role already has all required permissions.")

if __name__ == "__main__":
    fix_vendor_permissions()
