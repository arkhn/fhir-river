from django.contrib.auth.models import AbstractUser
from django.db import models

from cuid import cuid


class User(AbstractUser):
    id_ = models.TextField(name="id", primary_key=True, default=cuid, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(
        max_length=150,
        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
        validators=[AbstractUser.username_validator],
        error_messages={
            "unique": "A user with that username already exists.",
        },
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
