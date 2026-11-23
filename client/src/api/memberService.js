import axiosClient from './axiosClient'

export async function getMessUsers() {
  const response = await axiosClient.get('/members')
  return response.data.data
}

export async function updateUserRole(userId, role) {
  const response = await axiosClient.put(`/members/${userId}/role`, { role })
  return response.data.data
}

export async function removeUser(userId) {
  const response = await axiosClient.delete(`/members/${userId}`)
  return response.data
}
