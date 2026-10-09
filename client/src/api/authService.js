import axiosClient from './axiosClient'
import { readStorage, removeStorage, writeStorage } from '../utils/storage'

const SESSION_KEY = 'messmate-module1-session-v1'

function saveSession(data) {
  writeStorage(SESSION_KEY, data)
  return data.user
}

function getErrorMessage(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.'
}

export function getCurrentUser() {
  const session = readStorage(SESSION_KEY, null)
  return session?.user || null
}

export async function register(data) {
  try {
    const response = await axiosClient.post('/auth/register', data)
    const user = saveSession(response.data.data)
    return { ok: true, user }
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) }
  }
}

export async function login(identifier, password) {
  try {
    const response = await axiosClient.post('/auth/login', {
      identifier,
      password,
    })
    const user = saveSession(response.data.data)
    return { ok: true, user }
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) }
  }
}

export async function getMe() {
  const response = await axiosClient.get('/auth/me')
  const session = readStorage(SESSION_KEY, null)

  if (session) {
    writeStorage(SESSION_KEY, { ...session, user: response.data.data })
  }

  return response.data.data
}

export function logout() {
  removeStorage(SESSION_KEY)
}
