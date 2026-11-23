import axiosClient from './axiosClient'

export async function getNotices() {
  const response = await axiosClient.get('/notices')
  return response.data.data
}

export async function createNotice(data) {
  const response = await axiosClient.post('/notices', data)
  return response.data.data
}

export async function updateNotice(id, data) {
  const response = await axiosClient.put(`/notices/${id}`, data)
  return response.data.data
}

export async function deleteNotice(id) {
  const response = await axiosClient.delete(`/notices/${id}`)
  return response.data
}

export async function getComplaints() {
  const response = await axiosClient.get('/complaints')
  return response.data.data
}

export async function createComplaint(data) {
  const response = await axiosClient.post('/complaints', data)
  return response.data.data
}

export async function updateComplaintStatus(id, data) {
  const response = await axiosClient.put(`/complaints/${id}/status`, data)
  return response.data.data
}
