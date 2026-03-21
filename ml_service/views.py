from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings
import joblib
import os
import numpy as np


def load_model():
    """Load the model and encoders lazily."""
    model_path = settings.ML_MODEL_PATH
    encoder_path = settings.ML_ENCODER_PATH
    if not os.path.exists(model_path) or not os.path.exists(encoder_path):
        return None, None
    model = joblib.load(model_path)
    encoders = joblib.load(encoder_path)
    return model, encoders


class BloodDemandPredictionView(APIView):
    """
    Predict blood demand level for a given set of conditions.
    POST body:
        blood_group: str (e.g. "O+")
        season: str ("winter" | "spring" | "summer" | "monsoon")
        location_type: str ("urban" | "semi-urban" | "rural")
        current_stock: int
        requests_last_week: int
        donations_last_week: int
        days_since_last_camp: int
    """
    permission_classes = [permissions.IsAuthenticated]

    DEMAND_INFO = {
        'low': {
            'color': '#22c55e',
            'description': 'Blood supply is adequate. No immediate action required.',
            'recommendation': 'Maintain regular donation drives to keep inventory stable.'
        },
        'medium': {
            'color': '#f59e0b',
            'description': 'Moderate demand expected. Monitor inventory levels closely.',
            'recommendation': 'Consider scheduling a donation camp in the next 2-3 weeks.'
        },
        'high': {
            'color': '#f97316',
            'description': 'High demand predicted. Inventory may be insufficient.',
            'recommendation': 'Urgently schedule donation camps and reach out to regular donors.'
        },
        'critical': {
            'color': '#ef4444',
            'description': 'Critical shortage predicted! Immediate action required.',
            'recommendation': 'Emergency donation drives needed. Contact neighboring blood banks for transfers.'
        },
    }

    def post(self, request):
        model, encoders = load_model()
        if model is None:
            return Response(
                {'error': 'ML model not found. Please run: python ml_service/train_model.py'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        data = request.data
        required_fields = [
            'blood_group', 'season', 'location_type',
            'current_stock', 'requests_last_week',
            'donations_last_week', 'days_since_last_camp'
        ]
        for field in required_fields:
            if field not in data:
                return Response({'error': f'Missing field: {field}'}, status=400)

        try:
            blood_enc = encoders['blood_group'].transform([data['blood_group']])[0]
            season_enc = encoders['season'].transform([data['season']])[0]
            loc_enc = encoders['location_type'].transform([data['location_type']])[0]
        except ValueError as e:
            return Response({'error': f'Invalid categorical value: {str(e)}'}, status=400)

        features = np.array([[
            blood_enc, season_enc, loc_enc,
            int(data['current_stock']),
            int(data['requests_last_week']),
            int(data['donations_last_week']),
            int(data['days_since_last_camp']),
        ]])

        prediction = str(model.predict(features)[0])
        probabilities = model.predict_proba(features)[0]
        classes = model.classes_

        prob_dict = {str(cls): round(float(prob) * 100, 1) for cls, prob in zip(classes, probabilities)}
        info = self.DEMAND_INFO.get(prediction, {})

        return Response({
            'blood_group': data['blood_group'],
            'prediction': prediction,
            'confidence': round(float(max(probabilities)) * 100, 1),
            'probabilities': prob_dict,
            'color': info.get('color', '#6b7280'),
            'description': info.get('description', ''),
            'recommendation': info.get('recommendation', ''),
        })


class BulkPredictionView(APIView):
    """Predict demand for all blood groups at once given common conditions."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        model, encoders = load_model()
        if model is None:
            return Response({'error': 'ML model not found.'}, status=503)

        blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        results = []

        from bloodbank.models import BloodInventory
        inventory_map = {inv.blood_group: inv.units_available
                         for inv in BloodInventory.objects.all()}

        season = request.data.get('season', 'summer')
        location_type = request.data.get('location_type', 'urban')
        requests_last_week = int(request.data.get('requests_last_week', 10))
        donations_last_week = int(request.data.get('donations_last_week', 5))
        days_since_last_camp = int(request.data.get('days_since_last_camp', 30))

        for bg in blood_groups:
            try:
                blood_enc = encoders['blood_group'].transform([bg])[0]
                season_enc = encoders['season'].transform([season])[0]
                loc_enc = encoders['location_type'].transform([location_type])[0]
                current_stock = inventory_map.get(bg, 0)

                features = np.array([[
                    blood_enc, season_enc, loc_enc,
                    current_stock, requests_last_week,
                    donations_last_week, days_since_last_camp
                ]])

                prediction = str(model.predict(features)[0])
                confidence = round(float(max(model.predict_proba(features)[0])) * 100, 1)

                results.append({
                    'blood_group': bg,
                    'current_stock': current_stock,
                    'prediction': prediction,
                    'confidence': confidence,
                })
            except Exception:
                results.append({'blood_group': bg, 'prediction': 'unknown', 'current_stock': 0})

        return Response({'results': results, 'season': season, 'location_type': location_type})


class DonorEligibilityView(APIView):
    """Check if the currently logged-in donor is eligible to donate blood."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        from datetime import date
        today = date.today()

        issues = []
        eligible = True

        if not user.date_of_birth:
            issues.append('Date of birth not set in profile.')
        else:
            age = (today - user.date_of_birth).days // 365
            if age < 18:
                eligible = False
                issues.append(f'Age {age} is below minimum (18 years).')
            elif age > 65:
                eligible = False
                issues.append(f'Age {age} exceeds maximum (65 years).')

        if user.last_donation_date:
            days_since = (today - user.last_donation_date).days
            if days_since < 90:
                eligible = False
                issues.append(f'Only {days_since} days since last donation. Minimum gap is 90 days.')

        return Response({
            'eligible': eligible,
            'user': user.username,
            'blood_group': user.blood_group,
            'last_donation_date': user.last_donation_date,
            'issues': issues,
            'recommendation': (
                'You are eligible to donate blood. Thank you for being a hero!'
                if eligible else
                'You are currently not eligible to donate. Please address the issues above.'
            ),
        })
