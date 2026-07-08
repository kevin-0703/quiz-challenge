from rest_framework.permissions import BasePermission

class IsQuizOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.creator == request.user or (request.user.is_authenticated and getattr(request.user, "is_admin", False))