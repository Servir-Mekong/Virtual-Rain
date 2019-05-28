# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from django.db import models

class Jason3(models.Model):

    JASON3_STATION_CHOICES = []
    for i in range(1, 23):
        JASON3_STATION_CHOICES.append(('vsg{}'.format(i), 'Gauge Station {}'.format(i)))

    JASON3_STATION_CHOICES = tuple(JASON3_STATION_CHOICES)

    created_on = models.DateTimeField(auto_now_add=True)
    date = models.DateField()
    time = models.CharField(max_length=10)
    water_level = models.FloatField()
    station = models.CharField(
        choices = JASON3_STATION_CHOICES,
        max_length = 5,
    )
    gpn = models.BooleanField(default=False)

    class Meta:
        db_table = '"jason3"'

    def __str__(self):
        return '{} - {}'.format(self.station, self.date.strftime('%B %d, %Y'))
