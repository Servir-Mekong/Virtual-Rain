# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from django.db import models

class Jason2(models.Model):

    JASON2_STATION_CHOICES = []
    for i in range(1, 23):
        JASON2_STATION_CHOICES.append(('vsg{}'.format(i), 'Gauge Station {}'.format(i)))

    JASON2_STATION_CHOICES = tuple(JASON2_STATION_CHOICES)

    created_on = models.DateTimeField(auto_now_add=True)
    date = models.DateField(db_column='Date')
    time = models.CharField(db_column='Time', max_length=10)
    water_level = models.FloatField(db_column='Water_Level')
    station = models.CharField(
        db_column = 'Station',
        choices = JASON2_STATION_CHOICES,
        max_length = 5,
    )

    class Meta:
        db_table = '"jason2"'

    def __str__(self):
        return '{} - {}'.format(self.station, self.date.strftime('%B %d, %Y'))
