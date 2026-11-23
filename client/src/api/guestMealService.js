import axiosClient from './axiosClient'

export async function getGuestMeals(startDate, endDate) {
  const response = await axiosClient.get('/guest-meals', {
    params: { startDate, endDate }
  })
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
