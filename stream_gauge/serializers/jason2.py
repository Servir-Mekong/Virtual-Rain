# -*- coding: utf-8 -*-

from rest_framework import serializers

from stream_gauge.models.jason2 import Jason2

class Jason2Serializer(serializers.ModelSerializer):

    class Meta:
        model = Jason2
        fields = ('date', 'water_level', 'station')
        # fields = '__all__'
