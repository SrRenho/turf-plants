from django.db import models

class Pixel(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()

    class Meta:
        unique_together = ('x', 'y')  # avoid duplicates

    def __str__(self):
        return f"({self.x}, {self.y})"