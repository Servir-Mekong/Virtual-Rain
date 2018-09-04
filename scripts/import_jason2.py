# -*- coding: utf-8 -*-

import ntpath
import os
import pandas as pd

from django.conf import settings

from stream_gauge.models.jason2 import Jason2

dir = os.path.join(settings.BASE_DIR, 'static', 'data', 'jason2')
files = []

for file in os.listdir(dir):
    if file.endswith('.csv'):
        files.append(os.path.join(dir, file))

for file in files:
    df = pd.read_csv(file)
    _, filename = ntpath.split(file)
    station = filename.split('.csv')[0].split('j2')[1]
    for index, row in df.iterrows():
        obj, created = Jason2.objects.get_or_create(
            date = row['Date'],
            time = row['Time'],
            water_level = row['Water_Level'],
            station = station,
        )
