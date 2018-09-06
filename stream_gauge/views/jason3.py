# -*- coding: utf-8 -*-

from rest_framework import generics

from stream_gauge.models.jason3 import Jason3
from stream_gauge.serializers.jason3 import Jason3Serializer

from datetime import datetime

class Jason3List(generics.ListAPIView):

    serializer_class = Jason3Serializer

    def get_queryset(self):

        strptime = datetime.strptime
        format = '%Y-%m-%d'
        queryset = Jason3.objects.all()
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

        if parameters.get('station'):
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
