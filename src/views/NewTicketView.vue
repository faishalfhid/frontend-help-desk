<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import ManagerSidebar from '../components/ManagerSidebar.vue'
import TicketFormField from '../components/TicketFormField.vue'
import { createTicket } from '../services/ticketService.js'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

const services = [
  { value: 'network-repair', label: 'Perbaikan jaringan' },
  { value: 'subdomain', label: 'Pengajuan subdomain' },
  { value: 'laboratory-loan', label: 'Peminjaman laboratorium' },
  { value: 'system-request', label: 'Pengajuan sistem' },
  { value: 'network-installation', label: 'Pemasangan jaringan baru' },
  { value: 'peripheral-repair', label: 'Perbaikan perangkat periferal' },
]

const serviceFields = {
  'network-repair': [
    { key: 'location', label: 'Lokasi', placeholder: 'Gedung Fakultas Sains, lantai 2', helper: 'Sebutkan gedung dan area.', required: true },
    { key: 'startedAt', label: 'Waktu mulai gangguan', placeholder: '22 Juli 2026, 08.00 WIB', helper: 'Perkiraan waktu pertama terjadi.', required: true },
    { key: 'affectedUsers', label: 'Pengguna terdampak', placeholder: 'Sekitar 45 mahasiswa dan 3 dosen', helper: 'Masukkan perkiraan jumlah.', required: true },
    { key: 'relatedDevice', label: 'Perangkat terkait', placeholder: 'Access point koridor lantai 2', helper: 'Opsional jika perangkat diketahui.', required: false },
  ],
  subdomain: [
    { key: 'subdomainName', label: 'Nama subdomain', placeholder: 'jurnal-fakultas', helper: 'Tuliskan nama tanpa alamat domain utama.', required: true },
    { key: 'purpose', label: 'Tujuan penggunaan', placeholder: 'Portal jurnal fakultas', helper: 'Jelaskan fungsi utama subdomain.', required: true },
    { key: 'unit', label: 'Unit pengusul', placeholder: 'Fakultas Sains', helper: 'Sebutkan fakultas, unit, atau program studi.', required: true },
    { key: 'server', label: 'Server atau IP', placeholder: 'Alamat server tujuan', helper: 'Isi jika server tujuan sudah tersedia.', required: false },
  ],
  'laboratory-loan': [
    { key: 'laboratory', label: 'Laboratorium', placeholder: 'Laboratorium Komputer 2', helper: 'Pilih laboratorium yang dibutuhkan.', required: true },
    { key: 'schedule', label: 'Tanggal dan waktu', placeholder: '25 Juli 2026, 09.00–12.00 WIB', helper: 'Tuliskan waktu mulai dan selesai.', required: true },
    { key: 'participants', label: 'Jumlah peserta', placeholder: '30 peserta', helper: 'Masukkan perkiraan jumlah peserta.', required: true },
    { key: 'activity', label: 'Kegiatan', placeholder: 'Pelatihan aplikasi akademik', helper: 'Jelaskan kegiatan secara singkat.', required: true },
  ],
  'system-request': [
    { key: 'problem', label: 'Masalah yang ingin diselesaikan', placeholder: 'Proses masih dilakukan secara manual', helper: 'Jelaskan kondisi saat ini.', required: true },
    { key: 'purpose', label: 'Tujuan sistem', placeholder: 'Memusatkan pencatatan kegiatan', helper: 'Jelaskan hasil yang diharapkan.', required: true },
    { key: 'users', label: 'Calon pengguna', placeholder: 'Pengelola fakultas dan dosen', helper: 'Sebutkan kelompok pengguna utama.', required: true },
    { key: 'target', label: 'Target penggunaan', placeholder: 'Semester ganjil 2026', helper: 'Tuliskan target waktu penggunaan.', required: false },
  ],
  'network-installation': [
    { key: 'location', label: 'Lokasi', placeholder: 'Gedung Fakultas Sains, lantai 2', helper: 'Sebutkan gedung dan area pemasangan.', required: true },
    { key: 'purpose', label: 'Tujuan pemasangan', placeholder: 'Mendukung ruang kelas baru', helper: 'Jelaskan kebutuhan koneksi.', required: true },
    { key: 'coverage', label: 'Cakupan area', placeholder: 'Empat ruang kelas dan satu koridor', helper: 'Sebutkan luas atau jumlah ruang.', required: true },
    { key: 'schedule', label: 'Jadwal yang diharapkan', placeholder: 'Agustus 2026', helper: 'Tuliskan perkiraan waktu pemasangan.', required: false },
  ],
  'peripheral-repair': [
    { key: 'deviceType', label: 'Jenis perangkat', placeholder: 'Mouse, keyboard, atau printer', helper: 'Sebutkan jenis perangkat.', required: true },
    { key: 'assetNumber', label: 'Nomor aset', placeholder: 'AST-TIPD-00123', helper: 'Isi nomor aset jika tersedia.', required: false },
    { key: 'damage', label: 'Kerusakan', placeholder: 'Perangkat tidak terdeteksi', helper: 'Jelaskan gejala kerusakan.', required: true },
    { key: 'location', label: 'Lokasi perangkat', placeholder: 'Laboratorium Komputer 2', helper: 'Sebutkan lokasi perangkat.', required: true },
  ],
}

const form = reactive({
  username: null,
  studentId: null,
  service: null,
  urgency: null,
  title: null,
  description: null,
  specific: {},
})

const errors = reactive({})
const selectedFiles = ref([])
const attachmentInput = ref(null)
const fileError = ref('')
const successMessage = ref('')
const submissionError = ref('')
const isSubmitting = ref(false)
const selectedService = computed(() => services.find((service) => service.value === form.service))
const activeServiceFields = computed(() => serviceFields[form.service] ?? [])

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
  successMessage.value = ''
  submissionError.value = ''
}

function validateFiles(files) {
  if (files.length > 3) return 'Lampiran maksimal tiga file.'
  if (files.some((file) => !ALLOWED_FILE_TYPES.includes(file.type))) return 'Gunakan file PDF, JPG, atau PNG.'
  if (files.some((file) => file.size >= MAX_FILE_SIZE)) return 'Ukuran setiap file harus kurang dari 5 MB.'
  return ''
}

function handleFiles(event) {
  const files = Array.from(event.target.files ?? [])
  fileError.value = validateFiles(files)
  selectedFiles.value = fileError.value ? [] : files
}

function removeFile(index) {
  selectedFiles.value = selectedFiles.value.filter((_, fileIndex) => fileIndex !== index)
}

async function submitForm() {
  clearErrors()
  if (!form.username?.trim()) errors.username = 'Masukkan username Anda.'
  if (!form.studentId?.trim()) errors.studentId = 'Masukkan NIM Anda.'
  if (!form.service) errors.service = 'Pilih jenis layanan.'
  if (!form.urgency) errors.urgency = 'Pilih urgensi pengajuan.'
  if (form.urgency === 'critical-network' && form.service !== 'network-repair') {
    errors.urgency = 'Urgensi kritis hanya tersedia untuk perbaikan jaringan.'
  }
  if (!form.title?.trim()) errors.title = 'Masukkan judul tiket.'
  if (!form.description?.trim()) errors.description = 'Jelaskan kebutuhan atau gangguan yang dialami.'

  activeServiceFields.value.forEach((field) => {
    if (field.required && !String(form.specific[field.key] ?? '').trim()) {
      errors[field.key] = `Masukkan ${field.label.toLowerCase()}.`
    }
  })

  if (Object.keys(errors).length) {
    await nextTick()
    document.getElementById(Object.keys(errors)[0])?.focus()
    return
  }
  if (fileError.value) {
    document.getElementById('attachments')?.focus()
    return
  }

  isSubmitting.value = true
  try {
    const ticket = await createTicket({
      username: form.username.trim(),
      studentId: form.studentId.trim(),
      serviceType: form.service,
      urgency: form.urgency,
      title: form.title.trim(),
      description: form.description.trim(),
      serviceDetails: { ...form.specific },
      attachments: [...selectedFiles.value],
    })

    clearFormValues()
    successMessage.value = `Tiket ${ticket.publicNumber} berhasil dibuat. Simpan nomor tiket ini untuk melacak pengajuan Anda.`
  } catch (error) {
    submissionError.value = error instanceof Error
      ? error.message
      : 'Tiket belum dapat dikirim. Silakan coba lagi.'
  } finally {
    isSubmitting.value = false
  }
}

function clearFormValues() {
  form.username = null
  form.studentId = null
  form.service = null
  form.urgency = null
  form.title = null
  form.description = null
  form.specific = {}
  selectedFiles.value = []
  fileError.value = ''
  if (attachmentInput.value) attachmentInput.value.value = ''
}

function resetForm() {
  clearFormValues()
  clearErrors()
}
</script>

<template>
  <div
    class="dashboard-shell new-ticket-page"
    data-node-id="82:82"
  >
    <ManagerSidebar active-item="Tiket Baru" />
    <main class="new-ticket-main">
      <section class="new-ticket-intro">
        <h1>Pengajuan tiket baru</h1>
        <p>Lengkapi informasi berikut agar tim UPA TIPD dapat memahami dan menangani kebutuhan Anda.</p>
      </section>

      <div class="new-ticket-layout">
        <form
          id="new-ticket-form"
          class="ticket-form-card"
          novalidate
          @submit.prevent="submitForm"
        >
          <header>
            <h2>Detail pengajuan</h2>
            <p>Field bertanda * wajib diisi. Pilih jenis layanan untuk menampilkan informasi khusus.</p>
          </header>

          <section>
            <h3>Informasi Anda</h3>
            <div class="form-grid">
              <TicketFormField
                id="username"
                v-model="form.username"
                label="Username"
                placeholder="Masukkan username Anda"
                autocomplete="username"
                :error="errors.username"
                helper="Gunakan username yang terdaftar pada sistem akademik."
                required
              />
              <TicketFormField
                id="studentId"
                v-model="form.studentId"
                label="NIM"
                placeholder="Masukkan NIM Anda"
                inputmode="numeric"
                :error="errors.studentId"
                helper="Masukkan NIM lengkap tanpa spasi."
                required
              />
            </div>
          </section>

          <section>
            <h3>Informasi layanan</h3>
            <div class="form-grid">
              <TicketFormField
                id="service"
                v-model="form.service"
                label="Jenis layanan"
                type="select"
                :options="services"
                :error="errors.service"
                helper="Pilih layanan yang paling sesuai."
                required
              />
              <TicketFormField
                id="urgency"
                v-model="form.urgency"
                label="Urgensi"
                type="select"
                :options="[
                  { value: 'normal', label: 'Normal' },
                  { value: 'critical-network', label: 'Gangguan jaringan kritis berdampak luas' },
                ]"
                :error="errors.urgency"
                helper="Prioritas akhir ditetapkan Pengelola sesuai dampak."
                required
              />
            </div>
          </section>

          <section>
            <h3>Kebutuhan Anda</h3>
            <TicketFormField
              id="title"
              v-model="form.title"
              label="Judul tiket"
              placeholder="Internet tidak stabil di Gedung Fakultas Sains"
              :error="errors.title"
              helper="Gunakan judul singkat yang menjelaskan masalah."
              required
            />
            <TicketFormField
              id="description"
              v-model="form.description"
              label="Deskripsi kebutuhan"
              type="textarea"
              placeholder="Ceritakan kebutuhan atau gangguan yang dialami."
              :error="errors.description"
              helper="Ceritakan gejala, waktu kejadian, dan dampak yang dirasakan."
              required
            />
          </section>

          <section v-if="selectedService">
            <h3>Informasi khusus {{ selectedService?.label.toLowerCase() }}</h3>
            <div class="form-grid">
              <TicketFormField
                v-for="field in activeServiceFields"
                :id="field.key"
                :key="field.key"
                v-model="form.specific[field.key]"
                :label="field.label"
                :placeholder="field.placeholder"
                :helper="field.helper"
                :error="errors[field.key]"
                :required="field.required"
              />
            </div>
          </section>

          <section>
            <h3>Lampiran</h3>
            <label
              class="file-upload"
              for="attachments"
            >
              <strong>Pilih atau seret file</strong>
              <span>PDF, JPG, atau PNG <span aria-hidden="true">•</span> &lt;5 MB per file <span aria-hidden="true">•</span> maksimal 3</span>
              <input
                id="attachments"
                ref="attachmentInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                multiple
                :disabled="isSubmitting"
                :aria-describedby="fileError ? 'attachments-error' : undefined"
                @change="handleFiles"
              >
            </label>
            <p
              v-if="fileError"
              id="attachments-error"
              class="form-error"
              role="alert"
            >
              {{ fileError }}
            </p>
            <ul
              v-if="selectedFiles.length"
              class="selected-files"
              aria-label="Lampiran terpilih"
            >
              <li
                v-for="(file, index) in selectedFiles"
                :key="`${file.name}-${file.size}`"
              >
                <span>{{ file.name }}</span>
                <button
                  type="button"
                  :aria-label="`Hapus lampiran ${file.name}`"
                  @click="removeFile(index)"
                >
                  Hapus
                </button>
              </li>
            </ul>
          </section>

          <p
            v-if="successMessage"
            class="form-success"
            role="status"
          >
            {{ successMessage }}
          </p>
          <p
            v-if="submissionError"
            class="form-error submission-error"
            role="alert"
          >
            {{ submissionError }}
          </p>
          <div class="form-actions">
            <button
              class="button button--secondary"
              type="button"
              :disabled="isSubmitting"
              @click="resetForm"
            >
              Batal
            </button>
            <button
              class="button button--primary"
              type="submit"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan' }}
            </button>
          </div>
        </form>

        <aside
          class="ticket-sidebar"
          aria-label="Ringkasan pengajuan"
        >
          <section class="ticket-side-card preparation-card">
            <h2>Sebelum mengirim</h2>
            <div class="privacy-note">
              <span aria-hidden="true" />
              <div><strong>Data Anda tetap aman</strong><p>Hanya untuk proses tiket.</p></div>
            </div>
            <ul>
              <li>Pastikan judul dan lokasi sudah jelas.</li>
              <li>Lampirkan bukti yang relevan bila ada.</li>
              <li>Periksa kembali data sebelum dikirim.</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.new-ticket-page { min-height: 100vh; background: var(--color-background); }
.new-ticket-main { width: 100%; max-width: none; margin: 0; padding: var(--space-8) var(--space-4) 40px; }
.new-ticket-intro, .new-ticket-layout { width: min(100%, 1120px); margin-inline: auto; }
.new-ticket-intro { display: grid; gap: var(--space-2); margin-bottom: var(--space-6); }
.new-ticket-intro h1 { font-size: 28px; line-height: 36px; }
.new-ticket-intro > p { color: var(--color-text-secondary); font-size: 14px; line-height: 20px; }
.ticket-step {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  min-height: 52px;
  padding: 14px var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #f1f5f9;
  font-size: 14px;
  line-height: 20px;
}
.ticket-step span { color: var(--color-text-muted); }
.new-ticket-layout { display: grid; gap: var(--space-6); }
.ticket-form-card, .ticket-side-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: 0 4px 16px rgba(15, 23, 42, .08);
}
.ticket-form-card { display: grid; gap: var(--space-5); padding: var(--space-6); }
.ticket-form-card header { display: grid; gap: var(--space-1); }
.ticket-form-card h2 { font-size: 22px; line-height: 30px; }
.ticket-form-card header p { color: var(--color-text-secondary); font-size: 14px; line-height: 20px; }
.ticket-form-card section { display: grid; gap: var(--space-4); }
.ticket-form-card h3, .ticket-side-card h2 { font-size: 18px; line-height: 26px; }
.form-grid { display: grid; gap: var(--space-4); }
.file-upload {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 97px;
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--color-surface);
}
.file-upload:hover { border-color: var(--color-primary-600); background: var(--color-primary-50); }
.file-upload:focus-within { border-color: var(--color-primary-600); box-shadow: 0 0 0 3px rgba(36, 122, 89, .2); }
.file-upload strong { font-size: 16px; }
.file-upload span { color: var(--color-text-muted); font-size: 13px; line-height: 20px; }
.file-upload input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.form-error { color: var(--color-danger); font-size: 12px; line-height: 18px; }
.submission-error { padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); background: #fce8e8; font-size: 14px; }
.form-success { padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); color: #17603a; background: #e2f4e9; font-size: 14px; }
.selected-files { display: grid; gap: var(--space-2); padding: 0; margin: 0; list-style: none; }
.selected-files li { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); background: var(--color-primary-50); font-size: 13px; }
.selected-files button { min-height: 44px; border: 0; color: var(--color-danger); font-weight: 600; background: transparent; }
.form-actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
.button { min-height: 44px; padding: 0 var(--space-4); border-radius: var(--radius-md); font-size: 14px; font-weight: 600; }
.button--secondary { border: 1px solid var(--color-border); color: var(--color-text-secondary); background: var(--color-surface); }
.button--secondary:hover { border-color: var(--color-primary-600); color: var(--color-primary-700); }
.button--primary { border: 1px solid var(--color-primary-700); color: #fff; background: var(--color-primary-700); }
.button--primary:hover { background: var(--color-primary-600); }
.button:disabled { cursor: not-allowed; opacity: .65; }
.ticket-sidebar { display: grid; align-content: start; gap: var(--space-4); }
.ticket-side-card { padding: var(--space-5); }
.identity-card { min-height: 244px; }
.identity-card__title { display: flex; align-items: center; gap: var(--space-2); }
.identity-card__title > span { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: var(--color-primary-50); }
.identity-card__title img { display: block; width: 24px; height: 24px; }
.identity-card > strong { display: block; margin: var(--space-3) 0; color: #17603a; font-size: 14px; line-height: 20px; }
.identity-card > p, .preparation-card li { color: var(--color-text-secondary); font-size: 14px; line-height: 20px; }
.preparation-card { min-height: 300px; }
.privacy-note { display: flex; gap: var(--space-3); min-height: 96px; margin: var(--space-3) 0; padding: var(--space-4); border: 1px solid #1d4e89; border-radius: var(--radius-md); background: #e8f1fb; }
.privacy-note > span { flex: none; width: 10px; height: 10px; margin-top: 4px; border-radius: 50%; background: #1d4e89; }
.privacy-note strong { color: #1d4e89; font-size: 14px; }
.privacy-note p { margin-top: var(--space-1); color: var(--color-text-secondary); font-size: 13px; line-height: 20px; }
.preparation-card ul { padding-left: 18px; margin: 0; }
@media (min-width: 768px) {
  .new-ticket-main { padding-inline: var(--space-6); }
  .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .new-ticket-main { padding-inline: var(--space-8); }
  .new-ticket-layout { grid-template-columns: minmax(0, 760px) minmax(280px, 336px); }
  .ticket-sidebar { position: sticky; top: var(--space-6); }
}
@media (max-width: 520px) {
  .new-ticket-main { padding-top: var(--space-6); }
  .new-ticket-intro h1 { font-size: 24px; line-height: 32px; }
  .ticket-form-card { padding: var(--space-4); }
  .ticket-step { align-items: flex-start; flex-direction: column; gap: var(--space-1); }
  .form-actions { flex-direction: column-reverse; }
  .button { width: 100%; }
}
</style>
