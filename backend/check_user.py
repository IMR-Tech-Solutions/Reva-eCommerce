import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newproject.settings')
django.setup()

from accounts.models import UserMaster
from roles.models import RoleMaster

email = "nikhil0021divekar@gmail.com"
try:
    u = UserMaster.objects.get(email=email.lower())
    role_name = u.user_type.role_name if u.user_type else "None"
    role_id_attr = getattr(u.user_type, 'role_id', 'N/A') if u.user_type else "None"
    
    print(f"--- USER DATA: {email} ---")
    print(f"ID: {u.id}")
    print(f"Is Staff: {u.is_staff}")
    print(f"Is Superuser: {u.is_superuser}")
    print(f"Role ID (Attr): {role_id_attr}")
    print(f"Role Name: {role_name}")
    print(f"User Type PK: {u.user_type.pk if u.user_type else 'None'}")
    
except UserMaster.DoesNotExist:
    print(f"User {email} not found.")

print("\n--- ALL ROLES ---")
for r in RoleMaster.objects.all():
    print(f"ID: {r.pk}, RoleID Attr: {getattr(r, 'role_id', 'N/A')}, Name: {r.role_name}")
