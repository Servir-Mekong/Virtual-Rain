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
from django.views.generic import TemplateView

from rest_framework.urlpatterns import format_suffix_patterns

#from stream_gauge import api as stream_gauge_api
from stream_gauge.views.jason2 import Jason2List
from stream_gauge.views.jason3 import Jason3List

admin.autodiscover()

urlpatterns = [
    url(r'^sitemap\.xml$', sitemap,
        {'sitemaps': {'cmspages': CMSSitemap}}),
    url(r'^api/stream-gauge/jason2/$', Jason2List.as_view()),
    url(r'^api/stream-gauge/jason3/$', Jason3List.as_view()),
    #url(r'^api/stream-gauge/$', stream_gauge_api.api),
    #url(r'^streams/', stream_gauge_views.Jason3List.as_view()),
    # Uncommented for Production
    url(r'^$', TemplateView.as_view(template_name="index.html")),
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
