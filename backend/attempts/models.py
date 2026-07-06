from django.db import models
from quizzes.models import Quiz, Choice, Question
# Create your models here.
class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts",)
    participant_name = models.CharField(max_length=100)
    participant_email = models.EmailField()
    score = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True,)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.participant_name} - {self.quiz.title}"

class Answer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name="answers",)
    question = models.ForeignKey(Question, on_delete=models.CASCADE,)
    selected_choice = models.ForeignKey(Choice, on_delete=models.CASCADE,)
    is_correct = models.BooleanField(default=False)
    marks_awarded = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.attempt.participant_name}"