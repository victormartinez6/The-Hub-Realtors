import axios from 'axios'

export interface Bank {
  ispb: string
  name: string
  code: number | null
  fullName: string
}

export async function getBankList(): Promise<Bank[]> {
  try {
    const response = await axios.get('https://brasilapi.com.br/api/banks/v1')
    return response.data
  } catch (error) {
    console.error('Error fetching bank list:', error)
    return []
  }
}
