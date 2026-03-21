from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'blood_group', 'is_eligible_to_donate', 'total_donations']
    list_filter = ['role', 'blood_group', 'is_eligible_to_donate']
    fieldsets = UserAdmin.fieldsets + (
        ('Blood Bank Info', {'fields': ('role', 'phone', 'address', 'blood_group',
                                        'date_of_birth', 'profile_picture',
                                        'is_eligible_to_donate', 'last_donation_date',
                                        'total_donations')}),
    )
    search_fields = ['username', 'email', 'blood_group']
