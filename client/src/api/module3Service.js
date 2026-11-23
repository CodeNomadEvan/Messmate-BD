import axiosClient from './axiosClient'

export async function getMonthlyReport(month) {
  const response = await axiosClient.get('/reports/monthly', {
    params: { month },
  })
  return response.data.data
}
