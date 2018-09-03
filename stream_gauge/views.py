# -*- coding: utf-8 -*-

from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import J3VSG1
from .serializers import J3VSG1Serializer

# Get the Jason3 VSG 1 data
class J3VSG1List(APIView):

    def get(self, request):
        data = J3VSG1.objects.all()
        serializer = J3VSG1Serializer(data, many=True)
        return Response(serializer.data)
