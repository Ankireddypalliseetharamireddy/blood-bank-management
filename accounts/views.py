from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserListSerializer,
    CustomTokenObtainPairSerializer,
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registration successful!',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'blood_group': user.blood_group,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            role = self.request.query_params.get('role', None)
            qs = User.objects.all()
            if role:
                qs = qs.filter(role=role)
            return qs
        return User.objects.none()


class DonorListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        blood_group = self.request.query_params.get('blood_group', None)
        qs = User.objects.filter(role='donor', is_eligible_to_donate=True)
        if blood_group:
            qs = qs.filter(blood_group=blood_group)
        return qs


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from bloodbank.models import BloodInventory, BloodRequest, Donation
        total_donors = User.objects.filter(role='donor').count()
        total_hospitals = User.objects.filter(role='hospital').count()
        total_blood_units = BloodInventory.objects.get_total_units()
        pending_requests = BloodRequest.objects.filter(status='pending').count()
        approved_requests = BloodRequest.objects.filter(status='approved').count()
        total_donations = Donation.objects.count()

        blood_inventory = {}
        for item in BloodInventory.objects.all():
            blood_inventory[item.blood_group] = item.units_available

        return Response({
            'total_donors': total_donors,
            'total_hospitals': total_hospitals,
            'total_blood_units': total_blood_units,
            'pending_requests': pending_requests,
            'approved_requests': approved_requests,
            'total_donations': total_donations,
            'blood_inventory': blood_inventory,
        })
