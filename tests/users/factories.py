import factory


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "users.User"

    id = factory.Sequence(lambda n: f"user_id_{n:04d}")
