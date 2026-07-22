<script setup>
import { computed, ref } from 'vue'
import KpiCard from '../components/KpiCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import kpiGreen from '../assets/figma/kpi-green.svg'
import kpiBlue from '../assets/figma/kpi-blue.svg'
import kpiGold from '../assets/figma/kpi-gold.svg'
import kpiRed from '../assets/figma/kpi-red.svg'
import navDefault from '../assets/figma/nav-default.svg'
import navActive from '../assets/figma/nav-active.svg'
import downloadIcon from '../assets/figma/download.svg'
import moreIcon from '../assets/figma/more.svg'

const isNavigationOpen = ref(false)
const period = ref('30')

const periods = [
  { value: '7', label: '7 hari terakhir' },
  { value: '30', label: '30 hari terakhir' },
  { value: '90', label: '90 hari terakhir' },
]

const navigationItems = ['Dashboard', 'Tiket Baru', 'Antrean Tiket', 'Laporan', 'Audit Log']

const kpis = [
  { title: 'Total Tiket', value: '248', note: '↑ 12% dari periode lalu', accent: 'blue', icon: kpiBlue },
  { title: 'Dalam Antrean', value: '42', note: '8 tiket menunggu > 1 hari', accent: 'gold', icon: kpiGold },
  { title: 'Kepatuhan SLA', value: '87%', note: 'Target minimum 80% tercapai', accent: 'green', icon: kpiGreen },
  { title: 'Tiket Lewat SLA', value: '18', note: '↓ 3 tiket dari periode lalu', accent: 'red', icon: kpiRed },
]

const weeklyVolume = [
  { label: 'M1', value: 42 },
  { label: 'M2', value: 56 },
  { label: 'M3', value: 48 },
  { label: 'M4', value: 66, nodeId: '20:73' },
  { label: 'M5', value: 58 },
  { label: 'M6', value: 66 },
  { label: 'M7', value: 64 },
  { label: 'M8', value: 66 },
]

const statuses = [
  { label: 'Baru', value: 36 },
  { label: 'Dalam Antrean', value: 42 },
  { label: 'Diproses', value: 28 },
  { label: 'Selesai', value: 126 },
  { label: 'Ditolak', value: 10 },
  { label: 'Dibatalkan', value: 6 },
]

const services = [
  { label: 'Perbaikan Jaringan', value: 68, width: 86 },
  { label: 'Perangkat Periferal', value: 54, width: 68 },
  { label: 'Pengajuan Subdomain', value: 41, width: 52 },
]

const tickets = [
  { title: 'Internet putus di Gedung A', number: '#TKT-7F2A91', service: 'Perbaikan Jaringan', applicant: 'Budi Santoso', createdAt: 'Hari ini, 09.42', status: 'Diproses' },
  { title: 'Subdomain jurnal fakultas', number: '#TKT-91BC04', service: 'Pengajuan Subdomain', applicant: 'Siti Rahma', createdAt: 'Hari ini, 08.15', status: 'Dalam Antrean' },
  { title: 'Mouse laboratorium rusak', number: '#TKT-44ED88', service: 'Perangkat Periferal', applicant: 'Dimas Prakoso', createdAt: 'Kemarin, 15.20', status: 'Baru' },
  { title: 'Peminjaman Lab Komputer 2', number: '#TKT-A12F63', service: 'Peminjaman Laboratorium', applicant: 'Nadia Putri', createdAt: 'Kemarin, 13.05', status: 'Selesai' },
]

const currentPeriodLabel = computed(() => periods.find((item) => item.value === period.value)?.label)

function exportCsv() {
  const header = ['Nomor Tiket', 'Judul', 'Layanan', 'Pemohon', 'Dibuat', 'Status']
  const rows = tickets.map((ticket) => [ticket.number, ticket.title, ticket.service, ticket.applicant, ticket.createdAt, ticket.status])
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
    .join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `laporan-tiket-${period.value}-hari.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div
    class="dashboard-shell"
    data-node-id="1:2"
  >
    <button
      class="mobile-menu-button"
      type="button"
      :aria-expanded="isNavigationOpen"
      aria-controls="manager-navigation"
      @click="isNavigationOpen = !isNavigationOpen"
    >
      <span aria-hidden="true">☰</span>
      <span>Menu</span>
    </button>

    <aside
      id="manager-navigation"
      class="sidebar"
      :class="{ 'sidebar--open': isNavigationOpen }"
    >
      <div class="brand">
        <div class="brand__mark">
          UIN
        </div>
        <div>
          <strong>UPA TIPD</strong>
          <span>Helpdesk UIN Kediri</span>
        </div>
      </div>

      <nav aria-label="Navigasi pengelola">
        <a
          v-for="item in navigationItems"
          :key="item"
          href="#"
          :class="{ active: item === 'Dashboard' }"
          :aria-current="item === 'Dashboard' ? 'page' : undefined"
          @click="isNavigationOpen = false"
        >
          <img
            :src="item === 'Dashboard' ? navActive : navDefault"
            alt=""
            width="20"
            height="20"
          >
          {{ item }}
        </a>
      </nav>

      <div class="manager-profile">
        <span aria-hidden="true">AR</span>
        <div>
          <strong>Ahmad Rizky</strong>
          <small>Pengelola</small>
        </div>
      </div>
    </aside>

    <main>
      <header class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Ringkasan kinerja layanan UPA TIPD <span aria-hidden="true">•</span> Diperbarui 21 Juli 2026, 10.30 WIB</p>
        </div>
        <div class="page-actions">
          <label
            class="sr-only"
            for="period-filter"
          >Periode laporan</label>
          <select
            id="period-filter"
            v-model="period"
          >
            <option
              v-for="item in periods"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
          <button
            type="button"
            @click="exportCsv"
          >
            <img
              :src="downloadIcon"
              alt=""
              width="18"
              height="18"
            >
            Ekspor CSV
          </button>
        </div>
      </header>

      <p
        class="active-filter"
        aria-live="polite"
      >
        Data untuk {{ currentPeriodLabel }}.
      </p>

      <section
        class="kpi-grid"
        aria-label="Ringkasan kinerja"
      >
        <KpiCard
          v-for="item in kpis"
          :key="item.title"
          v-bind="item"
        />
      </section>

      <section
        class="analytics-grid"
        aria-label="Analitik tiket"
      >
        <article class="card volume-card">
          <div class="card-heading">
            <div><h2>Volume tiket</h2><p>Tiket masuk per minggu</p></div>
            <strong>248 tiket</strong>
          </div>
          <div
            class="bar-chart"
            role="img"
            aria-label="Volume tiket mingguan: M1 42, M2 56, M3 48, M4 66, M5 58, M6 66, M7 64, M8 66 tiket"
          >
            <div
              v-for="bar in weeklyVolume"
              :key="bar.label"
              class="bar-chart__item"
            >
              <!-- TODO: Motion Figma untuk node 20:73 tidak memiliki keyframe, easing, atau durasi pada payload MCP. -->
              <div
                class="bar-chart__track"
                :class="{ 'bar-chart__track--latest': bar.label === 'M8' }"
                :data-node-id="bar.nodeId"
                :style="{ height: `${bar.value / 66 * 100}%` }"
              />
              <span>{{ bar.label }}</span>
            </div>
          </div>
        </article>

        <article class="card status-card">
          <h2>Distribusi status</h2>
          <ul>
            <li
              v-for="item in statuses"
              :key="item.label"
            >
              <StatusBadge :status="item.label" />
              <strong>{{ item.value }}</strong>
            </li>
          </ul>
        </article>
      </section>

      <section
        class="detail-grid"
        aria-label="Indikator layanan"
      >
        <article class="card metric-card">
          <h2>Kepatuhan SLA</h2><strong class="metric-card__value success">87%</strong><p>Target minimum 80%</p>
          <div class="progress">
            <span style="width: 87%" />
          </div>
          <p>216 dari 248 tiket sesuai SLA</p><strong class="danger-text">18 tiket lewat SLA</strong>
        </article>
        <article class="card metric-card">
          <h2>Waktu penyelesaian</h2><strong class="metric-card__value">2,6 hari</strong><p>Rata-rata seluruh layanan</p>
          <div class="split-metric">
            <span><strong>1,2 hari</strong> Paling cepat</span><span><strong>4,8 hari</strong> Paling lambat</span>
          </div>
          <p class="success">
            ↓ 0,4 hari dari periode lalu
          </p>
        </article>
        <article class="card metric-card">
          <h2>Kepuasan pengguna</h2><strong class="metric-card__value">4,4 / 5</strong><div
            class="stars"
            aria-label="4,4 dari 5 bintang"
          >
            ★★★★<span>★</span>
          </div>
          <div class="progress progress--gold">
            <span style="width: 84%" />
          </div><p>84% feedback bernilai 4–5</p><p>Partisipasi feedback 72%</p>
        </article>
        <article class="card service-card">
          <h2>Layanan teratas</h2>
          <div
            v-for="service in services"
            :key="service.label"
            class="service-row"
          >
            <div><span>{{ service.label }}</span><strong>{{ service.value }}</strong></div>
            <div class="progress">
              <span :style="{ width: `${service.width}%` }" />
            </div>
          </div>
          <p><strong class="danger-text">10 ditolak</strong><span>6 dibatalkan</span></p>
        </article>
      </section>

      <section class="card recent-tickets">
        <div class="recent-tickets__heading">
          <h2>Tiket terbaru</h2><a href="#">Lihat semua tiket →</a>
        </div>
        <div class="ticket-table-wrap">
          <table>
            <thead><tr><th>Tiket</th><th>Layanan</th><th>Pemohon</th><th>Dibuat</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              <tr
                v-for="ticket in tickets"
                :key="ticket.number"
              >
                <td><strong>{{ ticket.title }}</strong><small>{{ ticket.number }}</small></td>
                <td>{{ ticket.service }}</td><td>{{ ticket.applicant }}</td><td>{{ ticket.createdAt }}</td>
                <td><StatusBadge :status="ticket.status" /></td>
                <td>
                  <button
                    class="icon-button"
                    type="button"
                    :aria-label="`Buka tindakan untuk ${ticket.number}`"
                  >
                    <img
                      :src="moreIcon"
                      alt=""
                      width="20"
                      height="20"
                    >
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ticket-cards">
          <article
            v-for="ticket in tickets"
            :key="ticket.number"
            class="ticket-card"
          >
            <div><small>{{ ticket.number }}</small><StatusBadge :status="ticket.status" /></div>
            <h3>{{ ticket.title }}</h3><p>{{ ticket.service }}</p><p>{{ ticket.applicant }} · {{ ticket.createdAt }}</p>
            <button type="button">
              Buka tiket
            </button>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
