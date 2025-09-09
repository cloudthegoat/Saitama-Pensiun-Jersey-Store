Tautan Aplikasi PWS: https://kadek-ngurah-saitamapensiunjerseystore.pbp.cs.ui.ac.id/

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
