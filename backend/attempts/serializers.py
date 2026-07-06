from rest_framework import serializers
from .models import QuizAttempt, Answer
from quizzes.models import Question, Choice

class StartAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = (
            "id", "participant_name", "participant_email", "quiz", "started_at", "expires_at",
        )
        read_only_fields = (
            "id", "started_at", "expires_at",
        )
        
    def validate(self, data):
        quiz = data.get("quiz")

        if not quiz.is_published:
            raise serializers.ValidationError("This quiz is not available.")

        existing_attempt = QuizAttempt.objects.filter(
            participant_email=data.get("participant_email"),
            quiz=quiz,
            completed=False
        ).exists()
        
        if existing_attempt:
            raise serializers.ValidationError(
                "You already have an active attempt for this quiz."
            )
        return data

class SubmitQuizSerializer(serializers.Serializer):
    answers = serializers.DictField(
        child=serializers.IntegerField(),
        help_text="Dictionary of question_id: choice_id"
    )
    
    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError("At least one answer must be provided.")
        
        question_ids = []
        for question_id in value.keys():
            try:
                question_ids.append(int(question_id))
            except ValueError:
                raise serializers.ValidationError("Question ids must be numbers.")

        existing_questions = set(
            Question.objects.filter(id__in=question_ids).values_list("id", flat=True)
        )
        
        invalid_questions = set(question_ids) - existing_questions
        if invalid_questions:
            raise serializers.ValidationError(
                f"Invalid question IDs: {invalid_questions}"
            )
        
        choice_ids = list(value.values())
        existing_choices = set(
            Choice.objects.filter(id__in=choice_ids).values_list("id", flat=True)
        )
        
        invalid_choices = set(choice_ids) - existing_choices
        if invalid_choices:
            raise serializers.ValidationError(
                f"Invalid choice IDs: {invalid_choices}"
            )
        
        return value

class QuizResultSerializer(serializers.ModelSerializer):
    total_questions = serializers.SerializerMethodField()
    answered_questions = serializers.SerializerMethodField()
    correct_answers = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizAttempt
        fields = (
            'id',
            'participant_name',
            'participant_email',
            'score',
            'total_questions',
            'answered_questions',
            'correct_answers',
            'started_at',
            'submitted_at',
            'completed'
        )
    
    def get_total_questions(self, obj):
        return obj.quiz.questions.count()
    
    def get_answered_questions(self, obj):
        return obj.answers.filter(selected_choice__isnull=False).count()
    
    def get_correct_answers(self, obj):
        return obj.answers.filter(is_correct=True).count()
