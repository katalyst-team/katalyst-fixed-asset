# Pages With Special Logic / Hardcode Notes

Dokumentasi ini fokus ke halaman yang punya:
- logic khusus (conditional flow, provider dependency, route param, URL sync), atau
- hardcode tertentu (limit default, pagination size, polling interval, default filter, noindex).

## 1) Auth Flow Pages

### `/sign-up/[email]`
- Page: `src/pages/sign-up/[email].tsx`
- Logic khusus:
  - pakai `getServerSideProps` (SSR) agar route parameter email selalu fresh per request.
  - halaman verifikasi email dipisah dari form sign-up utama.
- Hardcode:
  - `SEO noindex` aktif.
  - namespace i18n fixed: `["common", "auth"]`.

### `/reset-password` dan `/reset-password-confirmation/[email]`
- Page: `src/pages/reset-password.tsx`, `src/pages/reset-password-confirmation/[email].tsx`
- Logic khusus:
  - split 2 langkah: request reset + OTP confirmation.
  - halaman OTP pakai SSR.
- Hardcode:
  - kedua halaman pakai `noindex`.
  - namespace i18n fixed `["common", "auth"]`.

### `/verification-access`
- Page: `src/pages/verification-access.tsx`
- Logic khusus:
  - jalur verifikasi akses terpisah dari login/sign-up.
- Hardcode:
  - `noindex` aktif.
  - namespace i18n fixed `["common", "auth"]`.

## Catatan

Dokumen ini sebelumnya mendokumentasikan modul inventory (overview,
inbound/outbound, stock audit, api-key) yang sudah dihapus dari repo
(commit `02b5cb4`). Pola halaman Fixed Assets yang aktif sekarang
(FaLayout, useFaModal, useFaPermission, FaQueryState, filter <-> URL
sync) didokumentasikan di `AGENTS.md`.
