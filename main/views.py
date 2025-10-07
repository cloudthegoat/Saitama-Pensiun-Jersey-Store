import datetime
import json
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse
from django.shortcuts import render, redirect, get_object_or_404
from django.core import serializers
from django.template.loader import render_to_string
from main.forms import ProductForm
from main.models import Product
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.core.serializers.json import DjangoJSONEncoder
import traceback
from django.conf import settings

# Helper to convert Product -> dict for JSON responses
def product_to_dict(p):
    return {
        'id': str(p.id),
        'name': p.name,
        'price': p.price,
        'description': p.description,
        'thumbnail': p.thumbnail or '',
        'category': p.category,
        'category_display': p.get_category_display() if hasattr(p, 'get_category_display') else p.category,
        'is_featured': p.is_featured,
        'user': p.user.username if p.user else None,
        # created_at may or may not exist in your model; handle safely
        'created_at': getattr(p, 'created_at', None) and str(getattr(p, 'created_at')) or ''
    }

@login_required(login_url='/login')
def show_main(request):
    # keep existing server-rendered page — JS will fetch fresh list via AJAX
    filter_type = request.GET.get("filter", "all")  # default 'all'

    if filter_type == "all":
        product_list = Product.objects.all()
    elif filter_type == "featured":
        product_list = Product.objects.filter(is_featured=True)
    else:
        product_list = Product.objects.filter(user=request.user)

    context = {
        'npm' : '2406420772',
        'name': request.user.username,
        'class': 'PBP C',
        'product_list': product_list,
        'last_login': request.COOKIES.get('last_login', 'Never')
    }

    return render(request, "main.html", context)


# --------------------------
# API endpoints for AJAX
# --------------------------

@login_required(login_url='/login')
def api_product_list(request):
    """
    GET: return JSON list of products ordered newest-first.
    Supports optional filtering via ?filter=all|my|featured
    - all: all products (default)
    - my: only products owned by current user
    - featured: products with is_featured=True
    """
    try:
        filter_type = request.GET.get('filter', 'all')
        qs = Product.objects.all()

        if filter_type == 'my':
            # only products owned by current user
            qs = qs.filter(user=request.user)
        elif filter_type == 'featured':
            qs = qs.filter(is_featured=True)
        else:
            # default: all
            qs = Product.objects.all()

        qs = qs.order_by('-created_at')  # newest first if field exists
        data = [product_to_dict(p) for p in qs]
        return JsonResponse({'status': 'success', 'products': data}, encoder=DjangoJSONEncoder)
    except Exception as e:
        tb = traceback.format_exc()
        msg = str(e)
        if getattr(settings, 'DEBUG', False):
            return JsonResponse({'status': 'error', 'message': 'Exception saat mengambil produk', 'exception': msg, 'traceback': tb}, status=500)
        else:
            return JsonResponse({'status': 'error', 'message': 'Server error saat mengambil produk.'}, status=500)

@login_required(login_url='/login')
def api_product_detail(request, pk):
    try:
        p = Product.objects.get(pk=pk)
        return JsonResponse({'status': 'success', 'product': product_to_dict(p)}, encoder=DjangoJSONEncoder)
    except Product.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Product not found.'}, status=404)


@login_required(login_url='/login')
@require_POST
def api_product_create(request):
    try:
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product_entry = form.save(commit=False)
            product_entry.user = request.user
            product_entry.save()
            return JsonResponse({
                'status': 'success',
                'message': 'Produk berhasil ditambahkan.',
                'product': product_to_dict(product_entry)
            }, encoder=DjangoJSONEncoder)
        else:
            # form gagal validasi: kembalikan errors
            return JsonResponse({'status': 'error', 'message': 'Validasi gagal', 'errors': form.errors}, status=400)
    except Exception as e:
        # tangani exception agar tidak melempar 500 tanpa pesan
        tb = traceback.format_exc()
        msg = str(e)
        if getattr(settings, 'DEBUG', False):
            return JsonResponse({'status': 'error', 'message': 'Exception saat membuat produk', 'exception': msg, 'traceback': tb}, status=500)
        else:
            # jangan bocorkan stack di production
            return JsonResponse({'status': 'error', 'message': 'Server error saat membuat produk.'}, status=500)

@login_required(login_url='/login')
@require_POST
def api_product_update(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Product not found.'}, status=404)

    if product.user != request.user:
        return JsonResponse({'status': 'error', 'message': 'Tidak punya izin.'}, status=403)

    try:
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            p = form.save()
            return JsonResponse({'status': 'success', 'message': 'Produk berhasil diupdate.', 'product': product_to_dict(p)}, encoder=DjangoJSONEncoder)
        else:
            return JsonResponse({'status': 'error', 'message': 'Validasi gagal', 'errors': form.errors}, status=400)
    except Exception as e:
        tb = traceback.format_exc()
        msg = str(e)
        if getattr(settings, 'DEBUG', False):
            return JsonResponse({'status': 'error', 'message': 'Exception saat update produk', 'exception': msg, 'traceback': tb}, status=500)
        else:
            return JsonResponse({'status': 'error', 'message': 'Server error saat update produk.'}, status=500)

@login_required(login_url='/login')
@require_POST
def api_product_delete(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Product not found.'}, status=404)

    if product.user != request.user:
        return JsonResponse({'status': 'error', 'message': 'Tidak punya izin.'}, status=403)

    try:
        product.delete()
        return JsonResponse({'status': 'success', 'message': 'Produk berhasil dihapus.'})
    except Exception as e:
        tb = traceback.format_exc()
        msg = str(e)
        if getattr(settings, 'DEBUG', False):
            return JsonResponse({'status': 'error', 'message': 'Exception saat menghapus produk', 'exception': msg, 'traceback': tb}, status=500)
        else:
            return JsonResponse({'status': 'error', 'message': 'Server error saat menghapus produk.'}, status=500)

# --------------------------
# Auth via AJAX endpoints
# --------------------------

@require_POST
def api_login(request):
    # Accept form-encoded JSON body or normal POST
    # We'll use AuthenticationForm for validation
    form = AuthenticationForm(request, data=request.POST)
    if form.is_valid():
        user = form.get_user()
        login(request, user)
        response = JsonResponse({'status': 'success', 'message': f'Berhasil login. Selamat datang, {user.username}!', 'redirect': reverse('main:show_main')})
        # set last_login cookie on JSON response as well
        response.set_cookie('last_login', str(datetime.datetime.now()))
        return response
    else:
        # create field error mapping
        errors = form.errors.get_json_data()
        return JsonResponse({'status': 'error', 'message': 'Login gagal', 'errors': errors}, status=400)


@require_POST
def api_register(request):
    form = UserCreationForm(request.POST)
    if form.is_valid():
        user = form.save()
        return JsonResponse({'status': 'success', 'message': 'Akun berhasil dibuat. Silakan login.', 'redirect': reverse('main:login')})
    else:
        errors = form.errors.get_json_data()
        return JsonResponse({'status': 'error', 'message': 'Pendaftaran gagal', 'errors': errors}, status=400)

@require_POST
def api_logout(request):
    logout(request)
    # tambahkan Django message agar toast muncul pada halaman setelah redirect,
    # selaras dengan behavior logout non-AJAX (navbar).
    messages.success(request, "Anda berhasil logout. Sampai jumpa kembali!|||Logout")
    response = JsonResponse({'status': 'success', 'message': 'Anda berhasil logout.', 'redirect': reverse('main:login')})
    response.delete_cookie('last_login')
    return response

# --------------------------
# Keep original non-AJAX views but they are now mostly thin wrappers / fallbacks
# --------------------------

@login_required(login_url='/login')
def create_product(request):
    # fallback server-rendered page (kept but AJAX preferred)
    form = ProductForm(request.POST or None, request.FILES or None)

    if request.method == "POST":
        if form.is_valid():
            product_entry = form.save(commit=False)
            product_entry.user = request.user
            product_entry.save()
            messages.success(request, "Produk berhasil ditambahkan.|||Create Product")
            return redirect('main:show_main')
        else:
            messages.error(request, "Gagal membuat produk. Mohon periksa kembali input.|||Create Product")

    context = {'form': form}
    return render(request, "create_product.html", context)


@login_required(login_url='/login')
def edit_product(request, id):
    product = get_object_or_404(Product, pk=id)
    form = ProductForm(request.POST or None, request.FILES or None, instance=product)
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            messages.success(request, "Produk berhasil diupdate.|||Update Product")
            return redirect('main:show_main')
        else:
            messages.error(request, "Gagal mengupdate produk. Mohon cek input.|||Update Product")

    context = {'form': form}
    return render(request, "edit_product.html", context)


@login_required(login_url='/login')
def delete_product(request, id):
    product = get_object_or_404(Product, pk=id)
    product.delete()
    messages.success(request, "Produk berhasil dihapus.|||Delete Product")
    return HttpResponseRedirect(reverse('main:show_main'))


def register(request):
    # fallback non-AJAX
    form = UserCreationForm()
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Akun Anda berhasil dibuat.|||Register')
            return redirect('main:login')
        else:
            messages.error(request, 'Gagal membuat akun. Mohon periksa kembali isian.|||Register')
    context = {'form':form}
    return render(request, 'register.html', context)


def login_user(request):
   if request.method == 'POST':
      form = AuthenticationForm(data=request.POST)
      if form.is_valid():
        user = form.get_user()
        login(request, user)
        messages.success(request, f"Anda berhasil login. Selamat datang, {user.username}!|||Login")
        response = HttpResponseRedirect(reverse("main:show_main"))
        response.set_cookie('last_login', str(datetime.datetime.now()))
        return response
      else:
        messages.error(request, "Username atau password salah.|||Login")
   else:
      form = AuthenticationForm(request)
   context = {'form': form}
   return render(request, 'login.html', context)


def logout_user(request):
    logout(request)
    messages.success(request, "Anda berhasil logout. Sampai jumpa kembali!|||Logout")
    response = HttpResponseRedirect(reverse('main:login'))
    response.delete_cookie('last_login')
    return response


def show_product(request, id):
    product = get_object_or_404(Product, pk=id)
    context = { 'product': product }
    return render(request, "product_detail.html", context)


# keep existing XML/JSON utilities
def show_xml(request):
     product_list = Product.objects.all()
     xml_data = serializers.serialize("xml", product_list)
     return HttpResponse(xml_data, content_type="application/xml")

def show_json(request):
    product_list = Product.objects.all()
    json_data = serializers.serialize("json", product_list)
    return HttpResponse(json_data, content_type="application/json")

def show_xml_by_id(request, product_id):
   try:
       product_item = Product.objects.filter(pk=product_id)
       xml_data = serializers.serialize("xml", product_item)
       return HttpResponse(xml_data, content_type="application/xml")
   except Product.DoesNotExist:
       return HttpResponse(status=404)

def show_json_by_id(request, product_id):
   try:
       product_item = Product.objects.get(pk=product_id)
       json_data = serializers.serialize("json", [product_item])
       return HttpResponse(json_data, content_type="application/json")
   except Product.DoesNotExist:
       return HttpResponse(status=404)