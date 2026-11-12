import axiosClient from './axiosClient'

export async function getExpenses(startDate, endDate, category) {
  const response = await axiosClient.get('/expenses', {
    params: { startDate, endDate, ...(category ? { category } : {}) },
  })

  return response.data.data
}

export async function createExpense(data) {
  const response = await axiosClient.post('/expenses', data)
  return response.data.data
}

export async function updateExpense(id, data) {
  const response = await axiosClient.put(`/expenses/${id}`, data)
  return response.data.data
}

export async function deleteExpense(id) {
  const response = await axiosClient.delete(`/expenses/${id}`)
  return response.data
}

export async function getGuestMeals(startDate, endDate) {
  const response = await axiosClient.get('/guest-meals', {
    params: { startDate, endDate },
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

export async function getMealRateSummary(startDate, endDate) {
  const response = await axiosClient.get('/meal-rate/summary', {
    params: { startDate, endDate },
  })

  return response.data.data
}
