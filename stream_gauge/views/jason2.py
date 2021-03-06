# -*- coding: utf-8 -*-

from rest_framework import generics

from stream_gauge.models.jason2 import Jason2
from stream_gauge.serializers.jason2 import Jason2Serializer

from datetime import datetime

class Jason2List(generics.ListAPIView):

    serializer_class = Jason2Serializer

    def get_queryset(self):

        strptime = datetime.strptime
        format = '%Y-%m-%d'
        queryset = Jason2.objects.all()
        parameters = self.request.query_params
        start = parameters.get('start', None)
        if start is not None:
            start_date = strptime(start, format) or None
        else:
            start_date = None
        end = parameters.get('end', None)
        if end is not None:
            end_date = strptime(end, format) or None
        else:
            end_date = None

        _station = parameters.get('station')
        if _station:
            if _station.startswith('vsg'):
                station = _station
            else:
                station = 'vsg{}'.format(parameters.get('station'))
        else:
            station = None

        if start_date is not None:
            queryset = queryset.filter(date__gte=start_date)

        if end_date is not None:
            queryset = queryset.filter(date__lte=end_date)

        if station is not None:
            queryset = queryset.filter(station=station)

        return queryset
