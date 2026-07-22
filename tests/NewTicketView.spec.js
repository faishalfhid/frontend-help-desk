import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NewTicketView from '../src/views/NewTicketView.vue'
import { createTicket } from '../src/services/ticketService.js'

vi.mock('../src/services/ticketService.js', () => ({
  createTicket: vi.fn(),
}))

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to.name === \'new-ticket\' ? \'/tiket-baru\' : \'/\'"><slot /></a>',
}

function mountNewTicket() {
  return mount(NewTicketView, {
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
}

async function fillValidForm(wrapper) {
  await wrapper.get('#username').setValue('mahasiswa01')
  await wrapper.get('#studentId').setValue('2026001001')
  await wrapper.get('#service').setValue('network-repair')
  await wrapper.get('#urgency').setValue('normal')
  await wrapper.get('#title').setValue('Internet tidak stabil')
  await wrapper.get('#description').setValue('Internet terputus sejak pagi dan mengganggu perkuliahan.')
  await wrapper.get('#location').setValue('Gedung Fakultas Sains lantai 2')
  await wrapper.get('#startedAt').setValue('23 Juli 2026, 08.00 WIB')
  await wrapper.get('#affectedUsers').setValue('45 mahasiswa')
}

describe('NewTicketView', () => {
  beforeEach(() => {
    createTicket.mockReset()
  })

  it('menampilkan struktur utama halaman pengajuan tiket', () => {
    const wrapper = mountNewTicket()

    expect(wrapper.get('h1').text()).toBe('Pengajuan tiket baru')
    expect(wrapper.text()).toContain('Informasi Anda')
    expect(wrapper.get('button[type="submit"]').text()).toContain('Kirim Pengajuan')
  })

  it('menyesuaikan field khusus berdasarkan jenis layanan', async () => {
    const wrapper = mountNewTicket()

    await wrapper.get('#service').setValue('subdomain')

    expect(wrapper.text()).toContain('Informasi khusus pengajuan subdomain')
    expect(wrapper.get('label[for="subdomainName"]').text()).toContain('Nama subdomain')
  })

  it('menampilkan validasi ketika judul belum diisi', async () => {
    const wrapper = mountNewTicket()

    await wrapper.get('#title').setValue('')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('#title-error').text()).toBe('Masukkan judul tiket.')
  })

  it('memulai seluruh field form tanpa nilai bawaan', () => {
    const wrapper = mountNewTicket()

    expect(wrapper.get('#username').element.value).toBe('')
    expect(wrapper.get('#studentId').element.value).toBe('')
    expect(wrapper.get('#service').element.value).toBe('')
    expect(wrapper.get('#urgency').element.value).toBe('')
    expect(wrapper.get('#title').element.value).toBe('')
    expect(wrapper.get('#description').element.value).toBe('')
    expect(wrapper.find('[id="location"]').exists()).toBe(false)
  })

  it('menampilkan Informasi Anda sebagai section pertama beserta validasinya', async () => {
    const wrapper = mountNewTicket()
    const sectionHeadings = wrapper.findAll('form section h3')

    expect(sectionHeadings[0].text()).toBe('Informasi Anda')
    expect(wrapper.get('label[for="username"]').text()).toContain('Username')
    expect(wrapper.get('label[for="studentId"]').text()).toContain('NIM')

    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('#username-error').text()).toBe('Masukkan username Anda.')
    expect(wrapper.get('#studentId-error').text()).toBe('Masukkan NIM Anda.')
  })

  it('menandai Tiket Baru sebagai menu sidebar aktif', () => {
    const wrapper = mountNewTicket()
    const activeLink = wrapper.get('nav a.active')

    expect(activeLink.text()).toContain('Tiket Baru')
    expect(activeLink.attributes('aria-current')).toBe('page')
  })

  it('menggunakan grid dashboard agar form sejajar dengan sidebar di desktop', () => {
    const wrapper = mountNewTicket()

    expect(wrapper.get('.new-ticket-page').classes()).toContain('dashboard-shell')
  })

  it('mengirim data form melalui layanan tiket dan menampilkan nomor tiket', async () => {
    createTicket.mockResolvedValue({
      publicNumber: 'TKT-2026-ABC123',
      status: 'Baru',
      createdAt: '2026-07-23T00:00:00Z',
    })
    const wrapper = mountNewTicket()
    await fillValidForm(wrapper)

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(createTicket).toHaveBeenCalledWith(expect.objectContaining({
      username: 'mahasiswa01',
      studentId: '2026001001',
      serviceType: 'network-repair',
      urgency: 'normal',
      title: 'Internet tidak stabil',
      serviceDetails: expect.objectContaining({
        location: 'Gedung Fakultas Sains lantai 2',
      }),
      attachments: [],
    }))
    expect(wrapper.get('[role="status"]').text()).toContain('TKT-2026-ABC123')
    expect(wrapper.get('#username').element.value).toBe('')
  })

  it('menampilkan pesan ramah ketika pengiriman tiket gagal', async () => {
    createTicket.mockRejectedValue(new Error('Layanan tiket sedang tidak tersedia.'))
    const wrapper = mountNewTicket()
    await fillValidForm(wrapper)

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('.submission-error').text()).toBe('Layanan tiket sedang tidak tersedia.')
    expect(wrapper.get('#username').element.value).toBe('mahasiswa01')
  })
})
