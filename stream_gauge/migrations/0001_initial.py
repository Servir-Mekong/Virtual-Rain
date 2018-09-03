# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-09-03 09:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='J3VSG1',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_on', models.DateTimeField(auto_now_add=True)),
                ('date', models.DateField()),
                ('time', models.CharField(max_length=10)),
                ('water_level', models.FloatField()),
            ],
            options={
                'db_table': '"j3vsg1"',
            },
        ),
    ]
