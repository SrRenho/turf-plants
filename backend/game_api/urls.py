from django.urls import path
from . import views

urlpatterns = [
    path('pixels/', views.get_pixels),
    path('paint/', views.paint_pixel),
    path('current_user/', views.current_user),  # e.g. GET /api/current_user/
]