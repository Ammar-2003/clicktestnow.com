#app/templatetags/notification_tags.py
from django import template

register = template.Library()

@register.filter
def notification_class(tag):
    """Convert Django message tags to CSS classes"""
    if tag in ['error', 'debug']:
        return 'error'
    elif tag == 'success':
        return 'success'
    elif tag == 'warning':
        return 'warning'
    else:
        return 'info'

@register.filter
def notification_icon(tag):
    """Get icon for message type"""
    css_class = notification_class(tag)
    icons = {
        'success': '✓',
        'error': '✗',
        'warning': '⚠',
        'info': 'ℹ'
    }
    return icons.get(css_class, 'ℹ')