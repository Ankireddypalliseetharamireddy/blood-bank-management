from rest_framework import serializers
from .models import BloodInventory, Donation, BloodRequest, BloodCompatibility
from django.contrib.auth import get_user_model

User = get_user_model()


class BloodInventorySerializer(serializers.ModelSerializer):
    is_low = serializers.ReadOnlyField()

    class Meta:
        model = BloodInventory
        fields = '__all__'


class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ['donor']

    def get_donor_name(self, obj):
        return f"{obj.donor.first_name} {obj.donor.last_name}".strip() or obj.donor.username

    def create(self, validated_data):
        validated_data['donor'] = self.context['request'].user
        return super().create(validated_data)


class BloodRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.SerializerMethodField()
    requester_role = serializers.SerializerMethodField()

    class Meta:
        model = BloodRequest
        fields = '__all__'
        read_only_fields = ['requester', 'approved_by', 'approved_at', 'request_date']

    def get_requester_name(self, obj):
        return f"{obj.requester.first_name} {obj.requester.last_name}".strip() or obj.requester.username

    def get_requester_role(self, obj):
        return obj.requester.role

    def create(self, validated_data):
        validated_data['requester'] = self.context['request'].user
        return super().create(validated_data)


class BloodCompatibilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodCompatibility
        fields = '__all__'
