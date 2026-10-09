import axiosClient from './axiosClient'

export async function getMess() {
  const response = await axiosClient.get('/messes/current')
  return response.data.data
}

export async function updateMess(changes) {
  const response = await axiosClient.put('/messes/current', changes)
  return response.data.data
}

export async function joinMess(messCode) {
  const response = await axiosClient.post('/messes/join', { messCode })
  return response.data.data
}
