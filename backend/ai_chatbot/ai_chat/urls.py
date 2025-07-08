from django.urls import path
from .views import CommonQuestionsView,AddCommonQuestionView,ChatView, UploadDocView ,ListFilesView, DeleteFileView, UpdateCommonQuestionView, DeleteCommonQuestionView

urlpatterns = [
    path("chat", ChatView.as_view(), name="chat"),
    path("admin/upload_doc", UploadDocView.as_view(), name="upload-doc"),
    path("files/", ListFilesView.as_view(), name="list_files"),
    path("delete-file/<int:file_id>/", DeleteFileView.as_view(), name="delete_file"),
    path("add-common-question/", AddCommonQuestionView.as_view(), name="add-common-question"),
    path("common-questions/", CommonQuestionsView.as_view(), name="common-questions"),
    path("update-common-question/<int:question_id>/", UpdateCommonQuestionView.as_view(), name="update-common-question"),
    path("delete-common-question/<int:question_id>/", DeleteCommonQuestionView.as_view(), name="delete-common-question"),
]