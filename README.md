# Productivity OS

Sistem produktiviti peribadi — matlamat, sasaran, KPI, tabiat 10+2x, dan semakan mingguan.
Berasaskan *12 Steps to Achieve Maximum Productivity*.

Buka: **https://mnurmustaqim94-netizen.github.io/productivity-os/**

---

## 8 tab

| Tab | Fungsi |
|---|---|
| **Hari Ini** | Log 60 saat: deep work, gangguan, tugas impak tinggi, buka app, tidur + tabiat |
| **Matlamat** | Jangka panjang (5 kategori), WHY, cara ukur, tarikh akhir |
| **Sasaran** | 30 / 60 / 90 hari, terikat pada satu matlamat |
| **Aplikasi** | Senarai app + tag Deep Work / Neutral / Gangguan + had minit/hari |
| **KPI** | 6 KPI auto-kira, status RAG, sparkline 30 hari, sasaran + perubahan minimum |
| **Tabiat** | Formula 10+2x: streak, hari tercicir, auto gagal jika x > 5 |
| **Minda** | 3 prinsip + log reframe “Macam mana aku boleh buat?” |
| **Semakan** | Semakan Ahad 15 min + denda/ganjaran RM + ringkasan auto |

Tab **KPI** dan **Semakan** boleh dicetak: tekan **Cetak / PDF** → semua seksyen disusun untuk A4.

## KPI & perubahan minimum

| KPI | Sasaran | Perubahan minimum |
|---|---|---|
| Kadar Tugas Impak Tinggi | ≥ 80% | +10 mata / minggu |
| Deep Work | ≥ 1.5 jam/hari | +15 min / minggu |
| Masa Gangguan | ≤ 90 min/hari | −10 min / minggu |
| Konsistensi Tabiat | 100% | tiada hari tercicir |
| Kelajuan Siap Tugasan | ≤ 3 hari | −0.5 hari / minggu |
| Milestone Sasaran | ≥ 1 / minggu | 1 milestone / minggu |

**Minggu pertama = baseline.** Jangan nilai diri sehingga ada 7 hari data.

## Pasang di telefon (Android)

1. Buka URL di atas dalam **Chrome**.
2. Menu ⋮ → **Add to Home screen** / **Install app**.
3. Ikon muncul seperti app biasa, boleh guna offline selepas lawatan pertama.

## Pasang di PC

Buka URL → ikon **Install** di bar alamat Chrome (atau bookmark sahaja).

## Data & backup

- Data disimpan dalam **localStorage browser** — tidak dihantar ke mana-mana server.
- **Telefon dan PC simpan data berasingan.** Untuk pindah:
  1. **Backup** di peranti A → fail `productivity-os-backup-YYYY-MM-DD.json`
  2. Hantar fail ke peranti B (WhatsApp/Drive/OneDrive)
  3. **Pulih** di peranti B → pilih fail itu
- Buat backup setiap Ahad selepas semakan mingguan.

> Jangan gunakan **Clear browsing data → Cookies and site data** untuk laman ini, atau data akan hilang. Backup dahulu.

## Sumber data telefon

Android → **Settings → Digital Wellbeing** (masa skrin per app, bilangan buka).
Untuk blok automatik: **AppBlock** atau **StayFree**.
PC: **RescueTime** (auto) + **LeechBlock NG** (blok laman web).

## Fail

```
index.html      app lengkap (HTML + CSS + JS, tiada CDN)
manifest.json   metadata PWA
sw.js           service worker (offline)
icon-192.png    ikon
icon-512.png    ikon
tools/mkicons.js  penjana ikon (Node, pilihan)
```
