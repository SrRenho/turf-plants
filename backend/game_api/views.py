from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Pixel
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

@csrf_exempt
@api_view(['GET'])
def get_pixels(request):
    # fetch all pixels from DB
    all_pixels = Pixel.objects.all().values_list('x', 'y')
    return Response(list(all_pixels))

@csrf_exempt
@api_view(['POST'])
def paint_pixel(request):
    data = request.data
    x = data.get('x')
    y = data.get('y')
    if x is not None and y is not None:
        Pixel.objects.get_or_create(x=x, y=y)  # avoids duplicates
    return Response({'status': 'ok'})

def current_user(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'username': request.user.username,
            'email': request.user.email,
            'id': request.user.id,
        })
    return JsonResponse({'user': None})