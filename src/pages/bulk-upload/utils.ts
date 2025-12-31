import * as XLSX from 'xlsx'

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

interface FailedRecord {
  nomor_kontrak: string
  nama_debitur: string
  merk: string
  type: string
  nilai_penjaminan: number
  tgl_awal_perjanjian: string
  notes: string
  created_date: string
}

export const exportFailedRecordsToExcel = (records: FailedRecord[], batchId: string) => {
  const worksheetData = records.map(record => ({
    'Nomor Kontrak': record.nomor_kontrak || '',
    'Nama Debitur': record.nama_debitur || '',
    'Merk': record.merk || '',
    'Type': record.type || '',
    'Nilai Penjaminan': record.nilai_penjaminan || 0,
    'Tanggal Awal Perjanjian': record.tgl_awal_perjanjian || '',
    'Error Notes': record.notes || '',
    'Created Date': new Date(record.created_date).toLocaleString('id-ID'),
  }))

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Failed Records')

  const fileName = `failed_records_batch_${batchId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

export const CREATED_BY_ID = 'ae6deceb-3732-4d79-aca2-9508443636d8'
