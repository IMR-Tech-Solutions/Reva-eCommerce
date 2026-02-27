from celery import shared_task
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

@shared_task
def update_expired_batches_task():
    try:
        call_command('update_expirybatch')
        logger.info("Successfully updated expired batches")
        return "Expired batches updated successfully"
    except Exception as e:
        logger.error(f"Error updating expired batches: {str(e)}")
        raise
