import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ManagerDashboardView from '../src/views/ManagerDashboardView.vue'

describe('ManagerDashboardView', () => {
  it('menampilkan ringkasan dashboard dan seluruh tiket contoh', () => {
    const wrapper = mount(ManagerDashboardView)

    expect(wrapper.get('h1').text()).toBe('Dashboard')
    expect(wrapper.text()).toContain('Kepatuhan SLA')
    expect(wrapper.findAll('tbody tr')).toHaveLength(4)
  })

  it('mengubah label periode ketika filter dipilih', async () => {
    const wrapper = mount(ManagerDashboardView)

    await wrapper.get('#period-filter').setValue('7')

    expect(wrapper.get('.active-filter').text()).toContain('7 hari terakhir')
  })

  it('menyimpan node motion Figma pada batang M4', () => {
    const wrapper = mount(ManagerDashboardView)

    expect(wrapper.get('[data-node-id="20:73"]').exists()).toBe(true)
  })
})
