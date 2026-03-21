from django.urls import path
from .views import BloodDemandPredictionView, BulkPredictionView, DonorEligibilityView

urlpatterns = [
    path('predict/', BloodDemandPredictionView.as_view(), name='ml-predict'),
    path('predict/bulk/', BulkPredictionView.as_view(), name='ml-predict-bulk'),
    path('eligibility/', DonorEligibilityView.as_view(), name='ml-eligibility'),
]
