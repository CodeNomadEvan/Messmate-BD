import axiosClient from './axiosClient'

export async function getGuestMeals(startDate, endDate) {
  const response = await axiosClient.get('/guest-meals', { params: { startDate, endDate } })
  return response.data.data
}

export async function createGuestMeal(data) {
  const response = await axiosClient.post('/guest-meals', data)
  return response.data.data
}

export async function updateGuestMeal(id, data) {
  const response = await axiosClient.put(`/guest-meals/${id}`, data)
  return response.data.data
}

export async function deleteGuestMeal(id) {
  const response = await axiosClient.delete(`/guest-meals/${id}`)
  return response.data
}

export async function createGuestMealRequest(data) {
  const response = await axiosClient.post('/guest-meal-requests', data)
  return response.data.data
}

export async function getMyGuestMealRequests() {
  const response = await axiosClient.get('/guest-meal-requests/my')
  return response.data.data
}

export async function getPendingGuestMealRequests() {
  const response = await axiosClient.get('/guest-meal-requests/pending')
  return response.data.data
}

export async function reviewGuestMealRequest(id, status) {
  const response = await axiosClient.put(`/guest-meal-requests/${id}/status`, { status })
  return response.data.data
}
