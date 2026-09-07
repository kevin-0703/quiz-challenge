from django.db import models
from django.conf import settings
# Create your models here.
class Quiz(models.Model):
    creator =models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
    def __str__(self):
        return self.title

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions",)
    text = models.TextField()
    marks = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ["order"]
        constraints = [models.UniqueConstraint(fields=["quiz", "order"], name="unique_question_order_per_quiz",)]

    def __str__(self):
        return self.text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text