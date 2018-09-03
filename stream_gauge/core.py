# -*- coding: utf-8 -*-

from django.conf import settings

import pandas as pd
import numpy as np
import time

# -----------------------------------------------------------------------------
class StreamGauge():

    # -------------------------------------------------------------------------
    def __init__(self, gauge, start, end):

        self.gauge = gauge
        self.start = start
        self.end = end
        if self.gauge.startswith('j2'):
            self.folder = 'jason2'
        elif self.gauge.startswith('j3'):
            self.folder = 'jason3'
        self.file = r'{}/data/{}/{}.csv'.format(settings.STATIC_ROOT, self.folder, self.gauge)

    # -------------------------------------------------------------------------
    def get_timeseries(self):

        df = pd.read_csv(self.file)
        qdf = df.query("Date>'{}'&Date<'{}'".format(self.start, self.end))
        #data = qdf['Water_Level'].round(3).tolist()
        data = map(list, zip(qdf['Date'], qdf['Water_Level'].round(3)))
        #data = map(list,zip(pd.to_datetime(qdf['Date']).values.astype(np.int64)//10**6, qdf['Water_Level'].round(3)))
        #data = map(list, zip((pd.to_datetime(df['Date']).values.astype(np.int64)//10**6).astype(int), df['Water_Level'].round(3)))

        #pattern = '%Y-%m-%d %H:%M:%S'
        #series = []
        #for _data in data:
        #    _time = int(time.mktime(time.strptime('{} {}'.format(_data[0], _data[1]), pattern)))
        #    series.append([_time, _data[2]])

        return { 'data': data }
