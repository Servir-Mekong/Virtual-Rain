# -*- coding: utf-8 -*-

from core import StreamGauge
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from datetime import datetime
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json
import time

PUBLIC_METHODS = [
    'timeseries'
]

@csrf_exempt
def api(request):

    if request.method.lower()  == 'post':
        post = json.loads(request.body).get
    
        get = request.GET.get
        action = get('action', '')
    
        if action and action in PUBLIC_METHODS:
            gauge = post('gauge', '')
            start = post('start', '')
            end = post('end', '')
            core = StreamGauge(gauge, start, end)
    
            if action == 'timeseries':
                data = core.get_timeseries()
    
            if 'error' in data:
                return JsonResponse(data, status=500)
            # success response
            #return JsonResponse(data)
            response = HttpResponse(json.dumps(data))
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Headers'] = 'Content-Type'
            return response
        else:
            return JsonResponse({'error': 'Method not allowed!'}, status=405)

    elif request.method.lower()  == 'options':
        response = HttpResponse('ok')
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    else:
        return JsonResponse({'error': 'Method not allowed!'}, status=405)
