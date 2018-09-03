# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from cms.sitemaps import CMSSitemap
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.static import serve

from rest_framework.urlpatterns import format_suffix_patterns

from stream_gauge import api as stream_gauge_api
from stream_gauge import views as stream_gauge_views

admin.autodiscover()

urlpatterns = [
    url(r'^sitemap\.xml$', sitemap,
        {'sitemaps': {'cmspages': CMSSitemap}}),
    url(r'^api/stream-gauge/$', stream_gauge_api.api),
    url(r'^streams/', stream_gauge_views.J3VSG1List.as_view()),
]

urlpatterns += i18n_patterns(
    url(r'^admin/', include(admin.site.urls)),  # NOQA
    #url(r'^', include('cms.urls')),
)

urlpatterns = format_suffix_patterns(urlpatterns)

# This is only needed when using runserver.
if settings.DEBUG:
    urlpatterns = [
        url(r'^media/(?P<path>.*)$', serve,
            {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        ] + staticfiles_urlpatterns() + urlpatterns
