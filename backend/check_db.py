import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newproject.settings')
django.setup()

from accounts.models import UserMaster
from roles.models import RoleMaster

print("--- ROLES ---")
for r in RoleMaster.objects.all():
    print(f"ID: {r.pk}, RoleID: {getattr(r, 'role_id', 'N/A')}, Name: {r.role_name}")

print("\n--- ADMIN USERS ---")
for u in UserMaster.objects.all():
    role_name = u.user_type.role_name if u.user_type else "None"
    role_pk = u.user_type.pk if u.user_type else "None"
    role_id_attr = getattr(u.user_type, 'role_id', 'N/A') if u.user_type else "None"
    
    if role_name.lower() == 'admin' or role_id_attr == 1 or role_pk == 1:
        print(f"Email: {u.email}, RolePK: {role_pk}, RoleID_Attr: {role_id_attr}, RoleName: {role_name}")

print("\n--- ALL USERS SUMMARY ---")
for u in UserMaster.objects.all():
    print(f"Email: {u.email}, Role: {u.user_type.role_name if u.user_type else 'None'}")
