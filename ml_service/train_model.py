"""
Train a simple ML model to predict blood demand level.
Run this script once to generate the model files:
   python ml_service/train_model.py
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# ─── Generate synthetic training data ───────────────────────────────────────
np.random.seed(42)
n_samples = 1000

blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
seasons = ['winter', 'spring', 'summer', 'monsoon']
location_types = ['urban', 'semi-urban', 'rural']

data = {
    'blood_group': np.random.choice(blood_groups, n_samples),
    'season': np.random.choice(seasons, n_samples),
    'location_type': np.random.choice(location_types, n_samples),
    'current_stock': np.random.randint(0, 100, n_samples),
    'requests_last_week': np.random.randint(0, 50, n_samples),
    'donations_last_week': np.random.randint(0, 30, n_samples),
    'days_since_last_camp': np.random.randint(1, 90, n_samples),
}

df = pd.DataFrame(data)

# Generate target: demand_level
def generate_demand(row):
    score = 0
    # High demand blood groups
    if row['blood_group'] in ['O+', 'O-', 'AB+']:
        score += 2
    # Seasonal factor
    if row['season'] in ['summer', 'monsoon']:
        score += 1
    # Stock factor
    if row['current_stock'] < 20:
        score += 3
    elif row['current_stock'] < 50:
        score += 1
    # Request vs donation ratio
    if row['requests_last_week'] > row['donations_last_week'] * 1.5:
        score += 2
    # Days since last camp
    if row['days_since_last_camp'] > 60:
        score += 1

    if score <= 2:
        return 'low'
    elif score <= 4:
        return 'medium'
    elif score <= 6:
        return 'high'
    else:
        return 'critical'

df['demand_level'] = df.apply(generate_demand, axis=1)

# ─── Encode categorical features ─────────────────────────────────────────────
le_blood = LabelEncoder()
le_season = LabelEncoder()
le_location = LabelEncoder()

df['blood_group_enc'] = le_blood.fit_transform(df['blood_group'])
df['season_enc'] = le_season.fit_transform(df['season'])
df['location_enc'] = le_location.fit_transform(df['location_type'])

encoders = {
    'blood_group': le_blood,
    'season': le_season,
    'location_type': le_location,
}

feature_cols = [
    'blood_group_enc', 'season_enc', 'location_enc',
    'current_stock', 'requests_last_week',
    'donations_last_week', 'days_since_last_camp'
]
X = df[feature_cols]
y = df['demand_level']

# ─── Train & evaluate ────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"\n✅ Model trained successfully!")
print(f"   Accuracy: {acc * 100:.2f}%")
print(f"\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

# ─── Save model & encoders ───────────────────────────────────────────────────
dir_path = os.path.dirname(os.path.realpath(__file__))
model_path = os.path.join(dir_path, 'blood_demand_model.pkl')
encoder_path = os.path.join(dir_path, 'label_encoder.pkl')

joblib.dump(model, model_path)
joblib.dump(encoders, encoder_path)

print(f"\n💾 Model saved to: {model_path}")
print(f"💾 Encoders saved to: {encoder_path}")
