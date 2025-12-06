from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = "Loads all fixtures"

    @transaction.atomic
    def handle(self, *args, **options):
        call_command(
            "loaddata",
            "system_profiles",
            "interests_updated",
            "venue_types_updated",
            "screen_managers",
            "ads_managers",
            "ads_manager_videos",
            "uzbekistan_regions_districts",
        )
