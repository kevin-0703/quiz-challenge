from django.shortcuts import render
from .models import Quiz
from .serializers import QuizSerializer
from .permissions import IsQuizOwner
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
# Create your views here.
class QuizListView(generics.ListAPIView):
    serializer_class = QuizSerializer

    permission_classes = [permissions.AllowAny]
    queryset = Quiz.objects.filter(is_published=True)

class MyQuizListView(generics.ListAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(creator=self.request.user)
        
class QuizCreateView(generics.CreateAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class QuizDetailView(generics.RetrieveAPIView):
    serializer_class = QuizSerializer
    queryset = Quiz.objects.all()
    permission_classes = [permissions.AllowAny]

class QuizUpdateView(generics.UpdateAPIView):
    serializer_class = QuizSerializer
    queryset = Quiz.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsQuizOwner,]

class QuizDeleteView(generics.DestroyAPIView):
    queryset = Quiz.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsQuizOwner,]

class PublishQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        quiz = Quiz.objects.get(pk=pk, creator=request.user,)
        questions = quiz.questions.all()
        if questions.count() != 7:
            return Response(
                {"detail": "Quiz must contain exactly seven questions."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for question in questions:
            choices = question.choices.all()

            if choices.count() < 4:
                return Response(
                    {
                        "detail": (
                            f'Question "{question.text}" must have at least four choices.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if choices.filter(is_correct=True).count() != 1:
                return Response(
                    {
                        "detail": (
                            f'Question "{question.text}" must have exactly one correct answer.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )        
        quiz.is_published=True
        quiz.save()
        return Response(
            {"message": "Quiz published successfully"}, status=status.HTTP_200_OK,
        )
