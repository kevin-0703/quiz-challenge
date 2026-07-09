from django.shortcuts import render
from .models import Quiz, Question, Choice
from .serializers import QuizSerializer, PublicQuizDetailSerializer
from .permissions import IsQuizOwner
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
# Create your views here.
class QuizListView(generics.ListAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and getattr(user, 'is_admin', False):
            return Quiz.objects.all()
        return Quiz.objects.filter(is_published=True)

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
    @transaction.atomic
    def post(self, request, pk):
        print("CONTENT TYPE:", request.content_type)
        print("BODY:", request.body)
        print("DATA:", request.data)
        try:
            quiz = Quiz.objects.get(pk=pk, creator=request.user,)
        except Quiz.DoesNotExist:
            return Response (
                {"message": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND,
            )
        questions_data = request.data.get("questions", [])

        if len(questions_data) != 7:
            return Response (
                {"message": "Quiz must contain seven questions"}, status=status.HTTP_400_BAD_REQUEST,
            )
        for order, q_data in enumerate(questions_data, 1):
            question = Question.objects.create(
                quiz=quiz,
                text=q_data.get("text", ""),
                marks=q_data.get("marks", 10),
                order=order
            )

            choices_data = q_data.get("choices", [])
            if len(choices_data) < 4:
                return Response (
                    {"message": "A question must have 4 choices"}, status=status.HTTP_400_BAD_REQUEST,
                )
            correct_count = sum(1 for c in choices_data if c.get("is_correct", False))
            if correct_count != 1:
                return Response(
                    {"message": "A question must have one correct answer"}, status=status.HTTP_400_BAD_REQUEST,
                )

            for choice_data in choices_data:
                Choice.objects.create(
                    question=question,
                    text=choice_data.get("text", ""),
                    is_correct=choice_data.get("is_correct", False)

                )
        quiz.is_published = True
        quiz.save()
        return Response (
            {"message": "Quiz published successfully"}, status=status.HTTP_200_OK,
        )

class TakeQuizView(generics.RetrieveAPIView):
    serializer_class = PublicQuizDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Quiz.objects.filter(is_published=True)