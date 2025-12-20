from django.contrib import admin
from django.urls import path, include
from django.contrib.sitemaps.views import sitemap
from django.http import HttpResponse

from .sitemaps import StaticViewSitemap

# ✅ DEFINE sitemaps dictionary
sitemaps = {
    'static': StaticViewSitemap,
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app.home.urls')),
    path('accounts/', include('app.accounts.urls')),

    # ✅ Sitemap URL
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django_sitemap'),
]

# ✅ robots.txt
def robots_txt(request):
    lines = [
        "User-agent: *",
        "Allow: /",
        "Sitemap: https://clicktestnow.com/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")

urlpatterns += [
    path("robots.txt", robots_txt),
]
