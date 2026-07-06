from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from quizzes.models import Choice
from .models import QuizAttempt, Answer
from .serializers import StartAttemptSerializer, SubmitQuizSerializer, QuizResultSerializer

# Create your views here.

class StartAttemptView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = StartAttemptSerializer(data=request.data)

        if serializer.is_valid():
            attempt = serializer.save()
            return Response(
                StartAttemptSerializer(attempt).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class SubmitQuizView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, attempt_id):
        attempt = get_object_or_404(QuizAttempt, pk=attempt_id)
        
        if attempt.completed:
            return Response(
                {"detail": "This quiz has already been submitted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        if attempt.is_expired():
            return Response(
                {"detail": "Quiz attempt has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        serializer = SubmitQuizSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        answers_data = serializer.validated_data["answers"]
        
        quiz_questions = {q.id: q for q in attempt.quiz.questions.all()}
        all_question_ids = set(quiz_questions.keys())
        submitted_question_ids = set(int(qid) for qid in answers_data.keys())
        
        invalid_questions = submitted_question_ids - all_question_ids
        if invalid_questions:
            return Response(
                {"detail": f"Questions {invalid_questions} do not belong to this quiz."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for question_id_str, choice_id in answers_data.items():
            question_id = int(question_id_str)
            if not Choice.objects.filter(id=choice_id, question_id=question_id).exists():
                return Response(
                    {"detail": f"Choice {choice_id} does not belong to question {question_id}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        score = 0
        answers_created = []
        
        with transaction.atomic():
            for question_id_str, choice_id in answers_data.items():
                question_id = int(question_id_str)
                question = quiz_questions[question_id]
                choice = Choice.objects.get(id=choice_id, question=question)
                is_correct = choice.is_correct
                marks_awarded = question.marks if is_correct else 0
                score += marks_awarded

                answer = Answer.objects.create(
                    attempt=attempt,
                    question=question,
                    selected_choice=choice,
                    is_correct=is_correct,
                    marks_awarded=marks_awarded,
                )
                answers_created.append(answer)

            unanswered_question_ids = all_question_ids - submitted_question_ids
            for question_id in unanswered_question_ids:
                question = quiz_questions[question_id]
                Answer.objects.create(
                    attempt=attempt,
                    question=question,
                    selected_choice=None,
                    is_correct=False,
                    marks_awarded=0,
                )

            attempt.score = score
            attempt.completed = True
            attempt.submitted_at = timezone.now()
            attempt.save()
        
        result_serializer = QuizResultSerializer(attempt)
        return Response({
            "message": "Quiz submitted successfully.",
            "result": result_serializer.data,
            "answers_submitted": len(answers_created),
            "unanswered_questions": len(unanswered_question_ids),
        }, status=status.HTTP_200_OK)
