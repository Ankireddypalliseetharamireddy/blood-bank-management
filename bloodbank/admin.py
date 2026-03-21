from django.contrib import admin
from .models import BloodInventory, Donation, BloodRequest, BloodCompatibility


@admin.register(BloodInventory)
class BloodInventoryAdmin(admin.ModelAdmin):
    list_display = ['blood_group', 'units_available', 'minimum_threshold', 'is_low', 'last_updated']
    list_filter = ['blood_group']


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['donor', 'blood_group', 'units_donated', 'donation_date', 'status']
    list_filter = ['blood_group', 'status']
    search_fields = ['donor__username', 'donor__email']


@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ['patient_name', 'blood_group', 'units_requested', 'urgency', 'status', 'required_by']
    list_filter = ['blood_group', 'status', 'urgency']
    search_fields = ['patient_name', 'requester__username', 'hospital_name']


@admin.register(BloodCompatibility)
class BloodCompatibilityAdmin(admin.ModelAdmin):
    list_display = ['blood_group']
