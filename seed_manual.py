import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
uri = os.getenv('MONGODB_URI')
client = MongoClient(uri)
db = client['blood_bank_db']

print("🌱 Seeding MongoDB directly...")

# Sample Data
inventory_data = [
    {"blood_group": "A+", "units_available": 45, "minimum_threshold": 10},
    {"blood_group": "A-", "units_available": 12, "minimum_threshold": 10},
    {"blood_group": "B+", "units_available": 38, "minimum_threshold": 10},
    {"blood_group": "O+", "units_available": 55, "minimum_threshold": 10},
]

# Using insert_one to avoid bulk write issues if any
for item in inventory_data:
    db.bloodbank_bloodinventory.update_one(
        {"blood_group": item["blood_group"]},
        {"$set": item},
        upsert=True
    )
print("✅ Inventory seeded/updated")

# Admin User (Simplified)
admin = {
    "username": "admin",
    "email": "admin@bloodbank.com",
    "role": "admin",
    "is_staff": True,
    "is_superuser": True,
    "is_active": True,
    "date_joined": datetime.now(),
    "password": "pbkdf2_sha256$600000$xxxx$yyyy" # Placeholder
}
db.accounts_customuser.update_one(
    {"username": "admin"},
    {"$set": admin},
    upsert=True
)
print("✅ Admin user seeded/updated")

print("🎉 Seeding complete!")
