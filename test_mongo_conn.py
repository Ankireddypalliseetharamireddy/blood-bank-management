import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGODB_URI')
print(f"Connecting to: {uri.split('@')[1] if uri else 'None'}")

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("✅ Connection successful!")
except Exception as e:
    print(f"❌ Connection failed: {e}")
