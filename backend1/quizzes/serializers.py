from rest_framework import serializers
from .models import Choice, Question, Quiz

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = (
            "id", "question","text", "is_correct",
        )
        read_only_fields = ("id", "question",)

    

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)
    class Meta:
        model = Question
        fields = (
            "id", "text", "marks","order", "choices", "quiz",
        )
        read_only_fields = ("id", "quiz", "order",)

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

    creator_email = serializers.EmailField(
        source = "creator.email", read_only=True,
    )

    class Meta:
        model = Quiz
        fields = (
            "id", "title", "description", "creator_name", "creator_email", "created_at", "is_published",
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

class PublicChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ("id", "text")


class PublicQuestionSerializer(serializers.ModelSerializer):
    choices = PublicChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = ("id", "text", "marks", "order", "choices")


class PublicQuizDetailSerializer(serializers.ModelSerializer):
    questions = PublicQuestionSerializer(many=True)
    creator_name = serializers.CharField(source="creator.get_full_name", read_only=True)

    class Meta:
        model = Quiz
        fields = ("id", "title", "description", "creator_name", "questions")

class QuizDetailSerializer(serializers.ModelSerializer):

    questions = QuestionSerializer(many=True)

    class Meta:
        model = Quiz
        fields = (
            "id",
            "title",
            "description",
            "questions",
        )

    def update(self, instance, validated_data):

        questions_data = validated_data.pop("questions")

        instance.title = validated_data.get(
            "title",
            instance.title,
        )

        instance.description = validated_data.get(
            "description",
            instance.description,
        )

        instance.save()

        instance.questions.all().delete()

        for order, question_data in enumerate(questions_data, start=1):

            choices_data = question_data.pop("choices")

            question = Question.objects.create(
                quiz=instance,
                order=order,
             **question_data
            )

            for choice_data in choices_data:
                Choice.objects.create(
                    question=question,
                    **choice_data
                )

        return instance