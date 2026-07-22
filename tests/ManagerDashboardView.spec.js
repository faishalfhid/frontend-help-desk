import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ManagerDashboardView from '../src/views/ManagerDashboardView.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to.name === \'new-ticket\' ? \'/tiket-baru\' : to.name === \'ticket-tracking\' ? \'/lacak-tiket\' : \'/\'"><slot /></a>',
}

function mountDashboard() {
  return mount(ManagerDashboardView, {
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
}

describe('ManagerDashboardView', () => {
  it('menampilkan ringkasan dashboard dan seluruh tiket contoh', () => {
    const wrapper = mountDashboard()

    expect(wrapper.get('h1').text()).toBe('Dashboard')
    expect(wrapper.text()).toContain('Kepatuhan SLA')
    expect(wrapper.findAll('tbody tr')).toHaveLength(4)
  })

  it('mengubah label periode ketika filter dipilih', async () => {
    const wrapper = mountDashboard()

    await wrapper.get('#period-filter').setValue('7')

    expect(wrapper.get('.active-filter').text()).toContain('7 hari terakhir')
  })

  it('menyimpan node motion Figma pada batang M4', () => {
    const wrapper = mountDashboard()

    expect(wrapper.get('[data-node-id="20:73"]').exists()).toBe(true)
  })

  it('mengarahkan menu Tiket Baru ke halaman pengajuan', () => {
    const wrapper = mountDashboard()
    const link = wrapper.findAll('nav a').find((item) => item.text().includes('Tiket Baru'))

    expect(link?.attributes('href')).toBe('/tiket-baru')
  })

  it('mengarahkan menu Lacak Tiket ke halaman pelacakan', () => {
    const wrapper = mountDashboard()
    const link = wrapper.findAll('nav a').find((item) => item.text().includes('Lacak Tiket'))

    expect(link?.attributes('href')).toBe('/lacak-tiket')
  })
})
