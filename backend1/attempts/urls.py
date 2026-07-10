from django.urls import path
from .views import StartAttemptView, SubmitQuizView

urlpatterns = [
    path('attempts/start/', StartAttemptView.as_view(), name='start-attempt'),
    path('attempts/<int:attempt_id>/submit/', SubmitQuizView.as_view(), name='submit-quiz'),
]
