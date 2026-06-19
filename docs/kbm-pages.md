# KBM Pages Documentation

KBM (Kode Barang Master) adalah kumpulan halaman master data yang digunakan untuk mengelola data referensi produksi seperti grade, barang, mesin, supplier, shift, dan dimensi batang.

---

## Daftar Halaman

| Halaman | Route | Tipe | Menu Name |
|---------|-------|------|-----------|
| KBM Grade ST Susun | `/dashboard/kbm-grade-st-susun` | KbmGrade | `WEB_KBM_GRADE_ST_SUSUN` |
| KBM Grade ST Batang | `/dashboard/kbm-grade-st-batang` | KbmGrade | `WEB_KBM_GRADE_ST_BATANG` |
| KBM Barang | `/dashboard/kbm-barang` | KbmGrade | `WEB_KBM_BARANG` |
| KBM Department | `/dashboard/kbm-department` | KbmGrade | `WEB_KBM_DEPARTMENT` |
| KBM Gudang | `/dashboard/kbm-gudang` | KbmGrade | `WEB_KBM_GUDANG` |
| KBM Lamina | `/dashboard/kbm-lamina` | KbmGrade | `WEB_KBM_LAMINA` |
| KBM Mesin | `/dashboard/kbm-mesin` | KbmGrade | `WEB_KBM_MESIN` |
| KBM Mitra Bisnis | `/dashboard/kbm-mitra-bisnis` | KbmGrade | `WEB_KBM_MITRA_BISNIS` |
| KBM Supplier | `/dashboard/kbm-supplier` | KbmGrade | `WEB_KBM_SUPPLIER` |
| KBM Shift | `/dashboard/kbm-shift` | KbmGrade | `WEB_KBM_SHIFT` |
| KBM Panjang | `/dashboard/kbm-panjang` | KbmBatangManual | `WEB_KBM_PANJANG` |
| KBM Lebar | `/dashboard/kbm-lebar` | KbmBatangManual | `WEB_KBM_LEBAR` |
| KBM Tebal | `/dashboard/kbm-tebal` | KbmBatangManual | `WEB_KBM_TEBAL` |
| KBM No Palet | `/dashboard/kbm-no-palet` | KbmBatangManual | `WEB_KBM_NO_PALET` |

---

## Arsitektur: Dua Tipe Halaman

### Tipe 1: KbmGrade (berbasis konfigurasi)

Digunakan untuk 10 halaman yang memiliki fitur lengkap: list, detail, create, dan edit.

**Modul:** `src/modules/dashboard/kbm-grade/`

Setiap halaman hanya mendefinisikan objek konfigurasi dan menyerahkan semua logika ke modul `kbm-grade` yang sudah ada:

```typescript
const config: KbmGradeConfig = {
  basePath: "/dashboard/kbm-barang",
  gradeType: "BARANG",
  title: "KBM Barang",
  translationNamespace: "kbm-barang",
};
```

**Sub-route yang tersedia di setiap halaman KbmGrade:**

| Path | Keterangan |
|------|-----------|
| `/dashboard/kbm-{name}` | Halaman list (tabel) |
| `/dashboard/kbm-{name}/create` | Form tambah item baru |
| `/dashboard/kbm-{name}/edit/[id]` | Form edit item |
| `/dashboard/kbm-{name}/[id]` | Halaman detail item |

---

### Tipe 2: KbmBatangManual (dimensi batang)

Digunakan untuk 4 halaman dimensi batang: Panjang, Lebar, Tebal, dan No Palet. Halaman ini lebih sederhana — hanya list dengan modal add/edit/delete inline.

**Modul:** `src/modules/dashboard/kbm-batang-manual/`

```typescript
// Contoh: src/pages/dashboard/kbm-panjang/index.tsx
<KbmBatangManualPage attributeType="KBM_PANJANG" />
```

Tidak ada sub-route (create/edit/detail) karena operasi dilakukan lewat modal di halaman yang sama.

---

## Detail Setiap Halaman

### KBM Grade ST Susun

- **Route:** `/dashboard/kbm-grade-st-susun`
- **gradeType:** `SUSUN`
- **Deskripsi:** Master data grade untuk produk yang disusun. Berisi informasi grade lengkap termasuk dimensi (lebar, panjang, tebal), standar volume, dan kode grade.
- **Atribut yang ditampilkan:** G_KD_GRADE (Kode Grade), G_NM_GRADE (Nama Grade), G_LEBAR (Lebar mm), G_PANJANG (Panjang mm), G_TEBAL (Tebal mm), G_STD_SUSUN (Std Susun), G_STD_VOL (Std Vol m³), G_VOL (Vol m³)

---

### KBM Grade ST Batang

- **Route:** `/dashboard/kbm-grade-st-batang`
- **gradeType:** `BATANG`
- **Deskripsi:** Master data grade untuk produk batang. Berbeda dengan SUSUN, halaman ini hanya menampilkan kolom kode grade (G_KD_GRADE) karena data dimensi dikelola secara terpisah.
- **Atribut yang ditampilkan:** G_KD_GRADE (Kode Grade)

> **Catatan:** SUSUN dan BATANG menggunakan kategori yang sama di backend, dibedakan lewat atribut `G_TYPE`.

---

### KBM Barang

- **Route:** `/dashboard/kbm-barang`
- **gradeType:** `BARANG`
- **Deskripsi:** Master data barang/produk. Berisi kode dan nama barang yang digunakan sebagai referensi di proses produksi.
- **Atribut yang ditampilkan:** KD_BRG (Kode Barang), NM_BRG (Nama Barang)

---

### KBM Department

- **Route:** `/dashboard/kbm-department`
- **gradeType:** `DEPARTMENT`
- **Deskripsi:** Master data departemen. Digunakan untuk mengategorikan area kerja atau divisi produksi.
- **Atribut yang ditampilkan:** KD_DEP (Kode Departemen), NM_DEP (Nama Departemen)

---

### KBM Gudang

- **Route:** `/dashboard/kbm-gudang`
- **gradeType:** `GUDANG`
- **Deskripsi:** Master data gudang. Berisi daftar gudang yang tersedia untuk penyimpanan produk.
- **Atribut yang ditampilkan:** KD_GUDANG (Kode Gudang), NAMA_GUDANG (Nama Gudang)

---

### KBM Lamina

- **Route:** `/dashboard/kbm-lamina`
- **gradeType:** `LAMINA`
- **Deskripsi:** Master data untuk produk lamina. Berisi referensi data yang digunakan dalam proses produksi lamina.
- **Namespace terjemahan:** `kbm-lamina`

---

### KBM Mesin

- **Route:** `/dashboard/kbm-mesin`
- **gradeType:** `MESIN`
- **Deskripsi:** Master data mesin produksi. Berisi nomor dan nama mesin yang digunakan dalam proses produksi.
- **Atribut yang ditampilkan:** NO_MESIN (Nomor Mesin), NM_MESIN (Nama Mesin)

---

### KBM Mitra Bisnis

- **Route:** `/dashboard/kbm-mitra-bisnis`
- **gradeType:** `MITRA_BISNIS`
- **Deskripsi:** Master data mitra bisnis (vendor/partner). Berisi kode dan nama mitra bisnis.
- **Atribut yang ditampilkan:** KD_MB (Kode Mitra Bisnis), NM_MB (Nama Mitra Bisnis)

---

### KBM Supplier

- **Route:** `/dashboard/kbm-supplier`
- **gradeType:** `SUPPLIER`
- **Deskripsi:** Master data supplier bahan baku. Berisi kode dan nama supplier.
- **Atribut yang ditampilkan:** KD_SUPPLIER (Kode Supplier), NM_SUPPLIER (Nama Supplier)
- **Namespace terjemahan:** `kbm-supplier`

---

### KBM Shift

- **Route:** `/dashboard/kbm-shift`
- **gradeType:** `SHIFT`
- **Deskripsi:** Master data shift kerja. Berisi kode dan nama shift yang digunakan dalam penjadwalan produksi.
- **Atribut yang ditampilkan:** KD_SHIFT (Kode Shift), NM_SHIFT (Nama Shift)
- **Namespace terjemahan:** `kbm-shift`

---

### KBM Panjang

- **Route:** `/dashboard/kbm-panjang`
- **attributeType:** `KBM_PANJANG`
- **Deskripsi:** Master data dimensi panjang batang (dalam satuan mm). Nilainya berupa angka.
- **Tipe nilai:** `number`

---

### KBM Lebar

- **Route:** `/dashboard/kbm-lebar`
- **attributeType:** `KBM_LEBAR`
- **Deskripsi:** Master data dimensi lebar batang (dalam satuan mm). Nilainya berupa angka.
- **Tipe nilai:** `number`

---

### KBM Tebal

- **Route:** `/dashboard/kbm-tebal`
- **attributeType:** `KBM_TEBAL`
- **Deskripsi:** Master data dimensi tebal batang (dalam satuan mm). Nilainya berupa angka.
- **Tipe nilai:** `number`

---

### KBM No Palet

- **Route:** `/dashboard/kbm-no-palet`
- **attributeType:** `KBM_NO_PALET`
- **Deskripsi:** Master data nomor palet. Nilainya berupa teks.
- **Tipe nilai:** `text`

---

## Struktur Modul

### `src/modules/dashboard/kbm-grade/`

Modul utama yang dipakai bersama oleh semua halaman KbmGrade.

```
kbm-grade/
├── KbmGrade.tsx                    # Komponen utama (tabel list)
├── KbmGradeConfigContext.tsx       # Context provider + KbmGradeType + KbmGradeConfig
├── KbmGradeFormPage.tsx            # Halaman form (create & edit via KbmItem)
├── KbmGradeHeader.tsx              # Header + tombol aksi
├── KbmGradeItem.tsx                # Baris tabel
├── useKbmGrade.tsx                 # Data fetching + context provider
├── index.ts                        # Barrel export
├── components/
│   ├── KbmGradeImportModal.tsx     # Modal import CSV
│   └── KbmGradeTemplateExportModal.tsx  # Modal export template
├── edit-kbm-grade/
│   ├── useEditKbmGrade.tsx         # Hook edit untuk grade type SUSUN/BATANG
│   └── index.ts
├── store/
│   ├── KbmGradeStore.tsx           # Zustand store (pagination + filter)
│   ├── filterSlice.ts
│   └── paginationSlice.ts
└── utils/
    ├── attributeUtils.ts           # KBM_GRADE_ATTRIBUTE_MAP + helper functions
    └── duplicateUtils.ts           # Utilitas deteksi duplikat
```

### `src/modules/dashboard/kbm-batang-manual/`

Modul untuk halaman dimensi batang (Panjang, Lebar, Tebal, No Palet).

```
kbm-batang-manual/
├── KbmBatangManual.tsx         # Komponen utama
├── KbmBatangManualHeader.tsx   # Header + tombol Add
├── KbmBatangManualItem.tsx     # Baris tabel
├── KbmBatangManualModalAdd.tsx # Modal tambah
├── KbmBatangManualModalDelete.tsx
├── KbmBatangManualModalEdit.tsx
├── useKbmBatangManual.tsx      # Data fetching + context
├── constants.ts                # KBM_ATTRIBUTE_NAMES, KBM_ATTRIBUTE_LABELS, dll
└── index.ts
```

### `src/modules/dashboard/kbm-item/`

Modul form untuk create/edit item KbmGrade (bukan grade type SUSUN/BATANG).

```
kbm-item/
├── KbmItemFormPage.tsx         # Halaman form utama
├── KbmItemImportModal.tsx      # Modal import
├── KbmItemTemplateExportModal.tsx
├── index.ts
├── components/
│   └── KbmItemAttributesCard.tsx  # Card atribut dalam form
└── edit-kbm-item/
    ├── useEditKbmItem.tsx
    └── index.ts
```

---

## Menambah Halaman KBM Baru

### Untuk tipe KbmGrade

1. **Tambah `KbmGradeType`** di `src/modules/dashboard/kbm-grade/KbmGradeConfigContext.tsx`
2. **Tambah atribut** di `KBM_GRADE_ATTRIBUTE_MAP` dalam `attributeUtils.ts`
3. **Tambah `MenuName`** di `src/types/menu.ts` (enum + MENU_ROUTE_MAP)
4. **Tambah ke `MENU_CONFIG`** di `src/lib/menu-utils.ts` (urutan alfabetis)
5. **Tambah namespace** ke `next-i18next.config.js`
6. **Buat file terjemahan** `public/locales/en/kbm-{name}.json` dan `id/kbm-{name}.json`
7. **Tambah sidebar key** di `public/locales/en/common.json` dan `id/common.json` (urutan alfabetis)
8. **Buat halaman:**
   - `src/pages/dashboard/kbm-{name}/index.tsx`
   - `src/pages/dashboard/kbm-{name}/create/index.tsx`
   - `src/pages/dashboard/kbm-{name}/edit/[id].tsx`
   - `src/pages/dashboard/kbm-{name}/[id]/index.tsx`

### Untuk tipe KbmBatangManual

1. **Tambah ke `KbmAttributeType`** di `src/modules/dashboard/kbm-batang-manual/constants.ts`
2. **Tambah ke `KBM_ATTRIBUTE_NAMES`**, `KBM_ATTRIBUTE_LABELS`, `KBM_ATTRIBUTE_VALUE_TYPES`
3. **Tambah `MenuName`** di `src/types/menu.ts`
4. **Tambah ke `MENU_CONFIG`** di `src/lib/menu-utils.ts`
5. **Buat halaman:** `src/pages/dashboard/kbm-{name}/index.tsx` dengan `<KbmBatangManualPage attributeType="KBM_{NAME}" />`

---

## Catatan Penting

- Semua key di `MENU_CONFIG` dan objek di `common.json` **harus diurutkan secara alfabetis** (ESLint rule `sort-keys-fix`).
- Halaman dengan route dinamis (`edit/[id]`, `[id]`) menggunakan `getServerSideProps`, bukan `getStaticProps`.
- Grade type `SUSUN` dan `BATANG` berbagi satu kategori SKU di backend, dibedakan lewat atribut internal `G_TYPE`.
- Kolom yang ditampilkan di tabel bergantung pada atribut yang dikembalikan API untuk masing-masing `gradeType`.
