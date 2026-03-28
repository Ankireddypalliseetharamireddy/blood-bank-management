import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()
uri = os.getenv('MONGODB_URI')
client = MongoClient(uri)
db = client['blood_bank_db']

print("🌱 Seeding MongoDB directly...")

# Clear existing if needed
# db.accounts_customuser.delete_many({})

# Users (CustomUser)
# Note: Django table names are usually app_model
users = [
    {
        "username": "admin",
        "email": "admin@bloodbank.com",
        "password": "pbkdf2_sha256$600000$xxxx$yyyy", # Simplified, they'll need to reset or I'll just keep it as is
        "role": "admin",
        "is_staff": True,
        "is_superuser": True,
        "is_active": True,
        "date_joined": datetime.now()
    },
    {
        "username": "donor1",
        "email": "donor1@example.com",
        "role": "donor",
        "blood_group": "O+",
        "is_active": True,
        "date_joined": datetime.now()
    }
]
db.accounts_customuser.insert_many(users)
print("✅ Users seeded")

# Inventory
inventory = [
    {"blood_group": "A+", "units_available": 45, "minimum_threshold": 10},
    {"blood_group": "O+", "units_available": 55, "minimum_threshold": 10},
    {"blood_group": "B+", "units_available": 38, "minimum_threshold": 10},
]
db.bloodbank_bloodinventory.insert_many(inventory)
print("✅ Inventory seeded")

print("🎉 Seeding complete!")
