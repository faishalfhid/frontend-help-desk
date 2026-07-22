import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TicketTrackingView from '../src/views/TicketTrackingView.vue'
import { trackTicket } from '../src/services/ticketService.js'

vi.mock('../src/services/ticketService.js', () => ({
  trackTicket: vi.fn(),
}))

const RouterLinkStub = {
  props: ['to'],
  template: '<a href="/"><slot /></a>',
}

function mountTracking() {
  return mount(TicketTrackingView, {
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
}

describe('TicketTrackingView', () => {
  beforeEach(() => {
    trackTicket.mockReset()
  })

  it('meminta nomor tiket dan NIM tanpa menampilkan data sebelum pencarian', () => {
    const wrapper = mountTracking()

    expect(wrapper.get('h1').text()).toBe('Lacak tiket')
    expect(wrapper.get('#publicNumber').element.value).toBe('')
    expect(wrapper.get('#trackingNim').element.value).toBe('')
    expect(wrapper.find('.ticket-result').exists()).toBe(false)
  })

  it('menampilkan validasi pada pasangan pelacakan yang belum diisi', async () => {
    const wrapper = mountTracking()

    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('#publicNumber-error').text()).toBe('Masukkan nomor tiket.')
    expect(wrapper.get('#trackingNim-error').text()).toBe('Masukkan NIM Anda.')
    expect(trackTicket).not.toHaveBeenCalled()
  })

  it('menampilkan hasil tiket tanpa identitas pribadi', async () => {
    trackTicket.mockResolvedValue({
      publicNumber: 'TKT-ABC1234567',
      title: 'Internet tidak stabil',
      serviceType: 'network-repair',
      urgency: 'normal',
      status: 'Dalam Antrean',
      description: 'Internet terputus sejak pagi.',
      serviceDetails: { location: 'Gedung Fakultas Sains' },
      attachmentCount: 1,
      createdAt: '2026-07-23T01:00:00Z',
    })
    const wrapper = mountTracking()
    await wrapper.get('#publicNumber').setValue('tkt-abc1234567')
    await wrapper.get('#trackingNim').setValue('2026001001')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(trackTicket).toHaveBeenCalledWith({
      publicNumber: 'TKT-ABC1234567',
      nim: '2026001001',
    })
    expect(wrapper.get('.ticket-result').text()).toContain('Dalam Antrean')
    expect(wrapper.get('.ticket-result').text()).toContain('Gedung Fakultas Sains')
    expect(wrapper.get('.ticket-result').text()).not.toContain('2026001001')
  })

  it('menampilkan pesan umum ketika pasangan tidak cocok', async () => {
    trackTicket.mockRejectedValue(new Error('Tiket tidak ditemukan. Periksa kembali nomor tiket dan NIM Anda.'))
    const wrapper = mountTracking()
    await wrapper.get('#publicNumber').setValue('TKT-ABC1234567')
    await wrapper.get('#trackingNim').setValue('2026001001')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Tiket tidak ditemukan')
    expect(wrapper.find('.ticket-result').exists()).toBe(false)
  })
})
