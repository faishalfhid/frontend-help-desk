import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../supabase.js'

const DEFAULT_ERROR_MESSAGE = 'Tiket belum dapat dikirim. Silakan coba lagi.'

async function getFunctionErrorMessage(error) {
  if (!(error instanceof FunctionsHttpError)) return DEFAULT_ERROR_MESSAGE

  try {
    const payload = await error.context.json()
    return payload?.message || DEFAULT_ERROR_MESSAGE
  } catch {
    return DEFAULT_ERROR_MESSAGE
  }
}

export async function createTicket({
  username,
  studentId,
  serviceType,
  urgency,
  title,
  description,
  serviceDetails,
  attachments = [],
}) {
  const body = new globalThis.FormData()
  body.append('username', username)
  body.append('studentId', studentId)
  body.append('serviceType', serviceType)
  body.append('urgency', urgency)
  body.append('title', title)
  body.append('description', description)
  body.append('serviceDetails', JSON.stringify(serviceDetails))
  attachments.forEach((file) => body.append('attachments', file, file.name))

  const { data, error } = await supabase.functions.invoke('create-public-ticket', { body })

  if (error) {
    throw new Error(await getFunctionErrorMessage(error))
  }

  if (!data?.data?.publicNumber) {
    throw new Error(DEFAULT_ERROR_MESSAGE)
  }

  return data.data
}

export async function trackTicket({ publicNumber, nim }) {
  const { data, error } = await supabase.functions.invoke('track-public-ticket', {
    body: { publicNumber, nim },
  })

  if (error) {
    throw new Error(await getFunctionErrorMessage(error))
  }

  if (!data?.data?.publicNumber) {
    throw new Error('Tiket belum dapat dilacak. Silakan coba lagi.')
  }

  return data.data
}
