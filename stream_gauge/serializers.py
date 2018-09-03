# -*- coding: utf-8 -*-

from rest_framework import serializers

from .models import J3VSG1

class J3VSG1Serializer(serializers.ModelSerializer):

    class Meta:
        model = J3VSG1
        fields = ('date', 'water_level')
        # fields = '__all__'
        