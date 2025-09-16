Tautan Aplikasi PWS: https://kadek-ngurah-saitamapensiunjerseystore.pbp.cs.ui.ac.id/

Tugas Individu 1

Jawaban dari pertanyaan-pertanyaan di Tugas Individu 2:

Soal Nomor 1

1. Menginiasi dan menghubungkan repositori GitHub dan direktori lokal untuk Saitama Pensiun Jersey Store
- Melakukan inisiasi repositori baru di GitHub dengan nama "Saitama-Pensiun-Jersey-Store"
- Membuat direktori lokal untuk proyek football shop dengan nama "Saitama Pensiun Jersey Store"
- Membuat branch utama baru dengan nama master
- Menghubungkan direktori lokal "Saitama Pensiun Jersey Store" dengan repository "Saitama-Pensiun-Jersey-Store"

2. Melakukan set up virtual environment, menyiapkan dependancies, dan membuat proyek Django
- Membuat virtual environment di direktori Saitama Pensiun Jersey Store
- Mengaktivan virtual environment
- Membuat berkas requirements.txt, lalu menambahkan beberapa dependancies
- Meng-install dependancies pada requirements.txt
- Membuat proyek Django dengan nama "SaitamaPensiunJerseyStore"

3. Mengkonfigurasi environment variables dan proyek Django-nya
- Membuat file .env lalu ditambahkan "PRODUCTION=False" 
- Membuat file .env.prod lalu diisi dengan kredensial database milik saya yang sudah dikirim ke email UI saya dan ditambahkan "PRODUCTION=True".
- Memodifikasi beberapa hal di settings.py
- Menambahkan berkas .gitignore

4. Membuat dan melakukan set up untuk aplikasi main
- Membuat aplikasi baru dengan nama main
- Mendaftarkan aplikasi main ke proyek "Saitama Pensiun Football Store"
- Membuat direktori "templates" di dalam direktori main
- Membuat berkas main.html yang berisi nama, NPM, dan kelas PBP saya sendiri
- Membuat kelas Product di models.py
- Mengisi kelas Product dengan atribut wajib yang sudah disebutkan di dokumen Tugas Individu 2
- Membuat dan melakukan migrasi model sekaligus melakukan migrasi database
- Menghubungkan view dengan template dengan memodifikasi beberapa hal di views.py dan main.html
- Mengonfigurasi routing URL aplikasi main dan routing URL proyek

5. Melakukan deployment melalui PWS
- Membuat proyek baru di PWS dengan nama "saitamapensiunjerseystore"
- Mengubah isi raw environment editor di PWS supaya sesuai dengan yang ada di file .env.prod
- Menambahkan URL deployment PWS pada settings.py 
- Melakukan git add, commit dan push ke repositori GitHub "Saitama-Pensiun-Jersey-Store"
- Melakukan git push pws master untuk menyimpan segala perubahan yang saya lakukan di proyek Saitama Pensiun Jersey Store
- Menjalankan perintah Project Command di PWS, lalu masuk menggunakan credentials yang ditampilkan sebelumnya
- Mengecek apakah website Saitama Pensiun Jersey Store sudah menampilkan apa yang ada di main.html dengan menekan tombol View Project
- SELESAI DEH

Soal Nomor 2    
![Bagan Request Client](Gambar_Bagan_Request_Client.png)
Kaitan urls.py, views.py, models.py, dan berkas html
- urls.py berfungsi sebagai peta yang ngecocokin URL yg diminta oleh user dgn fungsi yg ada di views.py
- views.py akan menerima request dari urls.py, memprosesnya, lalu jika butuh membaca/menulis data maka akan manggil si models.py
- models.py tugasnya sebagai jembatan ke database, nyediain representasi data, ngelakuin query, lalu ngembaliin hasil ke view
- kalo datanya udah siap, views.py bakal nerusin ke berkas HTML yg punya tugas utk ngerender tampilan halaman web supaya bisa dilihat oleh user

Referensi:
- PPT "Introduction to the Internet and Web Framework" by Tim Dosen PBP (Page 28)
- https://www.w3schools.com/django/django_intro.php

Soal Nomor 3
- Menyimpan semua settings yang mengontrol jalannya aplikasi Django
- Menentukan working environment, apakah aplikasi bekerja dalam development mode atau production mode
- Memberi tahu Django database mana yang akan dipakai
- Menentukan aplikasi apa saja yang bakalan digunakan
- Menentukan proses middleware yang dilalui setiap ada request/response
- Mengatur resource proyek, seperti template, static file, dan media file
- Mengatur bahasa dan time zone
- Mengatur keamanan proyek

Referensi:
https://docs.djangoproject.com/en/stable/topics/settings/

Soal Nomor 4

- Migrasi di Django merupakan mekanisme utk menyinkronkan model Python di models.py dgn struktur tabel yang ada di database. Django memakai migrasi agar perubahan pada model (misalkan menambahkan field, menghapus tabel, dll) bisa terlihat di database tanpa harus menulis SQL scr manual. Gampangnya gini, misal saya melakukan perubahan di models.py. Untuk membuat file migrasi, saya akan menggunakan perintah "python manage.py makemigrations". Django akan membaca perubahan di models.py, terus dia akan membuat file migrasi di folder /migration. Utk meng-apply migrasi nya, saya hanya perlu menjalankan perintah "python manage.py migrate". Django bakalan nerjemahin instruksi dr file migrasi menjadi perintah SQL sesuai database yg dipake. Django juga selalu nyimpen catetan migrasi yg udh dijalanin di tabel khusus pada database. Jadi, si Django-Django ini bakalan tau migrasi mana yg udh atau blm diterapin. Kesimpulannya, migrasi di Django itu kayak jembatan antara kode Python dan database.

Referensi:
https://docs.djangoproject.com/en/stable/topics/migrations/


Soal Nomor 5
1. Fitur bawaan nya cukup lengkap
- Django bisa dibilang nyediain hampir semua kebutuhan dasar aplikasi web secara langsung, kayak sistem autentikasi, ORM, admin panel, manajemen URL, keamanan, migrasi database, dan masih banyak lagi. Hal inilah yg ngebuat pemula ga perlu repot-repot make library eksternal sehingga si pemula bisa lebih fokus ke konsep fundamental software development nya.
2. Dokumentasi yg bagus, rapi, dan gampang dimengerti
- Dokumentasi di Django ini bener-bener rapi, jelas, sistematis, pokoknya gampang dingertiin dah. Ada banyak tutorial juga yg bikin kita bisa paham step-by-step nya gimana.
3. Struktur proyek yg rapi dan terstandarisasi
- Django ngedorong kita dari awal utk ngikutin pola tertentu, di kasus Django ini yg dipake adalah MTV (Model-Template-Views). Jadi, kita bisa terbiasa dgn praktek software development yg ter-organize sejak awal, bukan nulis kode asal-asalan.
4. Banyak dipake di industri
- Django ini ternyata banyak dipake oleh perusahaan-perusahaan besar, kayak Instagram, Pinterest, Mozilla, dan masih bnyk lagi. Ini ngebuat pemula belajar sesuatu yg relevan dgn dunia kerja saat ini, bukan cuma framework yg dipake buat belajar doang trus kalo udah masuk ke industri kerja ga kepake lagi.

Referensi:
- https://realpython.com/tutorials/django/
- https://www.djangoproject.com/~

Soal Nomor 6
- Gak ada kak, aman semua. Asdos nya udah pada gercep kemaren, setiap ditanya langsung jawab dgn jelas, ga kaya asdos matkul d***, eh sorry hehe. Keep up the good work pokoknya kakak-kakak asdos PBP!

Tugas Individu 2

Jawaban dari pertanyaan-pertanyaan di Tugas Individu 2:

1. Alasan memerlukan data delivery dalam pengimplementasian sebuah platform
- karena data delivery memungkinkan data yg dikumpulkan di bagian satu (contohnya backend, database, API) dikirim ke bagian yang lain (contohnya frontend, aplikasi mobile) sehingga data menjadi sinkron dan tidak terjadi inkonsistensi.
- karena data delivery memastikan data terkirim dalam format yg dpt dimengerti oleh semua penerima (seperti JSON, XML, CSV, dsb.) sehingga data bisa lgsg dibaca dan diproses oleh user tanpa perlu konversi scr manual.
- karena data delivery memastikan informasi sampai dgn cepat agar keputusan dan layanan bisa real-time
- karena data delivery dapat menangani volume data besar dan bisa mengirim data dgn lancar
- karena data delivery menggunakan enkripsi, autentikasi, dan kontrol akses sehingga data terjamin aman 
- karena data delivery memiliki mekanisme pengiriman otomatis sehingga pekerjaan manual bisa dikurangi.

referensi: 
- https://www.datamanagementblog.com/data-delivery-four-challenges-one-solution/
- https://www.infoworld.com/article/2266722/why-you-need-a-data-integration-platform.html

2. Mana yang lebih baik antara XML dan JSON? Mengapa JSON lebih populer dibandingkan XML?

menurut saya, JSON lebih baik dari XML, alasannya sama seperti alasan mengapa JSON lebih populer dari XML, yaitu:
- data di JSON lebih singkat sehingga data JSON lebih ringan dari data XML
- JSON lebih mudah dibaca karena strukturnya mirip objek di bahasa pemrograman
- hampir semua RESTful API menggunakan JSON sebagai format default
- hampir semua bahasa pemrograman punya library bawaan utk JSON

referensi:
- https://www.w3schools.com/js/js_json_xml.asp
- https://www.geeksforgeeks.org/difference-between-json-and-xml/

3. Fungsi dari method is_valid() pada form Django dan alasan kita membutuhkannya

method is_valid() pada form Django berfungsi untuk:
- memeriksa apakah semua field sudah diisi sesuai aturan (misal "required=True", format email valid, panjang string sesuai, dsb)
- mengembalikan 'True' jika data valid dan 'False' jika datanya error
- menjalankan custom validation

alasan membutuhkan method is_valid():
- menjamin data sesuai aturan (misal menghindari data yg kosong, salah format, tidak sesuai tipe data-nya, dll.)
- mencegah input berbahaya masuk ke database
- memudahkan developer karena django sudah otomatis mengurus validasi dasar sehingga tidak perlu utk membuat logika validasi manual pada setiap field nya
- membuat error handling menjadi lebih terstruktur (misal jika ada form yg tidak valid, kita bisa lgsg menampilkan pesan error ke user)

referensi:
- https://docs.djangoproject.com/en/stable/ref/forms/api/#django.forms.Form.is_valid
- https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Forms

4. Mengapa kita membutuhkan csrf_token saat membuat form di Django? Apa yang dapat terjadi jika kita tidak menambahkan csrf_token pada form Django? Bagaimana hal tersebut dapat dimanfaatkan oleh penyerang?

alasan membutuhkan crsf_token saat membuat form di django:
- untuk mencegah CSRF (Cross-Site Request Forgery) attack, yaitu serangan dmn penyerang mencoba mengelabui user agar mereka mengirim request berbahaya ke server tanpa sepengetahuan mereka.
- token ini juga memastikan bahwa form benar2 dikirim dari situs Django yg sah, bukan dari situs luar yg tidak dikenal

hal yg akan terjadi jika tidak menambahkan csrf_token:
- django akan menolak request form POST karena default nya django punya proteksi CSRF
- form menjadi rentan terhadap serangan CSRF

bagaimana hal tersebut dimanfaatkan oleh penyerang?
- Penyerang akan membuat page yg berisi form/post request tersembunyi. Jika korban dalam keadaan login ke aplikasi django, browser korban akan otomatis mengirimkan cookie session saat mengunjunginya page penyerang. Nah, karena tidak ada csrf_token, server gak akan bisa bedain apakah request berasal dari aplikasi sah atau dari situs gak jelas. Akibatnya, aksi berbahaya bisa dijalankan atas nama korban itu (misal ganti password, transfer uang, posting sesuatu, dan masih bnyk lagi)

5.

6. Gak ada kak




Mengakses keempat URL dengan menggunakan Postman
![XML](Postman_Request_XML.png)
![JSON](Postman_Request_JSON.png)
![XML by ID](Postman_Request_XML_by_ID.png)
![JSON by ID](Postman_Request_JSON_by_ID.png)