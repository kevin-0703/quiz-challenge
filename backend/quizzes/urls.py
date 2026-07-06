from django.urls import path

from .view import (QuizCreateView, QuizListView, QuizDeleteView, QuizUpdateView, QuizDetailView, PublishQuizView, MyQuizListView)

urlpatterns = [
    path("", QuizListView.as_view()),
    path("mine/", MyQuizListView.as_view()),
    path("create/", QuizCreateView.as_view()),
    path("<int:pk>/", QuizDetailView.as_view()),
    path("<int:pk>/update/", QuizUpdateView.as_view()),
    path("<int:pk>/delete/", QuizDeleteView.as_view()),
    path("<int:pk>/publish/", PublishQuizView.as_view()),
]