import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../src/supabase.js'
import { createTicket, trackTicket } from '../src/services/ticketService.js'

vi.mock('../src/supabase.js', () => ({
  supabase: {
    functions: { invoke: vi.fn() },
  },
}))

const ticketPayload = {
  username: 'mahasiswa01',
  studentId: '2026001001',
  serviceType: 'network-repair',
  urgency: 'normal',
  title: 'Internet tidak stabil',
  description: 'Internet terputus sejak pagi.',
  serviceDetails: {
    location: 'Gedung Fakultas Sains',
    startedAt: '23 Juli 2026, 08.00 WIB',
    affectedUsers: '45 mahasiswa',
  },
  attachments: [],
}

describe('ticketService', () => {
  beforeEach(() => {
    supabase.functions.invoke.mockReset()
  })

  it('mengirim FormData ke Edge Function publik', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { data: { publicNumber: 'TKT-2026-ABC123', status: 'Baru' } },
      error: null,
    })

    const result = await createTicket(ticketPayload)
    const [functionName, options] = supabase.functions.invoke.mock.calls[0]

    expect(functionName).toBe('create-public-ticket')
    expect(options.body).toBeInstanceOf(globalThis.FormData)
    expect(options.body.get('studentId')).toBe('2026001001')
    expect(JSON.parse(options.body.get('serviceDetails'))).toEqual(ticketPayload.serviceDetails)
    expect(result.publicNumber).toBe('TKT-2026-ABC123')
  })

  it('memberikan pesan ramah untuk kegagalan jaringan', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: new Error('network failed'),
    })

    await expect(createTicket(ticketPayload)).rejects.toThrow(
      'Tiket belum dapat dikirim. Silakan coba lagi.',
    )
  })

  it('melacak tiket melalui fungsi publik terbatas', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: {
        data: {
          publicNumber: 'TKT-ABC1234567',
          status: 'Baru',
          title: 'Internet tidak stabil',
        },
      },
      error: null,
    })

    const result = await trackTicket({
      publicNumber: 'TKT-ABC1234567',
      nim: '2026001001',
    })

    expect(supabase.functions.invoke).toHaveBeenCalledWith('track-public-ticket', {
      body: {
        publicNumber: 'TKT-ABC1234567',
        nim: '2026001001',
      },
    })
    expect(result.status).toBe('Baru')
  })
})
