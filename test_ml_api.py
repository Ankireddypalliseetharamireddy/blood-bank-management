import urllib.request
import json
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

data = json.dumps({'username': 'admin', 'password': 'Admin@1234'}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login/', data=data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req, context=ctx) as r:
    token = json.loads(r.read())['access']

payload = {
    'blood_group': 'O+',
    'season': 'summer',
    'location_type': 'urban',
    'current_stock': 20,
    'requests_last_week': 15,
    'donations_last_week': 8,
    'days_since_last_camp': 45,
}
data2 = json.dumps(payload).encode('utf-8')
req2 = urllib.request.Request('http://127.0.0.1:8000/api/ml/predict/', data=data2, headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
try:
    with urllib.request.urlopen(req2, context=ctx) as r:
        print("Success:", r.status)
        print(r.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    err_html = e.read().decode('utf-8')
    with open('error.html', 'w', encoding='utf-8') as f:
        f.write(err_html)
    print("Error saved to error.html")
