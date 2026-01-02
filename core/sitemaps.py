from django.contrib.sitemaps import Sitemap
from django.urls import reverse

class StaticViewSitemap(Sitemap):
    priority = 0.9
    changefreq = "weekly"

    def items(self):
        return [
            'home',
            'mouse_dpi_analyzer',
            'mouse_test',
            'sensitivity_converter',
            'polling_rate_tester',
            'edpi_calculator',
            'jitter_click_test',
            '1_second_mouse_cps_test',
            '2_seconds_mouse_cps_test',
            '5_seconds_mouse_cps_test',
            '10_seconds_mouse_cps_test',
            '15_seconds_mouse_cps_test',
        ]

    def location(self, item):
        return reverse(item)
