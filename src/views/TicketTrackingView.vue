<script setup>
import { nextTick, reactive, ref } from 'vue'
import ManagerSidebar from '../components/ManagerSidebar.vue'
import TicketFormField from '../components/TicketFormField.vue'
import { trackTicket } from '../services/ticketService.js'

const SERVICE_LABELS = {
  'network-repair': 'Perbaikan jaringan',
  subdomain: 'Pengajuan subdomain',
  'laboratory-loan': 'Peminjaman laboratorium',
  'system-request': 'Pengajuan sistem',
  'network-installation': 'Pemasangan jaringan baru',
  'peripheral-repair': 'Perbaikan perangkat periferal',
}

const DETAIL_LABELS = {
  location: 'Lokasi',
  startedAt: 'Waktu mulai gangguan',
  affectedUsers: 'Pengguna terdampak',
  relatedDevice: 'Perangkat terkait',
  subdomainName: 'Nama subdomain',
  purpose: 'Tujuan',
  unit: 'Unit pengusul',
  server: 'Server atau IP',
  laboratory: 'Laboratorium',
  schedule: 'Tanggal dan waktu',
  participants: 'Jumlah peserta',
  activity: 'Kegiatan',
  problem: 'Masalah',
  users: 'Calon pengguna',
  target: 'Target penggunaan',
  coverage: 'Cakupan area',
  deviceType: 'Jenis perangkat',
  assetNumber: 'Nomor aset',
  damage: 'Kerusakan',
}

const STATUS_CLASSES = {
  Baru: 'status-badge--new',
  'Dalam Antrean': 'status-badge--queue',
  Diproses: 'status-badge--process',
  Selesai: 'status-badge--done',
  Ditolak: 'status-badge--rejected',
  Dibatalkan: 'status-badge--cancelled',
}

const form = reactive({ publicNumber: null, nim: null })
const errors = reactive({})
const ticket = ref(null)
const submissionError = ref('')
const isLoading = ref(false)

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
  submissionError.value = ''
}

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value)) + ' WIB'
}

function detailLabel(key) {
  return DETAIL_LABELS[key] ?? key
}

async function submitTracking() {
  clearErrors()
  ticket.value = null

  const publicNumber = form.publicNumber?.trim().toUpperCase()
  const nim = form.nim?.trim()

  if (!publicNumber) errors.publicNumber = 'Masukkan nomor tiket.'
  else if (!/^TKT-[A-F0-9]{10}$/.test(publicNumber)) errors.publicNumber = 'Gunakan format nomor tiket TKT-XXXXXXXXXX.'

  if (!nim) errors.trackingNim = 'Masukkan NIM Anda.'
  else if (!/^\d{1,10}$/.test(nim)) errors.trackingNim = 'Masukkan NIM berupa angka tanpa spasi.'

  if (Object.keys(errors).length) {
    await nextTick()
    document.getElementById(Object.keys(errors)[0])?.focus()
    return
  }

  isLoading.value = true
  try {
    ticket.value = await trackTicket({ publicNumber, nim })
  } catch (error) {
    submissionError.value = error instanceof Error
      ? error.message
      : 'Tiket belum dapat dilacak. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="dashboard-shell tracking-page">
    <ManagerSidebar active-item="Lacak Tiket" />
    <main class="tracking-main">
      <header class="tracking-intro">
        <h1>Lacak tiket</h1>
        <p>Masukkan nomor tiket dan NIM yang digunakan saat pengajuan untuk melihat status terbaru.</p>
      </header>

      <div class="tracking-layout">
        <form
          class="tracking-form card"
          novalidate
          @submit.prevent="submitTracking"
        >
          <div>
            <h2>Informasi pelacakan</h2>
            <p>Kedua data harus cocok. Kami tidak akan menampilkan informasi tiket jika salah satunya berbeda.</p>
          </div>

          <TicketFormField
            id="publicNumber"
            v-model="form.publicNumber"
            label="Nomor tiket"
            placeholder="TKT-XXXXXXXXXX"
            autocomplete="off"
            :error="errors.publicNumber"
            helper="Nomor ini ditampilkan setelah pengajuan berhasil."
            required
          />
          <TicketFormField
            id="trackingNim"
            v-model="form.nim"
            label="NIM"
            placeholder="Masukkan NIM Anda"
            inputmode="numeric"
            autocomplete="off"
            :error="errors.trackingNim"
            helper="Gunakan NIM yang sama dengan pengajuan tiket."
            required
          />

          <p
            v-if="submissionError"
            class="tracking-error"
            role="alert"
          >
            {{ submissionError }}
          </p>

          <button
            class="tracking-button"
            type="submit"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Mencari tiket...' : 'Lacak Tiket' }}
          </button>
        </form>

        <aside class="tracking-note card">
          <h2>Jaga data pelacakan Anda</h2>
          <p>Nomor tiket dan NIM digunakan bersama untuk melindungi informasi pengajuan.</p>
          <ul>
            <li>Jangan membagikan nomor tiket di ruang publik.</li>
            <li>Periksa kembali huruf dan angka sebelum mencari.</li>
            <li>Percobaan berulang akan dibatasi sementara.</li>
          </ul>
        </aside>
      </div>

      <section
        v-if="ticket"
        class="ticket-result card"
        aria-labelledby="ticket-result-title"
      >
        <div class="ticket-result__heading">
          <div>
            <span>{{ ticket.publicNumber }}</span>
            <h2 id="ticket-result-title">
              {{ ticket.title }}
            </h2>
          </div>
          <span
            class="status-badge"
            :class="STATUS_CLASSES[ticket.status]"
          >
            {{ ticket.status }}
          </span>
        </div>

        <dl class="ticket-meta">
          <div><dt>Jenis Layanan</dt><dd>{{ SERVICE_LABELS[ticket.serviceType] ?? ticket.serviceType }}</dd></div>
          <div><dt>Urgensi</dt><dd>{{ ticket.urgency === 'critical-network' ? 'Gangguan jaringan kritis' : 'Normal' }}</dd></div>
          <div><dt>Dibuat</dt><dd>{{ formatDate(ticket.createdAt) }}</dd></div>
          <div><dt>Lampiran</dt><dd>{{ ticket.attachmentCount }} file</dd></div>
        </dl>

        <div class="ticket-summary">
          <h3>Ringkasan pengajuan</h3>
          <p>{{ ticket.description }}</p>
        </div>

        <div
          v-if="Object.keys(ticket.serviceDetails ?? {}).length"
          class="ticket-summary"
        >
          <h3>Informasi layanan</h3>
          <dl class="ticket-details">
            <div
              v-for="(value, key) in ticket.serviceDetails"
              :key="key"
            >
              <dt>{{ detailLabel(key) }}</dt>
              <dd>{{ value }}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.tracking-page { min-height: 100vh; }
.tracking-main { width: 100%; max-width: none; padding: var(--space-8) var(--space-4) 40px; }
.tracking-intro, .tracking-layout, .ticket-result { width: min(100%, 960px); margin-inline: auto; }
.tracking-intro { display: grid; gap: var(--space-2); margin-bottom: var(--space-6); }
.tracking-intro h1 { font-size: 28px; line-height: 36px; }
.tracking-intro p, .tracking-form > div > p, .tracking-note p, .tracking-note li { color: var(--color-text-secondary); font-size: 14px; line-height: 20px; }
.tracking-layout { display: grid; gap: var(--space-4); align-items: start; }
.tracking-form { display: grid; gap: var(--space-4); }
.tracking-form > div { display: grid; gap: var(--space-1); }
.tracking-form h2, .tracking-note h2, .ticket-result h2 { font-size: 18px; line-height: 26px; }
.tracking-button { min-height: 44px; border: 1px solid var(--color-primary-700); border-radius: var(--radius-md); color: #fff; font-size: 14px; font-weight: 600; background: var(--color-primary-700); }
.tracking-button:hover { background: var(--color-primary-600); }
.tracking-button:disabled { cursor: not-allowed; opacity: .65; }
.tracking-error { padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); color: var(--color-danger); background: #fdeaea; font-size: 14px; line-height: 20px; }
.tracking-note { display: grid; gap: var(--space-3); }
.tracking-note ul { display: grid; gap: var(--space-2); padding-left: var(--space-5); margin: 0; }
.ticket-result { display: grid; gap: var(--space-6); margin-top: var(--space-6); }
.ticket-result__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); }
.ticket-result__heading > div { display: grid; gap: var(--space-1); }
.ticket-result__heading > div > span { color: var(--color-primary-700); font-size: 14px; line-height: 20px; font-weight: 600; }
.ticket-meta, .ticket-details { display: grid; gap: var(--space-3); margin: 0; }
.ticket-meta > div, .ticket-details > div { min-width: 0; }
.ticket-meta dt, .ticket-details dt { color: var(--color-text-muted); font-size: 12px; line-height: 18px; }
.ticket-meta dd, .ticket-details dd { margin: var(--space-1) 0 0; color: var(--color-text-primary); font-size: 14px; line-height: 20px; overflow-wrap: anywhere; }
.ticket-summary { display: grid; gap: var(--space-2); }
.ticket-summary h3 { font-size: 16px; line-height: 24px; }
.ticket-summary > p { color: var(--color-text-secondary); font-size: 14px; line-height: 22px; white-space: pre-wrap; }
@media (min-width: 768px) {
  .tracking-main { padding-inline: var(--space-6); }
  .tracking-layout { grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr); }
  .ticket-meta, .ticket-details { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .tracking-main { padding-inline: var(--space-8); }
}
@media (max-width: 520px) {
  .ticket-result__heading { align-items: flex-start; flex-direction: column; }
  .tracking-button { width: 100%; }
}
</style>
