from django.urls import path
from main import views
from main.views import proxy_image, create_product_flutter

app_name = 'main'

urlpatterns = [
    path('', views.show_main, name='show_main'),

    # Original pages (fallback)
    path('create-product/', views.create_product, name='create_product'),
    path('product/<str:id>/', views.show_product, name='show_product'),
    path('register/', views.register, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('product/<uuid:id>/edit', views.edit_product, name='edit_product'),
    path('product/<uuid:id>/delete', views.delete_product, name='delete_product'),

    # XML/JSON utilities
    path('xml/', views.show_xml, name='show_xml'),
    path('json/', views.show_json, name='show_json'),
    path('xml/<str:product_id>/', views.show_xml_by_id, name='show_xml_by_id'),
    path('json/<str:product_id>/', views.show_json_by_id, name='show_json_by_id'),

    # --- API endpoints for AJAX ---
    # Put specific routes first and use uuid converter to avoid accidental matches
    path('api/products/create/', views.api_product_create, name='api_product_create'),
    path('api/products/<uuid:pk>/update/', views.api_product_update, name='api_product_update'),
    path('api/products/<uuid:pk>/delete/', views.api_product_delete, name='api_product_delete'),
    path('api/products/<uuid:pk>/', views.api_product_detail, name='api_product_detail'),
    path('api/products/', views.api_product_list, name='api_product_list'),

    # Auth API
    path('api/auth/login/', views.api_login, name='api_login'),
    path('api/auth/register/', views.api_register, name='api_register'),
    path('api/auth/logout/', views.api_logout, name='api_logout'),

    path('proxy-image/', proxy_image, name='proxy_image'),
    path('create-flutter/', create_product_flutter, name='create_news_flutter'),
]