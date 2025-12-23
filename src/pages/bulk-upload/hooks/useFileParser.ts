import { useState } from 'react'
import type { ChangeEvent } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { FidusiaCSVData } from '../../../types'

const PREVIEW_ROWS = 5
const CSV_DELIMITER = ';'

export function useFileParser() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<FidusiaCSVData[]>([])
  const [jsonData, setJsonData] = useState<any[]>([])

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      delimiter: CSV_DELIMITER,
      skipEmptyLines: true,
      preview: PREVIEW_ROWS,
      complete: (results) => {
        setPreview(results.data as FidusiaCSVData[])
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
      },
    })
  }

  const parseExcel = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        const fullJsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: '',
        })

        setJsonData(fullJsonData)
        console.log('Excel Data as JSON:', JSON.stringify(fullJsonData, null, 2))

        const previewData = fullJsonData.slice(0, PREVIEW_ROWS) as FidusiaCSVData[]
        setPreview(previewData)
      } catch (error) {
        console.error('Excel parsing error:', error)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        parseExcel(selectedFile)
      } else {
        parseCSV(selectedFile)
      }
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview([])
    setJsonData([])
  }

  return {
    file,
    preview,
    jsonData,
    handleFileChange,
    clearFile,
  }
}
