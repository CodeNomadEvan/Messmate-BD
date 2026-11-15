import axiosClient from './axiosClient'

const defaultMeal = {
  breakfast: true,
  lunch: true,
  dinner: true,
}

function getErrorMessage(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.'
}

export async function getMeal(memberId, date) {
  const response = await axiosClient.get('/meals', {
    params: { memberId, date },
  })

  return {
    ...defaultMeal,
    ...(response.data.data[0] || {}),
  }
}

export async function getMealsForRange(startDate, endDate, memberId) {
  const response = await axiosClient.get('/meals', {
    params: { startDate, endDate, ...(memberId ? { memberId } : {}) },
  })

  return response.data.data
}

export async function saveMeal(memberId, date, meal) {
  const response = await axiosClient.put('/meals', {
    memberId,
    date,
    breakfast: meal.breakfast,
    lunch: meal.lunch,
    dinner: meal.dinner,
  })

  return response.data.data
}

export async function getRequestForMember() {
  const response = await axiosClient.get('/meal-requests/my')
  return response.data.data
}

export async function getPendingRequests() {
  const response = await axiosClient.get('/meal-requests/pending')
  return response.data.data
}

export async function createMealRequest(data) {
  try {
    const response = await axiosClient.post('/meal-requests', data)
    return { ok: true, request: response.data.data }
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) }
  }
}

export async function updateRequestStatus(requestId, status) {
  try {
    const response = await axiosClient.put(`/meal-requests/${requestId}/status`, { status })
    return { ok: true, request: response.data.data }
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) }
  }
}
