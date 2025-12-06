from django.db import models
from django.db.models import Q

class InterestQuerySet(models.QuerySet):
    def list(self, sort_by, search_field=None, search_value=None, is_active=None):
        qs = self
        if search_field and search_value:
            qs = qs.filter(Q(**{f"{search_field}__istartswith": search_value}))
        return qs.order_by(*sort_by)