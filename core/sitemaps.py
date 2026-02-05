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
            '20_seconds_mouse_cps_test',
            '30_seconds_mouse_cps_test',
            '60_seconds_mouse_cps_test',
            '100_seconds_mouse_cps_test',
            'cps_test',
            'spacebar_counter',
            '1_second_spacebar_counter',
        ]

    def location(self, item):
        return reverse(item)
