from django.urls import path
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    ProfileView,
    UserListView,
    DonorListView,
    LogoutView,
    DashboardStatsView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('donors/', DonorListView.as_view(), name='donor-list'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
