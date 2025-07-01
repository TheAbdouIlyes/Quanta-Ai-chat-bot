from django.urls import path
from .views import ChatView, UploadDocView ,ListFilesView, DeleteFileView

urlpatterns = [
    path("chat", ChatView.as_view(), name="chat"),
    path("admin/upload_doc", UploadDocView.as_view(), name="upload-doc"),
    path("files/", ListFilesView.as_view(), name="list_files"),
    path("delete-file/<int:file_id>/", DeleteFileView.as_view(), name="delete_file"),

]
