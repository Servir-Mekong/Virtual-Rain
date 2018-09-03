# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from django.db import models

class J3VSG1(models.Model):
    created_on = models.DateTimeField(auto_now_add=True)
    date = models.DateField()
    time = models.CharField(max_length=10)
    water_level = models.FloatField()

    def __str__(self):
        return self.date

    class Meta:
        db_table = '"j3vsg1"'
