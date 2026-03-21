from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

BLOOD_GROUP_CHOICES = [
    ('A+', 'A+'), ('A-', 'A-'),
    ('B+', 'B+'), ('B-', 'B-'),
    ('AB+', 'AB+'), ('AB-', 'AB-'),
    ('O+', 'O+'), ('O-', 'O-'),
]


class BloodInventoryManager(models.Manager):
    def get_total_units(self):
        from django.db.models import Sum
        result = self.aggregate(total=Sum('units_available'))
        return result['total'] or 0


class BloodInventory(models.Model):
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, unique=True)
    units_available = models.IntegerField(default=0)
    minimum_threshold = models.IntegerField(default=10)
    last_updated = models.DateTimeField(auto_now=True)

    objects = BloodInventoryManager()

    def __str__(self):
        return f"{self.blood_group}: {self.units_available} units"

    @property
    def is_low(self):
        return self.units_available < self.minimum_threshold

    class Meta:
        verbose_name = 'Blood Inventory'
        verbose_name_plural = 'Blood Inventories'


class Donation(models.Model):
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES)
    units_donated = models.FloatField(default=1.0)
    donation_date = models.DateField()
    donation_center = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ], default='pending')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.donor.username} - {self.blood_group} ({self.donation_date})"

    def save(self, *args, **kwargs):
        # Update inventory when donation is completed
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if self.status == 'completed':
            inventory, _ = BloodInventory.objects.get_or_create(blood_group=self.blood_group)
            if is_new:
                inventory.units_available += self.units_donated
                inventory.save()
            # Update donor's info
            self.donor.last_donation_date = self.donation_date
            self.donor.total_donations = Donation.objects.filter(
                donor=self.donor, status='completed'
            ).count()
            self.donor.save()


class BloodRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('fulfilled', 'Fulfilled'),
    ]
    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blood_requests')
    patient_name = models.CharField(max_length=200)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES)
    units_requested = models.FloatField()
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium')
    hospital_name = models.CharField(max_length=200)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    request_date = models.DateField(auto_now_add=True)
    required_by = models.DateField()
    approved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_requests'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient_name} - {self.blood_group} ({self.status})"

    class Meta:
        ordering = ['-created_at']


class BloodCompatibility(models.Model):
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, unique=True)
    can_donate_to = models.JSONField(default=list)
    can_receive_from = models.JSONField(default=list)

    def __str__(self):
        return f"Compatibility: {self.blood_group}"

    class Meta:
        verbose_name = 'Blood Compatibility'
        verbose_name_plural = 'Blood Compatibilities'
