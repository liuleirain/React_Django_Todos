from rest_framework.routers import DefaultRouter
from .api import TaskViewSet


router = DefaultRouter()
router.register('', TaskViewSet, basename='apis')

urlpatterns = router.urls
