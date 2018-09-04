# -*- coding: utf-8 -*-

from django.contrib import admin
from .models.jason3 import Jason3
from .models.jason2 import Jason2

admin.site.register(Jason2)
admin.site.register(Jason3)
