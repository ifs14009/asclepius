# Instruksi

Aplikasi harus di-deploy menggunakan layanan dari Google Cloud dengan arsitekturnya adalah sebagai berikut.
![dos-5ec56ee9e3227762be5d6e7693699d2120240110160337.jpeg](https://assets.cdn.dicoding.com/original/academy/dos-5ec56ee9e3227762be5d6e7693699d2120240110160337.jpeg)

Terdapat tujuh kriteria utama yang harus Anda penuhi untuk membangun aplikasi machine learning dengan Google Cloud.

### Kriteria 1: Membuat Google Cloud Project

Guna menghindari lingkungan kerja antara personal project dengan submission, Anda perlu membuat Google Cloud project baru dengan ketentuan format **project ID** atau **project name** seperti berikut **submissionmlgc-namapeserta**.

### Kriteria 2: Memberi Hak Akses ke Auditor Eksternal

Setelah proses deployment aplikasi usai, Anda harus memberikan hak akses yang sesuai kepada auditor eksternal. Sehingga, ia bisa memeriksa arsitektur cloud yang telah Anda buat dengan saksama.

Silakan berikan hak akses kepada **reviewer\_googlecloud@dicoding.com** ke dalam project Anda.

### Kriteria 3: Membuat API dan melakukan deployment aplikasi backend menggunakan Compute Engine

Sebagaimana disebutkan sebelumnya, Anda perlu membuat web server yang dapat menangani inferensi model machine learning. 

API yang dibuat harus memiliki detail seperti berikut.

| Field |
| --- |
| Prediksi:<br>- URL Endpoint: /predict<br>- Method: POST<br>- Content-Type: multipart/form-data<br>- Request body:<br>- image as file, harus berukuran maksimal 1MB (1000000 byte) |

-   Jika pengguna mengirimkan gambar yang **terindikasi penyakit kanker**, respon API harus memiliki struktur berikut.
    
    {
       "status": "success",
       "message": "Model is predicted successfully",
       "data": {
           "id": "77bd90fc-c126-4ceb-828d-f048dddff746",
           "result": "Cancer",
           "suggestion": "Segera periksa ke dokter!",
           "createdAt": "2023-12-22T08:26:41.834Z"
       }
    }
    
-   Jika pengguna mengirimkan gambar yang **TIDAK terindikasi penyakit kanker**, respon API harus memiliki struktur berikut.  
    
    {
       "status": "success",
       "message": "Model is predicted successfully",
       "data": {
           "id": "77bd90fc-c126-4ceb-828d-f048dddff746",
           "result": "Non-cancer",
           "suggestion": "Penyakit kanker tidak terdeteksi.",
           "createdAt": "2023-12-22T08:26:41.834Z"
       }
    }
    
-   Jika pengguna **mengirimkan gambar lebih dari 1MB (1000000 byte)**, API akan merespons error dengan detail seperti berikut.
    
    **Status Code**: 413
    **Body Response**:
    {
       "status": "fail",
       "message": "Payload content length greater than maximum allowed: 1000000"
    }
    
-   Jika prediksi **mengalami error seperti format dan shape gambar yang tidak sesuai atau merujuk pada kesalahan ketika melakukan prediksi baik dari sisi model atau pun pengguna**. API akan merespons error dengan detail seperti berikut.
    
    **Status Code**: 400
    **Body Response**:
    {
       "status": "fail",
       "message": "Terjadi kesalahan dalam melakukan prediksi"
    }
    

> **Catatan:**
> 
> Jika Anda menggunakan Hapi, kasus **mengirimkan gambar lebih dari 1MB (1000000 byte)** dapat merujuk pada dokumentasi Hapi tentang API [payload](https://hapi.dev/api/?v=21.3.3#-routeoptionspayload) dan membaca ulang submodul "Membangun Web Service" pada modul 4 untuk kustomisasi pesan kesalahan.  
>   
> Namun, jika menggunakan framework lain, Anda dapat mencari tahu caranya melalui dokumentasi framework masing-masing.

### Kriteria 4: Melakukan deployment aplikasi frontend menggunakan App Engine.

Tak hanya back-end, Anda pun harus melakukan deployment aplikasi front-end menggunakan App Engine standard environment. 

Anda hanya perlu memasukan base url backend pada berkas **src -> scripts -> api.js**. Perhatikan kode yang diberikan komentar **//TODO**.

### Kriteria 5: Menggunakan Cloud Storage untuk menyimpan model machine learning.

Singkat cerita, Melly telah berhasil melakukan pengembangan model machine learning dan disimpan dalam SavedModel format, lalu mengubahnya menjadi TensorFlow.js web format.

Model yang Melly bangun adalah _binary classification_ dengan input shape model, yakni:
1.  Lebar (width) berukuran 224 pixel,
2.  Tinggi (height) berukuran 224 pixel, dan
3.  Warna (color kernel) adalah RGB dengan 3 warna.

Perlu diingat, binary classification adalah jenis klasifikasi machine learning di mana hasil yang didapat berupa dua kelas. Dalam hal ini, model machine learning hanya mengembalikan **Cancer** dan **Non-cancer**.  

Oh iya, Melly memiliki catatan untuk Anda:

“Saat ini, TensorFlow js sering mengalami kendala instalasi di Windows. Jika ingin mengembangkan aplikasi, Anda bisa menggunakan WSL dan menginstal library **@tensorflow/tfjs-node** dengan versi **3.21.1.** Oh iya, pastikan menggunakan node js dengan versi minimalnya adalah 18.16.” 

Model akan mengembalikan array dengan rentang nilai 0 hingga 1. Di mana jika rentang nilainya di atas 50% diklasifikasikan sebagai **Cancer**, jika di bawah atau sama dengan 50% diklasifikasikan sebagai **Non-cancer**. 

Tugas Anda adalah menyimpan model yang Melly buat di Cloud Storage bucket dan aplikasi Anda perlu melakukan load model dari object tersebut.

### Kriteria 6: Menggunakan Firestore sebagai basis data dalam menyimpan hasil prediksi.

Seluruh data dari response API **harus disimpan ke Firestore dengan** **native mode**. Struktur data di dalam Firestore adalah root-level collection.

![dos-99f07c68d8ba65fb57263cd186e9887320240524095640.png](https://assets.cdn.dicoding.com/original/academy/dos-99f07c68d8ba65fb57263cd186e9887320240524095640.png)

Sesuai dengan visualisasi di atas, database Anda harus memiliki kriteria berikut.

1.  Collection bernama **predictions**.
2.  Nama setiap dokumen harus merupakan **id response**.
3.  Data pada setiap dokumen harus mengandung field **id**, **result**, **suggestion**, dan **createdAt**.

Untuk memudahkan pemeriksaan data, **PASTIKAN** dalam project submission Anda, hanya memiliki 1 database dan 1 collection bernama "**predictions**".

> Disarankan menggunakan database "**(****default)**"untuk memanfaatkan free quota dan jika Anda sudah memiliki database **"(default)"** dengan mode Datastore, selama data tersebut masih kosong Anda bisa mengubahnya dengan mengikuti dokumen [berikut](https://cloud.google.com/datastore/docs/firestore-or-datastore#changing_between_native_mode_and_datastore_mode).

### Kriteria 7: Web Server menggunakan Static External IP

Terakhir, eksternal IP untuk web server Anda harus merupakan **static IP** agar web server dapat bekerja secara optimal dan konsisten dalam menangani setiap request yang masuk melalui front-end.

Proyek Anda akan dinilai oleh Reviewer guna menentukan kebenaran submission yang dikerjakan. Supaya bisa lulus dari kelas ini, proyek Anda harus memenuhi seluruh kriteria yang ada. Apabila ada ketentuan dalam kriteria yang belum terpenuhi, proyek Anda akan kami tolak.

Submission Anda akan dinilai oleh Reviewer dengan **penilaian bintang berskala 1-5**. Untuk mendapatkan nilai tinggi, Anda bisa menerapkan beberapa saran berikut:

1.  Dalam memberikan hak akses ke auditor eksternal, Anda harus menerapkan _**principle of least privilege**._
2.  Melakukan **deployment** aplikasi backend menggunakan layanan **Cloud Run**.  
    Perlu diingat, jika Anda menerapkan saran ini, kriteria utama poin 3 tentang deployment Compute Engine dan poin 7 tentang penggunaan static IP akan otomatis terpenuhi. Sehingga Anda tidak perlu mengerjakannya.
3.  Menambahkan endpoint baru yang bertujuan sebagai riwayat prediksi dengan cara mengambil seluruh data yang telah Anda simpan di Firestore.  Berikut detail ketentuannya.
    1.  Method: **GET**
    2.  Path: **/predict/histories**
    3.  **Response body** yang harus ditampilkan adalah sebagai berikut.
        
        {
           "status": "success",
           "data": \[
               {
                   "id": "13e907b3-4213-42ad-b12b-b9b7e12eb90e",
                   "history": {
                       "result": "Cancer",
                       "createdAt": "2023-12-22T10:04:40.341Z",
                       "suggestion": "Segera periksa ke dokter!",
                       "id": "13e907b3-4213-42ad-b12b-b9b7e12eb90e"
                   }
               },
               {
                   "id": "19555e44-9cc7-4bc4-98b9-732d69cac082",
                   "history": {
                       "result": "Non-cancer",
                       "createdAt": "2023-12-22T10:06:50.783Z",
                       "suggestion": "Anda sehat!",
                       "id": "19555e44-9cc7-4bc4-98b9-732d69cac082"
                   }
               }
           \]
        }
        

> **Catatan**:  

Ketika membangun aplikasi machine learning, tentu Anda perlu menguji untuk memastikan API berjalan sesuai dengan kriteria yang ada. Kami sudah menyediakan berkas Postman Collection dan data testing yang dapat Anda gunakan untuk pengujian. Silakan unduh berkasnya pada tautan berikut:

-   [Postman Asclepius API Test Collection](https://github.com/dicodingacademy/a658-machine-learning-googlecloud/releases/download/submission-v2/Asclepius.postman_collection.json)
-   [Data Testing](https://github.com/dicodingacademy/a658-machine-learning-googlecloud/releases/download/submissions/data-test-submissions.zip)

Untuk Postman collection, Anda perlu meng-_import_\-nya pada Postman untuk bisa digunakan. Caranya, unduh berkas test collection tersebut, kemudian pada aplikasi Postman, klik tombol **import** yang berada di atas panel kanan aplikasi. 

![dos-0e9388b6ad01609dca1b02c8f21d824620240226181722.png](https://assets.cdn.dicoding.com/original/academy/dos-0e9388b6ad01609dca1b02c8f21d824620240226181722.png)

Kemudian klik tombol **folders** untuk meng-import berkas JSON tersebut.

![dos-5353398f86abc614cbfc4a2d630aadee20240226181854.png](https://assets.cdn.dicoding.com/original/academy/dos-5353398f86abc614cbfc4a2d630aadee20240226181854.png)

Setelah selesai, Anda akan melihat folder berisi beberapa request API.

![dos-158cbd03e4f6b1a1ba6ea75ae9cdcbde20240628130724.png](https://assets.cdn.dicoding.com/original/academy/dos-158cbd03e4f6b1a1ba6ea75ae9cdcbde20240628130724.png)

Perhatikan bahwa tag **\[Mandatory\]** menandakan jika request tersebut harus berhasil dijalankan tanpa terjadi error. Jika terjadi error dan Anda melakukan submit submission, projek akan ditolak.

Sementara itu tag **\[Opsional\]** merupakan request yang ditujukan untuk poin saran. Jika Anda ingin menyelesaikan saran submission terkait riwayat prediksi, pastikan pengujian tersebut berhasil dijalankan dan tidak terjadi error.  
  
Jika Anda melakukan submiit submission dengan memiliki kesalahan pada request ini, reviewer menganggap Anda tidak mengejakan poin saran tersebut.  
  
Setelah collection berhasil di-import, sekarang buka tab **Environments** dan **pilih Asclepius.** Lalu, ganti initial value dan current value dengan backend url Anda.  
![dos-e95b64967f4aed5c94a56afb3dfa423720240624144037.png](https://assets.cdn.dicoding.com/original/academy/dos-e95b64967f4aed5c94a56afb3dfa423720240624144037.png)

Sebelum menjalankan setiap request, silakan tentukan lokasi directory postman Anda. Pilih icon pengaturan di pojok kanan dan klik **settings**.  
![dos-d92325bf706aa491d0d90df857d9526a20240624144503.png](https://assets.cdn.dicoding.com/original/academy/dos-d92325bf706aa491d0d90df857d9526a20240624144503.png)

Setelah itu, pilih **General > Location > Choose** dan pilih lokasi di mana data-test-submissions Anda simpan.  
![dos-ad165d0b8e2a4b1fc08806522712dd0a20240624144736.png](https://assets.cdn.dicoding.com/original/academy/dos-ad165d0b8e2a4b1fc08806522712dd0a20240624144736.png)  
Postman siap!

Silakan lakukan pengujian dan pastikan seluruh request pada folder Asclepius Mandatory berhasil dijalankan tanpa ada kesalahan. Jika masih ada kesalahan dan Anda submit submission, projek akan ditolak.

Berikut adalah beberapa tips yang perlu Anda perhatikan.

1.  Anda dapat merujuk pada kelas Menjadi Google Cloud Engineer untuk mempelajari cara melakukan deployment menggunakan Cloud Run.
2.  Apabila Anda menemukan masalah, cobalah temukan solusinya di dokumentasi Google Cloud.
3.  Jika menggunakan Hapi, Anda bisa memanfaatkan onPreResponse pada Hapi untuk menangani error pada seluruh endpoint.
4.  Sebelum melakukan deployment ke tingkat production (Google Cloud), Anda harus memastikan semuanya berjalan baik di lokal komputer.
5.  Tim reviewer akan memeriksa daftar layanan-layanan di bawah ini, Anda bisa mencari permissions atau role yang sesuai berdasarkan kebutuhan reviewer.
    1.  App Engine.
    2.  Compute Engine.
    3.  Cloud Storage.
    4.  VPC Network -> IP addresses (Pastikan API Compute Engine aktif).
    5.  Firestore.
    6.  Cloud Run (jika mengerjakan saran).
    7.  Cloud Artifact Registry (jika mengerjakan saran).
6.  Untuk pengguna Windows, pastikan menggunakan terminal ubuntu untuk menjalankan web service selama proses deployment. Anda bisa merujuk kembali ke materi di modul 2 tentang [Latihan Membangun Environment Machine Learning dengan Compute Engine](https://www.dicoding.com/academies/658/tutorials/36543).
7.  Contoh response API untuk kriteria ke-6 dilampirkan pada Ketentuan Pengiriman Submissions.

### Ketentuan Pengiriman Submissions

Beberapa poin yang perlu diperhatikan ketika mengirimkan submission antara lain:

-   Anda harus mengirimkan file dengan ketentuan berikut.
    -   Salin kode di bawah ini dan isi value JSON sesuai dengan yang dibutuhkan, setelah itu simpan ke dalam file json bernama **requirements.json**.
        
        {  
         "backend-service-url": "isi dengan url backend Anda",
         "frontend-service-url": "isi dengan url frontend Anda",
         "project-id": "isi dengan project ID Google Cloud Project Anda",
         "bucket-name": "isi dengan nama bucket yang menyimpan model Anda"
        }
        
-   Ketentuan di atas harus sama persis, baik nama file atau pun nilai yang berada pada file **requirements.json**.
-   Berkas submission yang dikirimkan merupakan folder yang berisi kumpulan berkas yang diminta dalam bentuk **ZIP**. Pastikan Anda tidak melakukan ZIP dalam ZIP.