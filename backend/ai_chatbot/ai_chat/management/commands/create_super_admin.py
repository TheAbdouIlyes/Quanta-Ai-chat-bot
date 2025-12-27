from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

class Command(BaseCommand):
    help = 'Create the first super admin user'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True, help='Email for the super admin')
        parser.add_argument('--username', type=str, required=True, help='Username for the super admin')
        parser.add_argument('--password', type=str, required=True, help='Password for the super admin')

    def handle(self, *args, **options):
        email = options['email']
        username = options['username']
        password = options['password']

        # Check if super admin already exists
        if User.objects.filter(is_super_admin=True).exists():
            self.stdout.write(
                self.style.WARNING('A super admin already exists. Cannot create another super admin.')
            )
            return

        # Check if user with this email already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.ERROR(f'User with email {email} already exists.')
            )
            return

        # Create super admin user
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            is_admin=True,
            is_approved=True,
            is_super_admin=True
        )

        self.stdout.write(
            self.style.SUCCESS(f'Super admin user created successfully: {email}')
        ) 