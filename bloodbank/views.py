from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import BloodInventory, Donation, BloodRequest, BloodCompatibility
from .serializers import (
    BloodInventorySerializer, DonationSerializer,
    BloodRequestSerializer, BloodCompatibilitySerializer
)


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


# ─── Inventory Views ────────────────────────────────────────────────────────

class BloodInventoryListView(generics.ListAPIView):
    queryset = BloodInventory.objects.all().order_by('blood_group')
    serializer_class = BloodInventorySerializer
    permission_classes = [permissions.IsAuthenticated]


class BloodInventoryUpdateView(generics.RetrieveUpdateAPIView):
    queryset = BloodInventory.objects.all()
    serializer_class = BloodInventorySerializer
    permission_classes = [IsAdminUser]


class InitializeInventoryView(APIView):
    """Initialize inventory with all 8 blood groups (admin only)."""
    permission_classes = [IsAdminUser]

    def post(self, request):
        blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        created = []
        for bg in blood_groups:
            obj, c = BloodInventory.objects.get_or_create(
                blood_group=bg,
                defaults={'units_available': 0}
            )
            if c:
                created.append(bg)
        return Response({'message': f'Initialized inventory for: {", ".join(blood_groups)}', 'created': created})


# ─── Donation Views ─────────────────────────────────────────────────────────

class DonationListCreateView(generics.ListCreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Donation.objects.all().order_by('-created_at')
        return Donation.objects.filter(donor=user).order_by('-created_at')


class DonationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Donation.objects.all()
        return Donation.objects.filter(donor=user)

    def update(self, request, *args, **kwargs):
        # Only admins can change status
        if 'status' in request.data and request.user.role != 'admin':
            return Response({'error': 'Not authorized to change status.'}, status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        old_status = instance.status
        response = super().update(request, *args, **kwargs)

        # If newly completed, update inventory
        if old_status != 'completed' and instance.status == 'completed':
            inventory, _ = BloodInventory.objects.get_or_create(blood_group=instance.blood_group)
            inventory.units_available += instance.units_donated
            inventory.save()

        return response


# ─── Blood Request Views ────────────────────────────────────────────────────

class BloodRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = BloodRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            qs = BloodRequest.objects.all()
            status_filter = self.request.query_params.get('status')
            if status_filter:
                qs = qs.filter(status=status_filter)
            return qs
        return BloodRequest.objects.filter(requester=user)


class BloodRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BloodRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return BloodRequest.objects.all()
        return BloodRequest.objects.filter(requester=user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get('status')

        if new_status in ['approved', 'rejected', 'fulfilled'] and request.user.role != 'admin':
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        if new_status == 'approved':
            # Check inventory availability
            try:
                inventory = BloodInventory.objects.get(blood_group=instance.blood_group)
                if inventory.units_available < instance.units_requested:
                    return Response(
                        {'error': f'Insufficient blood units. Available: {inventory.units_available}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                inventory.units_available -= instance.units_requested
                inventory.save()
            except BloodInventory.DoesNotExist:
                return Response({'error': 'Blood group not available in inventory.'}, status=404)

            request.data['approved_by'] = request.user.id
            request.data['approved_at'] = timezone.now().isoformat()

        return super().update(request, *args, **kwargs)


# ─── Compatibility View ─────────────────────────────────────────────────────

class BloodCompatibilityListView(generics.ListAPIView):
    queryset = BloodCompatibility.objects.all()
    serializer_class = BloodCompatibilitySerializer
    permission_classes = [permissions.AllowAny]


class InitializeCompatibilityView(APIView):
    """Pre-populate compatibility data."""
    permission_classes = [IsAdminUser]

    COMPATIBILITY_DATA = {
        'A+':  {'to': ['A+', 'AB+'], 'from': ['A+', 'A-', 'O+', 'O-']},
        'A-':  {'to': ['A+', 'A-', 'AB+', 'AB-'], 'from': ['A-', 'O-']},
        'B+':  {'to': ['B+', 'AB+'], 'from': ['B+', 'B-', 'O+', 'O-']},
        'B-':  {'to': ['B+', 'B-', 'AB+', 'AB-'], 'from': ['B-', 'O-']},
        'AB+': {'to': ['AB+'], 'from': ['A+','A-','B+','B-','AB+','AB-','O+','O-']},
        'AB-': {'to': ['AB+', 'AB-'], 'from': ['A-', 'B-', 'AB-', 'O-']},
        'O+':  {'to': ['A+', 'B+', 'AB+', 'O+'], 'from': ['O+', 'O-']},
        'O-':  {'to': ['A+','A-','B+','B-','AB+','AB-','O+','O-'], 'from': ['O-']},
    }

    def post(self, request):
        for bg, compat in self.COMPATIBILITY_DATA.items():
            BloodCompatibility.objects.update_or_create(
                blood_group=bg,
                defaults={'can_donate_to': compat['to'], 'can_receive_from': compat['from']}
            )
        return Response({'message': 'Blood compatibility data initialized successfully.'})
