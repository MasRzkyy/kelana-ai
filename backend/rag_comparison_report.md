# Laporan Perbandingan AI: Base-Model vs Grounded RAG

## Informasi Sistem
- Model LLM: Amazon Nova Lite (`amazon.nova-lite-v1:0`)
- Knowledge Base ID: `EW7EM5BPON`
- Dokumen Rujukan Utama: `original-Koryo_Tours_North_Korea_Guide_2019.pdf`

---

## Skenario 1: Belanja & Penukaran Uang di Pyongyang

### Input Skenario
- Parameter Planner (Form): Destination: Pyongyang | Budget: $1500 | Days: 4 | Style: Solo | Month: May
- Pertanyaan Assistant (Chat): "Saya berencana solo trip selama 4 hari ke Pyongyang pada bulan Mei dengan budget $1500. Ke mana saja saya bisa berkunjung, dan di mana department store lokal yang memungkinkan turis berbelanja bersama warga dan menukar uang lokal?"

### Hasil Base-Model (Planner)
- Menghasilkan itinerary umum 4 hari: Kim Il-sung Square, Victorious War Museum, Kumsusan Palace, Arch of Triumph, Myohyangsan, dan Koryo Hotel Observation Deck.
- Total estimasi biaya: $553.
- Catatan: Tidak menyebutkan Kwangbok Department Store, lokasi penukaran uang lokal, maupun aturan operasional toko. Tidak ada sitasi dokumen.

### Hasil Grounded RAG (Assistant)
- Menghasilkan itinerary presisi 4 hari:
  - Day 1: Kwangbok Department Store (belanja bersama warga & tukar uang lokal, tutup hari Selasa) dan Pyongyang Sweet Meat Restaurant.
  - Day 2: Arirang Restaurant, Meari Shooting Range (tembak sasaran pistol/senapan), dan Mt. Ryonggak Picnic/Hike.
  - Day 3: Potonggang Restaurant (BBQ domba) dan Kumrung Leisure Complex (Snow White Coffee Shop, shooting range, squash).
  - Day 4: Rakwon (Paradise) Department Store (buah, sayur, roti) dan Pyongyang Ice Rink (skating & hoki es).
- Ringkasan Toko: Kwangbok (tukar uang lokal), Rakwon, dan Taesong Department Store.
- Sitasi Sumber: `original-Koryo_Tours_North_Korea_Guide_2019.pdf`

### Analisis Perbandingan
Base-Model hanya memberikan rekomendasi tempat umum yang populer di internet. Sedangkan RAG berhasil mengambil informasi spesifik dari file PDF tentang tempat belanja lokal (Kwangbok Store), aturan penukaran mata uang lokal, jam tutup toko, serta melampirkan sitasi resmi dokumen.

---

## Skenario 2: Aturan Bea Cukai & Larangan Buku Panduan

### Input Skenario
- Parameter Planner (Form): Destination: Pyongyang | Budget: $2000 | Days: 5 | Style: Family | Month: April
- Pertanyaan Assistant (Chat): "Saya ingin trip keluarga selama 5 hari ke Pyongyang pada bulan April dengan budget $2000. Rekomendasi tempat apa saja yang cocok dan apa aturan bea cukai terkait membawa materi tertulis atau buku panduan cetak tentang DPRK?"

### Hasil Base-Model (Planner)
- Menghasilkan itinerary keluarga 5 hari di Pyongyang (Hostel $20/malam):
  - Day 1: Arrival, Kim Il-sung Square, Mansudae Grand Monument, Sungri Street.
  - Day 2: Museum of the Revolution ($2), Victorious War Museum ($2), Koryo Hotel exterior, Pyongyang Circus ($5).
  - Day 3: Arch of Triumph, Korean Central History Museum ($2), Pyongyang Art Gallery.
  - Day 4: Day Trip ke Myohyang Mountain ($15), area pemandangan Myohyang.
  - Day 5: Belanja di pasar lokal, Pyongyang Grand Theatre, kepulangan.
  - Estimasi Biaya: $251 (sisa budget $1,749).
- Catatan: **Sama sekali TIDAK memuat informasi aturan bea cukai (Customs regulations)** terkait buku/materi cetak karena form Planner tidak mendukung input pertanyaan aturan khusus. Tidak ada sitasi dokumen.

### Hasil Grounded RAG (Assistant)
- Menghasilkan itinerary keluarga 5 hari ($2000 budget):
  - Akomodasi: Changgwangsan Hotel ($100-$150/malam).
  - Day 1: Arrival, Changgwangsan Hotel, Mansu Hill Grand Monument, Kim Il Sung Square, Juche Tower.
  - Day 2: Victorious War Museum ($5), Kumsusan Palace of the Sun ($10), Arirang Restaurant ($20/orang).
  - Day 3: Meari Shooting Range ($10-$20), Rungnado Funfair & Leisure Facilities ($5), piknik Mt. Ryonggak ($5).
  - Day 4: Hike Mt. Ryonggak, Moranbong Bandstand & Park, Potonggang Restaurant ($20/orang).
  - Day 5: Kwangbok Department Store ($10/orang), belanja & kepulangan.
  - Estimasi Total Biaya: $650 - $900.
- Informasi Aturan Bea Cukai (Customs):
  - Dilarang keras membawa materi cetak, buku, atau dokumen yang dianggap sensitif secara politik atau mengkritik pemerintah/ideologi DPRK.
  - Wajib melaporkan (declare) materi tertulis kepada petugas bea cukai jika diminta.
- Sitasi Sumber: `original-Koryo_Tours_North_Korea_Guide_2019.pdf`

### Analisis Perbandingan
Base-Model hanya berfokus pada pembuatan rute wisata generik tanpa bisa menjawab aturan proteksi bea cukai negara tempat tujuan. Sebaliknya, RAG System berhasil menjawab secara presisi aturan bea cukai terkait larangan materi cetak sensitif mengenai DPRK dari file PDF panduan asli, serta memberikan sitasi dokumen yang dapat diverifikasi.

---

## Skenario 3: Pameran Hadiah Internasional (Mt. Myohyang)

### Input Skenario
- Parameter Planner (Form): Destination: Mt. Myohyang | Budget: $1200 | Days: 3 | Style: Couple | Month: September
- Pertanyaan Assistant (Chat): "Saya dan pasangan ingin liburan 3 hari ke daerah Mt. Myohyang pada bulan September dengan budget $1200. Tempat mana saja yang direkomendasikan dan apa yang dipamerkan di International Friendship Exhibition?"

### Hasil Base-Model (Planner)
- Menghasilkan itinerary Mt. Myohyang (Budget $29 - $40):
  - Perjalanan naik transportasi umum (diklaim gratis).
  - Hiking ke Myohyang Waterfall & sarapan lokal ($3-$5).
  - Kunjungan ke Juche Tower ($5) *(halusinasi lokasi: Juche Tower ada di Pyongyang, bukan di Mt. Myohyang)*.
  - Eksplorasi Desa Myohyang-ri & menginap di hostel Pyongyang ($15-$30).
- Catatan: **Sama sekali TIDAK memuat pameran International Friendship Exhibition** maupun koleksi hadiah uniknya. Mengalami halusinasi lokasi geografis Juche Tower dan klaim transportasi publik gratis di DPRK. Tidak ada sitasi dokumen.

### Hasil Grounded RAG (Assistant)
- Rekomendasi Destinasi di Mt. Myohyang (Liburan Pasangan 3 Hari, Budget $1200):
  1. **International Friendship Exhibition**: Gedung pameran semi-subterranean yang memajang hadiah untuk Pemimpin DPRK dari negara asing. Highlights koleksi: pesawat dari Uni Soviet, bola basket bertanda tangan Michael Jordan (hadiah US State Dept), dan Vodka dari Dennis Rodman.
  2. **Pohyon Buddhist Temple**: Candi Buddha dari tahun 1042 AD (pagoda batu & kitab Tripitaka Koreana).
  3. **Ryongmun Caves**: Gua batu kapur bawah tanah dengan stalaktit/stalagmit unik.
  4. **Manpok Valley Hike**: Jalur mendaki dengan pemandangan air terjun dan lokasi piknik.
  5. **Cemetery for Martyrs of Chinese Army**: Makam tentara Tiongkok (termasuk patung Mao Anying).
  6. **Songhung Revolutionary Site**: Gua & terowongan peninggalan perang.
- Opsi Akomodasi & Transportasi: Huichon Hotel / Hoechang Guesthouse; perjalanan 2.5 - 3 jam via Mt. Myohyang Tourist Highway dari Pyongyang.
- Sitasi Sumber: `original-Koryo_Tours_North_Korea_Guide_2019.pdf`

### Analisis Perbandingan
Base-Model mengalami halusinasi geografis (menempatkan Juche Tower di Mt. Myohyang) serta klaim tidak akurat mengenai sistem transportasi DPRK. Sebaliknya, RAG System terbukti akurat dan kaya informasi otentik, berhasil menyebutkan nama museum (International Friendship Exhibition) beserta item koleksi legendarisnya (pesawat Uni Soviet, bola basket Michael Jordan, vodka Dennis Rodman) langsung dari file PDF rujukan.

---

## Tabel Ringkasan Evaluasi Peningkatan

| Skenario | Base-Model Murni (Planner) | Grounded RAG (Assistant) | Kesimpulan Peningkatan |
| :--- | :--- | :--- | :--- |
| **1. Belanja & Tukar Uang** | Itinerary umum, tanpa lokasi toko lokal & tanpa sitasi. | Menyebut Kwangbok Store, penukaran uang, jam buka, & sitasi PDF. | Jawaban akurat, spesifik, & bersumber resmi. |
| **2. Aturan Bea Cukai** | Itinerary umum, tanpa memuat informasi aturan bea cukai. | Menjelaskan larangan materi cetak sensitif DPRK & sitasi PDF. | Mampu menjawab aturan proteksi hukum/bea cukai lokal. |
| **3. Friendship Exhibition** | Halusinasi lokasi (Juche Tower di Myohyang) & tanpa museum. | Menyebut pameran hadiah, bola basket Michael Jordan, vodka Rodman & sitasi PDF. | Bebas halusinasi & memberikan fakta historis presisi. |

---

## Kesimpulan Dokumentasi Peningkatan Kualitas AI

Berdasarkan pengujian dan perbandingan secara langsung antara jawaban dari **Sistem RAG (Amazon Bedrock Knowledge Base)** pada halaman Assistant dan **Base-Model Murni (LLM Nova Lite)** pada halaman Planner, diperoleh kesimpulan dokumentasi peningkatan kualitas sebagai berikut:

### 1. Perbandingan Langsung Karakteristik Jawaban
* **Base-Model Murni (Planner `/`):**
  * Berfokus hanya pada pembuatan estimasi rute dan anggaran secara umum berbasis data *pre-training* publik.
  * **Keterbatasan Utama:** Mengalami halusinasi fakta/geografis (seperti menempatkan Juche Tower di Mt. Myohyang dan mengklaim transportasi publik gratis di DPRK), tidak dapat menjawab aturan regulasi lokal (seperti larangan bea cukai buku/materi cetak), serta **tidak menyertakan rujukan atau sitasi sumber dokumen**.
* **Grounded RAG System (Assistant `/assistant`):**
  * Memanfaatkan teknik *Retrieval-Augmented Generation* yang terhubung ke dokumen `original-Koryo_Tours_North_Korea_Guide_2019.pdf`.
  * **Keunggulan Utama:** Menyajikan jawaban yang sangat presisi hingga detail terintegrasi (seperti *Kwangbok Department Store*, penukaran mata uang lokal, jam buka toko, koleksi museum *International Friendship Exhibition* seperti bola basket Michael Jordan dan vodka Dennis Rodman, serta aturan bea cukai materi cetak) dan **dilengkapi badge sitasi resmi**.

### 2. Ringkasan Peningkatan Kualitas AI (AI Improvement Highlights)
1. **Pengurangan Halusinasi (*Zero-Hallucination Grounding*):** Sistem RAG berhasil mengeliminasi kesalahan lokasi dan asumsi tidak akurat yang dihasilkan oleh Base-Model murni dengan membatasi ruang lingkup jawaban pada dokumen terverifikasi.
2. **Keakuratan Regulasi & Domain Spesifik:** RAG mampu menyajikan fakta proteksi hukum dan aturan bea cukai lokal yang sensitif dan tidak tersedia pada data pelatihan LLM umum.
3. **Transparansi & Akuntabilitas (*Verifiable Source Citation*):** Pengguna dapat memverifikasi kebenaran setiap informasi karena jawaban RAG secara otomatis melampirkan bukti sitasi dokumen sumber (`original-Koryo_Tours_North_Korea_Guide_2019.pdf`).
