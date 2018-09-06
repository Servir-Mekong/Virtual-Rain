# -*- coding: utf-8 -*-

from rest_framework import serializers

from stream_gauge.models.jason3 import Jason3

class Jason3Serializer(serializers.ModelSerializer):

    class Meta:
        model = Jason3
        fields = ('date', 'water_level', 'station')
        # fields = '__all__'
