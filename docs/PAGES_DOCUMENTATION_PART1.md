# Pages Documentation (Part 1)

Dokumentasi awal untuk beberapa halaman prioritas yang sebelumnya belum terdokumentasi.

## Ringkasan

| Halaman | Route | Modul Utama | Rendering |
|---------|-------|-------------|-----------|
| Sign Up | `/sign-up` | `src/modules/auth/SignUp` | SSG (`getStaticProps`) |
| Email Verification | `/sign-up/[email]` | `src/modules/auth/VericationEmail` | SSR (`getServerSideProps`) |
| Reset Password | `/reset-password` | `src/modules/auth/ResetPassword` | SSG (`getStaticProps`) |
| Reset Password Confirmation | `/reset-password-confirmation/[email]` | `src/modules/auth/ResetPasswordOTP` | SSR (`getServerSideProps`) |
| Verification Access | `/verification-access` | `src/modules/auth/VerificationAccess` | SSG (`getStaticProps`) |
| Overview Dashboard | `/dashboard/overview` | `src/modules/dashboard/overview` | SSG (`getStaticProps`) |
| Inventory Dashboard | `/dashboard/inventory` | `src/modules/dashboard/inventory` | SSG (`getStaticProps`) |
| Inbound Dashboard | `/dashboard/inbound` | `src/modules/dashboard/inbound` | SSG (`getStaticProps`) |
| Create Inbound | `/dashboard/inbound/create` | `src/modules/dashboard/inbound/create/CreateInbound` | SSG (`getStaticProps`) |
| Inbound Detail | `/dashboard/inbound/[ledger_id]` | `src/modules/dashboard/detail-inbound-outbound` | SSR (`getServerSideProps`) |
| Outbound Dashboard | `/dashboard/outbound` | `src/modules/dashboard/outbound` | SSG (`getStaticProps`) |
| Create Outbound | `/dashboard/outbound/create` | `src/modules/dashboard/outbound/create/CreateOutbound` | SSG (`getStaticProps`) |
| Outbound Detail | `/dashboard/outbound/[ledger_id]` | `src/modules/dashboard/detail-inbound-outbound` | SSR (`getServerSideProps`) |
| Stock Audit | `/dashboard/stock-audit` | `src/modules/dashboard/stock-audit/StockAudit` | SSG (`getStaticProps`) |
| Stock Audit Detail | `/dashboard/stock-audit/[storeId]/[audit-id]` | `src/modules/dashboard/stock-audit/detail-stock-audit/DetailStockAudit` | SSR (`getServerSideProps`) |
| API Key Management | `/dashboard/api-key` | `src/modules/dashboard/api-key` | SSG (`getStaticProps`) |

## Detail Halaman

### 1) Sign Up

- Route: `/sign-up`
- Page file: `src/pages/sign-up.tsx`
- Layout: `GeneralLayout`
- Modul utama: `SignUpPage`
- i18n namespace: `common`, `auth`
- SEO title: `Create Account`
- Catatan: halaman public untuk registrasi akun.

### 2) Email Verification

- Route: `/sign-up/[email]`
- Page file: `src/pages/sign-up/[email].tsx`
- Layout: `GeneralLayout`
- Modul utama: `VerificationEmailPage`
- i18n namespace: `common`, `auth`
- SEO title: `Email Verification`
- Catatan: `noindex` aktif, dipakai untuk konfirmasi email setelah registrasi.

### 3) Reset Password

- Route: `/reset-password`
- Page file: `src/pages/reset-password.tsx`
- Layout: `GeneralLayout`
- Modul utama: `ResetPasswordPage`
- i18n namespace: `common`, `auth`
- SEO title: `Reset Password`
- Catatan: `noindex` aktif, form awal reset password.

### 4) Reset Password Confirmation

- Route: `/reset-password-confirmation/[email]`
- Page file: `src/pages/reset-password-confirmation/[email].tsx`
- Layout: `GeneralLayout`
- Modul utama: `ResetPasswordOTPPage`
- i18n namespace: `common`, `auth`
- SEO title: `Password Reset Confirmation`
- Catatan: `noindex` aktif, validasi OTP reset password.

### 5) Verification Access

- Route: `/verification-access`
- Page file: `src/pages/verification-access.tsx`
- Layout: `GeneralLayout`
- Modul utama: `VerificationAccessPage`
- i18n namespace: `common`, `auth`
- SEO title: `Account Verification`
- Catatan: `noindex` aktif, validasi akses akun.

### 6) Overview Dashboard

- Route: `/dashboard/overview`
- Page file: `src/pages/dashboard/overview/index.tsx`
- Layout: `DashboardLayout`
- Modul utama: `OverviewPage`
- i18n namespace: `overview`, `common`
- SEO title: `Inventory Overview`
- Catatan: ringkasan KPI, trend, dan kondisi stok.

### 7) Inventory Dashboard

- Route: `/dashboard/inventory`
- Page file: `src/pages/dashboard/inventory/index.tsx`
- Layout: `DashboardLayout`
- Modul utama: `InventoryWrapper`
- i18n namespace: `common`, `inventory`
- SEO title: `Inventory Dashboard`
- Catatan: monitoring stok lintas store dan SKU.

### 8) Inbound Dashboard

- Route: `/dashboard/inbound`
- Page file: `src/pages/dashboard/inbound/index.tsx`
- Layout: `DashboardLayout`
- Modul utama: `InboundPage`
- i18n namespace: `common`, `inbound`
- SEO title: `Inbound Management`
- Catatan: daftar transaksi inbound.

### 9) Create Inbound

- Route: `/dashboard/inbound/create`
- Page file: `src/pages/dashboard/inbound/create.tsx`
- Layout: `DashboardLayout`
- Modul utama: `CreateInbound`
- i18n namespace: `common`, `inbound`
- SEO title: `Create Inbound`
- Catatan: membuat transaksi inbound baru.

### 10) Inbound Detail

- Route: `/dashboard/inbound/[ledger_id]`
- Page file: `src/pages/dashboard/inbound/[ledger_id].tsx`
- Layout: `DashboardLayout`
- Modul utama: `DetailInboundOutbound` + `DetailInboundOutboundProvider`
- i18n namespace: `common`, `detail-inbound-outbound`, `ledger`, `verification`
- SEO title: `Inbound Detail`
- Catatan: `noindex` aktif, menampilkan detail per ledger inbound.

### 11) Outbound Dashboard

- Route: `/dashboard/outbound`
- Page file: `src/pages/dashboard/outbound/index.tsx`
- Layout: `DashboardLayout`
- Modul utama: `OutboundPage`
- i18n namespace: `common`, `outbound`
- SEO title: `Outbound Management`
- Catatan: daftar transaksi outbound.

### 12) Create Outbound

- Route: `/dashboard/outbound/create`
- Page file: `src/pages/dashboard/outbound/create.tsx`
- Layout: `DashboardLayout`
- Modul utama: `CreateOutbound`
- i18n namespace: `common`, `outbound`, `inbound`
- SEO title: `Create Outbound`
- Catatan: membuat transaksi outbound baru.

### 13) Outbound Detail

- Route: `/dashboard/outbound/[ledger_id]`
- Page file: `src/pages/dashboard/outbound/[ledger_id].tsx`
- Layout: `DashboardLayout`
- Modul utama: `DetailInboundOutboundPage` + `DetailInboundOutboundProvider`
- i18n namespace: `common`, `detail-inbound-outbound`, `ledger`, `verification`
- SEO title: `Outbound Detail`
- Catatan: `noindex` aktif, audit proses pick/pack/ship per ledger.

### 14) Stock Audit

- Route: `/dashboard/stock-audit`
- Page file: `src/pages/dashboard/stock-audit/index.tsx`
- Layout: `DashboardLayout`
- Modul utama: `StockAudit`
- i18n namespace: `common`, `stock-audit`
- SEO title: `Stock Audit`
- Catatan: daftar sesi audit stok.

### 15) Stock Audit Detail

- Route: `/dashboard/stock-audit/[storeId]/[audit-id]`
- Page file: `src/pages/dashboard/stock-audit/[storeId]/[audit-id].tsx`
- Layout: `DashboardLayout`
- Modul utama: `DetailStockAudit`
- i18n namespace: `common`, `stock-audit`, `verification`
- SEO title: `Stock Audit Detail`
- Catatan: `noindex` aktif, detail discrepancy dan hasil verifikasi audit.

### 16) API Key Management

- Route: `/dashboard/api-key`
- Page file: `src/pages/dashboard/api-key.tsx`
- Layout: `DashboardLayout`
- Modul utama: `ApiKeyPage` + `ApiKeyProvider`
- i18n namespace: `common`, `api-key`
- SEO title: `API Key Management`
- Catatan: manajemen create/rotate/revoke API key integrasi.
