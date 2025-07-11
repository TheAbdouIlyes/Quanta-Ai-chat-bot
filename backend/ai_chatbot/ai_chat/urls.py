from django.urls import path
from .views import (
    CommonQuestionsView, AddCommonQuestionView, ChatView, UploadDocView, 
    ListFilesView, DeleteFileView, UpdateCommonQuestionView, DeleteCommonQuestionView,
    LoginView, LogoutView, RegisterView, RegistrationRequestsView, 
    ApproveRegistrationView, DeclineRegistrationView, CheckRegistrationStatusView,
    AdminAccountsView, DeleteAdminAccountView, ClearConversationView
)

urlpatterns = [
    # Authentication endpoints
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/check-status/", CheckRegistrationStatusView.as_view(), name="check-status"),
    
    # Registration management (super admin only)
    path("admin/registration-requests/", RegistrationRequestsView.as_view(), name="registration-requests"),
    path("admin/approve-registration/<int:request_id>/", ApproveRegistrationView.as_view(), name="approve-registration"),
    path("admin/decline-registration/<int:request_id>/", DeclineRegistrationView.as_view(), name="decline-registration"),
    path("admin/accounts/", AdminAccountsView.as_view(), name="admin-accounts"),
    path("admin/delete-account/<int:user_id>/", DeleteAdminAccountView.as_view(), name="delete-admin-account"),
    
    # Public endpoints
    path("chat", ChatView.as_view(), name="chat"),
    path("clear-conversation/", ClearConversationView.as_view(), name="clear-conversation"),
    path("common-questions/", CommonQuestionsView.as_view(), name="common-questions"),
    
    # Admin endpoints (require authentication)
    path("admin/upload_doc", UploadDocView.as_view(), name="upload-doc"),
    path("files/", ListFilesView.as_view(), name="list_files"),
    path("delete-file/<int:file_id>/", DeleteFileView.as_view(), name="delete_file"),
    path("add-common-question/", AddCommonQuestionView.as_view(), name="add-common-question"),
    path("update-common-question/<int:question_id>/", UpdateCommonQuestionView.as_view(), name="update-common-question"),
    path("delete-common-question/<int:question_id>/", DeleteCommonQuestionView.as_view(), name="delete-common-question"),
]