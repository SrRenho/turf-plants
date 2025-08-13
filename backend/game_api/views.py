from rest_framework.decorators import api_view
from rest_framework.response import Response

# In-memory store of black pixels
pixels = set()  # store tuples (x, y)

@api_view(['GET'])
def get_pixels(request):
    # return all painted pixels
    return Response(list(pixels))

@api_view(['POST'])
def paint_pixel(request):
    data = request.data
    x = data.get('x')
    y = data.get('y')
    if x is not None and y is not None:
        pixels.add((x, y))
    return Response({'status': 'ok'})