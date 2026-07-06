from rest_framework import serializers
from .models import Choice, Question, Quiz

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = (
            "id", "text", "is_correct",
        )

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)
    class Meta:
        model = Question
        fields = (
            "id", "text", "marks","order", "choices",
        )

        def validate_choices(self, value):
            if len(value) < 4:
                raise serializers.ValidationError (
                    "Each question must have a minimum of four choices"
                )
            return value

        def validate(self, attrs):
            choices = attrs.get("choices", [])

            correct_answers = sum(
                choice["is_correct"] for choice in choices  
            )
            if correct_answers != 1:
                raise serializers.ValidationError(
                    "Each question must have one correct answer"
                )

                return attrs

class QuizSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(
        source = "creator.get_full_name", read_only=True,
    )

    cretor_email = serializers.EmailField(
        source = "creator.email", read_only=True,
    )

    class Meta:
        model = Quiz
        fields = (
            "id", "title", "description", "creator_name", "creator_email", "created_at",
        )

class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    creator_name = serializers.CharField(
        source="creator.get_full_name", read_only=True,
    )

    class Meta:
        model = Quiz
        fields = (
            "id", "title", "description", "creator_name", "questions",
        )

        def validate_question(self, value):
            if len(value) != 7:
                raise serializers.ValidationError(
                    "A quiz must have exctly seven questions"
                )
                return value