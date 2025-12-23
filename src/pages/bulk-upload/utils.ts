export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

export const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/Fidusia Template Samples Data.xlsx'
  link.download = 'Fidusia Template Samples Data.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const CREATED_BY_ID = 'ae6deceb-3732-4d79-aca2-9508443636d8'
