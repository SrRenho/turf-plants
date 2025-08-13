from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Pixel

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