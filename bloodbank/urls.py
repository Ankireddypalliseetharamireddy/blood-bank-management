from django.urls import path
from .views import (
    BloodInventoryListView, BloodInventoryUpdateView, InitializeInventoryView,
    DonationListCreateView, DonationDetailView,
    BloodRequestListCreateView, BloodRequestDetailView,
    BloodCompatibilityListView, InitializeCompatibilityView,
)

urlpatterns = [
    # Inventory
    path('inventory/', BloodInventoryListView.as_view(), name='inventory-list'),
    path('inventory/initialize/', InitializeInventoryView.as_view(), name='inventory-init'),
    path('inventory/<int:pk>/', BloodInventoryUpdateView.as_view(), name='inventory-detail'),

    # Donations
    path('donations/', DonationListCreateView.as_view(), name='donation-list'),
    path('donations/<int:pk>/', DonationDetailView.as_view(), name='donation-detail'),

    # Blood Requests
    path('requests/', BloodRequestListCreateView.as_view(), name='request-list'),
    path('requests/<int:pk>/', BloodRequestDetailView.as_view(), name='request-detail'),

    # Compatibility
    path('compatibility/', BloodCompatibilityListView.as_view(), name='compatibility-list'),
    path('compatibility/initialize/', InitializeCompatibilityView.as_view(), name='compatibility-init'),
]
