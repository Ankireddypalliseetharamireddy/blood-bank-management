"""
Seed the database with initial data.
Run: python seed_data.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from bloodbank.models import BloodInventory, BloodCompatibility, Donation, BloodRequest
from datetime import date, timedelta
import random

User = get_user_model()

print("🌱 Seeding database...")

# ─── Create admin ────────────────────────────────────────────────────────────
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@bloodbank.com',
        'role': 'admin',
        'first_name': 'Super',
        'last_name': 'Admin',
        'is_staff': True,
        'is_superuser': True,
    }
)
if created:
    admin_user.set_password('Admin@1234')
    admin_user.save()
    print("   ✅ Admin created: admin / Admin@1234")
else:
    print("   ℹ️  Admin already exists")

# ─── Create donor accounts ───────────────────────────────────────────────────
donors_data = [
    {'username': 'donor1', 'first_name': 'Ravi', 'last_name': 'Kumar', 'blood_group': 'O+', 'phone': '9876543210'},
    {'username': 'donor2', 'first_name': 'Priya', 'last_name': 'Sharma', 'blood_group': 'A+', 'phone': '9876543211'},
    {'username': 'donor3', 'first_name': 'Amit', 'last_name': 'Singh', 'blood_group': 'B+', 'phone': '9876543212'},
    {'username': 'donor4', 'first_name': 'Sneha', 'last_name': 'Patel', 'blood_group': 'AB+', 'phone': '9876543213'},
    {'username': 'donor5', 'first_name': 'Raj', 'last_name': 'Verma', 'blood_group': 'O-', 'phone': '9876543214'},
]

for d in donors_data:
    user, c = User.objects.get_or_create(username=d['username'], defaults={
        **d,
        'email': f"{d['username']}@example.com",
        'role': 'donor',
        'date_of_birth': date(1995, 1, 15),
        'last_donation_date': date.today() - timedelta(days=random.randint(100, 300)),
        'total_donations': random.randint(1, 10),
    })
    if c:
        user.set_password('Donor@1234')
        user.save()

print(f"   ✅ {len(donors_data)} donor accounts created (password: Donor@1234)")

# ─── Create hospital account ─────────────────────────────────────────────────
hospital, created = User.objects.get_or_create(
    username='aiims_hospital',
    defaults={
        'email': 'aiims@hospital.com',
        'role': 'hospital',
        'first_name': 'AIIMS',
        'last_name': 'Hospital',
        'phone': '01126588500',
        'address': 'Ansari Nagar East, New Delhi',
    }
)
if created:
    hospital.set_password('Hospital@1234')
    hospital.save()
    print("   ✅ Hospital created: aiims_hospital / Hospital@1234")

# ─── Initialize Blood Inventory ──────────────────────────────────────────────
inventory_data = [
    ('A+', 45), ('A-', 12), ('B+', 38), ('B-', 8),
    ('AB+', 20), ('AB-', 5), ('O+', 55), ('O-', 15),
]
for bg, units in inventory_data:
    BloodInventory.objects.update_or_create(
        blood_group=bg,
        defaults={'units_available': units, 'minimum_threshold': 10}
    )
print("   ✅ Blood inventory initialized")

# ─── Initialize Blood Compatibility ─────────────────────────────────────────
compatibility_data = {
    'A+':  {'to': ['A+', 'AB+'], 'from': ['A+', 'A-', 'O+', 'O-']},
    'A-':  {'to': ['A+', 'A-', 'AB+', 'AB-'], 'from': ['A-', 'O-']},
    'B+':  {'to': ['B+', 'AB+'], 'from': ['B+', 'B-', 'O+', 'O-']},
    'B-':  {'to': ['B+', 'B-', 'AB+', 'AB-'], 'from': ['B-', 'O-']},
    'AB+': {'to': ['AB+'], 'from': ['A+','A-','B+','B-','AB+','AB-','O+','O-']},
    'AB-': {'to': ['AB+', 'AB-'], 'from': ['A-', 'B-', 'AB-', 'O-']},
    'O+':  {'to': ['A+', 'B+', 'AB+', 'O+'], 'from': ['O+', 'O-']},
    'O-':  {'to': ['A+','A-','B+','B-','AB+','AB-','O+','O-'], 'from': ['O-']},
}
for bg, compat in compatibility_data.items():
    BloodCompatibility.objects.update_or_create(
        blood_group=bg,
        defaults={'can_donate_to': compat['to'], 'can_receive_from': compat['from']}
    )
print("   ✅ Blood compatibility data initialized")

# ─── Create sample blood requests ───────────────────────────────────────────
req_data = [
    {'patient_name': 'Meena Devi', 'blood_group': 'B+', 'units': 2, 'urgency': 'high'},
    {'patient_name': 'Suresh Arora', 'blood_group': 'O+', 'units': 1, 'urgency': 'medium'},
    {'patient_name': 'Kavya Nair', 'blood_group': 'AB-', 'units': 3, 'urgency': 'critical'},
]
for r in req_data:
    BloodRequest.objects.get_or_create(
        patient_name=r['patient_name'],
        defaults={
            'requester': hospital,
            'blood_group': r['blood_group'],
            'units_requested': r['units'],
            'urgency': r['urgency'],
            'hospital_name': 'AIIMS Hospital',
            'reason': 'Emergency surgery requirement',
            'required_by': date.today() + timedelta(days=2),
            'status': 'pending',
        }
    )
print("   ✅ Sample blood requests created")

print("\n🎉 Database seeded successfully!")
print("\nLogin Credentials:")
print("   Admin:    admin / Admin@1234")
print("   Donor:    donor1 / Donor@1234 (blood group: O+)")
print("   Hospital: aiims_hospital / Hospital@1234")
