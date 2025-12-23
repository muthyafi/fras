import { useState, useRef } from 'react'
import type { ChangeEvent } from 'react'
import { Upload, Download, AlertCircle, CheckCircle, X, Clock, FileCheck, Send } from 'lucide-react'
import Papa from 'papaparse'
import type { FidusiaCSVData, BulkUploadResult, ValidationResult } from '../../types'
import { supabase } from '../../lib/supabase'
import { checkExistingAgreement, submitToAHU, downloadVAList } from '../../lib/api'

export default function BUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [result, setResult] = useState<BulkUploadResult | null>(null)
  const [preview, setPreview] = useState<FidusiaCSVData[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setValidationResults([])
      parseCSVPreview(selectedFile)
    }
  }

  const parseCSVPreview = (file: File) => {
    Papa.parse(file, {
      header: true,
      delimiter: ';', // Indonesian AHU format uses semicolon
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        setPreview(results.data as FidusiaCSVData[])
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
      },
    })
  }

  const handleValidate = async () => {
    if (!file) return

    setValidating(true)
    setValidationResults([])

    Papa.parse(file, {
      header: true,
      delimiter: ';', // Indonesian AHU format uses semicolon
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as FidusiaCSVData[]
        const validations: ValidationResult[] = []

        for (let i = 0; i < data.length; i++) {
          const row = data[i]
          const rowNumber = i + 2

          // Validate required fields first
          const errors = validateFidusiaData(row, rowNumber)
          if (errors.length > 0) {
            validations.push({
              row: rowNumber,
              clientIdNumber: row.NO_KTP_DEBITUR || 'N/A',
              assetDescription: `${row.MERK} ${row.TYPE} ${row.MODEL}`.trim() || 'N/A',
              exists: false,
              message: errors.map((e) => e.message).join(', '),
            })
            continue
          }

          // Check if agreement exists using KTP and vehicle details
          const assetDescription = `${row.MERK} ${row.TYPE} ${row.MODEL} - ${row.NOMOR_RANGKA}`.trim()
          const checkResult = await checkExistingAgreement(row.NO_KTP_DEBITUR, assetDescription)
          validations.push({
            row: rowNumber,
            clientIdNumber: row.NO_KTP_DEBITUR,
            assetDescription,
            exists: checkResult.exists,
            agreementNumber: checkResult.agreementNumber,
            status: checkResult.status,
            message: checkResult.message,
          })
        }

        setValidationResults(validations)
        setValidating(false)
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
        setValidating(false)
      },
    })
  }

  const handleUploadAndSubmit = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    Papa.parse(file, {
      header: true,
      delimiter: ';', // Indonesian AHU format uses semicolon
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as FidusiaCSVData[]
        const uploadResult: BulkUploadResult = {
          success: 0,
          failed: 0,
          duplicate: 0,
          submitted: 0,
          errors: [],
          validationResults: [],
        }

        const { data: userData } = await supabase.auth.getUser()
        const institutionId = userData.user?.id

        for (let i = 0; i < data.length; i++) {
          const row = data[i]
          const rowNumber = i + 2

          // Validate required fields
          const errors = validateFidusiaData(row, rowNumber)
          if (errors.length > 0) {
            uploadResult.failed++
            uploadResult.errors.push(...errors)
            continue
          }

          // Check if agreement already exists using KTP and vehicle details
          const assetDescription = `${row.MERK} ${row.TYPE} ${row.MODEL} - ${row.NOMOR_RANGKA}`.trim()
          const checkResult = await checkExistingAgreement(row.NO_KTP_DEBITUR, assetDescription)

          if (checkResult.exists) {
            uploadResult.duplicate++
            uploadResult.validationResults?.push({
              row: rowNumber,
              clientIdNumber: row.NO_KTP_DEBITUR,
              assetDescription,
              exists: true,
              agreementNumber: checkResult.agreementNumber,
              status: checkResult.status,
              message: checkResult.message,
            })
            continue
          }

          // Insert client into database
          try {
            const { data: existingClient } = await supabase
              .from('clients')
              .select('id')
              .eq('id_number', row.NO_KTP_DEBITUR)
              .single()

            let clientId = existingClient?.id

            // Create full address from fidusia data
            const fullAddress = `${row.ALAMAT_DEBITUR}, RT ${row.RT_DEBITUR}/RW ${row.RW_DEBITUR}, ${row.KELURAHAN_DEBITUR}, ${row.KECAMATAN_DEBITUR}, ${row.KABKOTA_DEBITUR}`.trim()

            if (!clientId) {
              const { data: newClient, error: clientError } = await supabase
                .from('clients')
                .insert({
                  name: row.NAMA_DEBITUR,
                  email: `${row.NO_KTP_DEBITUR}@placeholder.com`, // Email not in fidusia format
                  phone: row.NO_TELEPON || '',
                  id_number: row.NO_KTP_DEBITUR,
                  address: fullAddress,
                  city: row.KABKOTA_DEBITUR,
                  province: row.WILAYAH || '', // Using WILAYAH as province
                  postal_code: row.KODE_POS || '',
                  institution_id: institutionId,
                })
                .select()
                .single()

              if (clientError) throw clientError
              clientId = newClient.id
            }

            // Prepare vehicle description
            const vehicleDescription = `${row.MERK} ${row.TYPE} ${row.MODEL} (${row.TAHUN_PEMBUATAN}) - ${row.NOMOR_RANGKA}/${row.NOMOR_MESIN}`

            // Submit to AHU (fidusia.ahu.go.id)
            const ahuResult = await submitToAHU({
              clientName: row.NAMA_DEBITUR,
              clientIdNumber: row.NO_KTP_DEBITUR,
              clientAddress: fullAddress,
              assetDescription: vehicleDescription,
              assetType: 'vehicle', // Based on fidusia data with vehicle fields
              assetValue: parseFloat(row.NILAI_OBJEK || '0'),
              loanAmount: parseFloat(row.NILAI_PENJAMINAN || '0'),
              institutionName: 'Institution Name', // Get from user profile
              institutionRegistrationNumber: row.KODE_MULTIFINANCE || '1234567890',
            })

            if (ahuResult.success) {
              // AHU returns VA number and PNBP amount in response
              const agreementNumber = row.NOMOR_KONTRAK || `FID-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
              const assetValue = parseFloat(row.NILAI_OBJEK || '0')
              
              // Create agreement record with AHU registration number and PNBP details
              await supabase.from('fidusia_agreements').insert({
                agreement_number: agreementNumber,
                client_id: clientId,
                institution_id: institutionId,
                asset_description: vehicleDescription,
                asset_type: 'vehicle',
                asset_value: assetValue,
                loan_amount: parseFloat(row.NILAI_PENJAMINAN || '0'),
                registration_number: ahuResult.registrationNumber,
                registration_date: ahuResult.submittedAt,
                status: 'submitted', // Changed from 'registered' to 'submitted' - awaiting payment
                submission_status: 'submitted',
                // PNBP fields from AHU response
                pnbp_amount: ahuResult.pnbpAmount,
                pnbp_va_number: ahuResult.pnbpVaNumber,
                pnbp_payment_status: 'unpaid',
                pnbp_expired_date: ahuResult.pnbpExpiredDate,
                // Indonesian AHU Fidusia fields from CSV
                debtor_name: row.NAMA_DEBITUR,
                debtor_address: fullAddress,
                debtor_ktp: row.NO_KTP_DEBITUR,
                debtor_npwp: row.NPWP || null,
                debtor_birth_place: row.TEMPAT_LAHIR_FIDUSIA,
                debtor_birth_date: row.TANGGAL_LAHIR_DEBITUR,
                debtor_occupation: row.PEKERJAAN_DEBITUR || null,
                debtor_phone: row.NO_TELEPON || null,
                debtor_city: row.KABKOTA_DEBITUR,
                debtor_district: row.KECAMATAN_DEBITUR || null,
                debtor_sub_district: row.KELURAHAN_DEBITUR || null,
                debtor_rt: row.RT_DEBITUR || null,
                debtor_rw: row.RW_DEBITUR || null,
                debtor_postal_code: row.KODE_POS || null,
                // Spouse information
                spouse_name: row.NAMA_PASANGAN || null,
                spouse_birth_place: row.TEMPAT_LAHIR_PASANGAN || null,
                spouse_birth_date: row.TANGGAL_LAHIR_PASANGAN || null,
                spouse_occupation: row.PEKERJAAN_PASANGAN || null,
                spouse_ktp: row.NO_KTP_PASANGAN || null,
                // Vehicle details
                vehicle_brand: row.MERK,
                vehicle_type: row.TYPE,
                vehicle_model: row.MODEL || null,
                vehicle_year: row.TAHUN_PEMBUATAN,
                chassis_number: row.NOMOR_RANGKA,
                engine_number: row.NOMOR_MESIN,
                number_of_wheels: row.JUMLAH_RODA || null,
                proof_document_type: row.JENIS_BUKTI_OBJEK || null,
                proof_document_number: row.NO_BUKTI_OBJEK || null,
                // Contract details
                contract_number: row.NOMOR_KONTRAK,
                contract_start_date: row.TGL_AWAL_PERJANJIAN || null,
                contract_end_date: row.TGL_AKHIR_PERJANJIAN || null,
                guarantee_amount: row.NILAI_PENJAMINAN,
                // Regional information
                multifinance_code: row.KODE_MULTIFINANCE || null,
                region: row.WILAYAH || null,
                regional: row.REGIONAL || null,
              })

              uploadResult.success++
              uploadResult.submitted++
              uploadResult.validationResults?.push({
                row: rowNumber,
                clientIdNumber: row.NO_KTP_DEBITUR,
                assetDescription: vehicleDescription,
                exists: false,
                message: `Submitted to AHU. PNBP: Rp ${ahuResult.pnbpAmount?.toLocaleString('id-ID')} | VA: ${ahuResult.pnbpVaNumber}`,
                ahuSubmission: {
                  success: true,
                  registrationNumber: ahuResult.registrationNumber,
                  certificateUrl: ahuResult.certificateUrl,
                },
              })
            } else {
              uploadResult.failed++
              uploadResult.errors.push({
                row: rowNumber,
                field: 'ahu',
                message: ahuResult.error || 'Failed to submit to AHU',
              })
            }
          } catch (error) {
            uploadResult.failed++
            uploadResult.errors.push({
              row: rowNumber,
              field: 'database',
              message: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }

        setResult(uploadResult)
        setUploading(false)
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
        setUploading(false)
      },
    })
  }

  const validateFidusiaData = (
    row: FidusiaCSVData,
    rowNumber: number
  ): Array<{ row: number; field: string; message: string }> => {
    const errors: Array<{ row: number; field: string; message: string }> = []

    // Required debtor fields
    if (!row.NAMA_DEBITUR || row.NAMA_DEBITUR.trim() === '') {
      errors.push({ row: rowNumber, field: 'NAMA_DEBITUR', message: 'Debtor name is required' })
    }
    if (!row.NO_KTP_DEBITUR || row.NO_KTP_DEBITUR.trim() === '') {
      errors.push({ row: rowNumber, field: 'NO_KTP_DEBITUR', message: 'KTP number is required' })
    } else if (row.NO_KTP_DEBITUR.length !== 16) {
      errors.push({ row: rowNumber, field: 'NO_KTP_DEBITUR', message: 'KTP must be 16 digits' })
    }
    
    if (!row.ALAMAT_DEBITUR || row.ALAMAT_DEBITUR.trim() === '') {
      errors.push({ row: rowNumber, field: 'ALAMAT_DEBITUR', message: 'Address is required' })
    }
    
    if (!row.TEMPAT_LAHIR_FIDUSIA || row.TEMPAT_LAHIR_FIDUSIA.trim() === '') {
      errors.push({ row: rowNumber, field: 'TEMPAT_LAHIR_FIDUSIA', message: 'Birth place is required' })
    }
    
    if (!row.TANGGAL_LAHIR_DEBITUR || row.TANGGAL_LAHIR_DEBITUR.trim() === '') {
      errors.push({ row: rowNumber, field: 'TANGGAL_LAHIR_DEBITUR', message: 'Birth date is required' })
    }

    // Required contract fields
    if (!row.NOMOR_KONTRAK || row.NOMOR_KONTRAK.trim() === '') {
      errors.push({ row: rowNumber, field: 'NOMOR_KONTRAK', message: 'Contract number is required' })
    }
    
    if (!row.NILAI_PENJAMINAN || isNaN(parseFloat(row.NILAI_PENJAMINAN))) {
      errors.push({ row: rowNumber, field: 'NILAI_PENJAMINAN', message: 'Valid loan amount is required' })
    }

    // Required vehicle/object fields
    if (!row.MERK || row.MERK.trim() === '') {
      errors.push({ row: rowNumber, field: 'MERK', message: 'Vehicle brand is required' })
    }
    
    if (!row.TYPE || row.TYPE.trim() === '') {
      errors.push({ row: rowNumber, field: 'TYPE', message: 'Vehicle type is required' })
    }
    
    if (!row.NOMOR_RANGKA || row.NOMOR_RANGKA.trim() === '') {
      errors.push({ row: rowNumber, field: 'NOMOR_RANGKA', message: 'Chassis number is required' })
    }
    
    if (!row.NOMOR_MESIN || row.NOMOR_MESIN.trim() === '') {
      errors.push({ row: rowNumber, field: 'NOMOR_MESIN', message: 'Engine number is required' })
    }
    
    if (!row.TAHUN_PEMBUATAN || row.TAHUN_PEMBUATAN.trim() === '') {
      errors.push({ row: rowNumber, field: 'TAHUN_PEMBUATAN', message: 'Manufacturing year is required' })
    }

    if (!row.NILAI_OBJEK || isNaN(parseFloat(row.NILAI_OBJEK))) {
      errors.push({ row: rowNumber, field: 'NILAI_OBJEK', message: 'Valid object value is required' })
    }

    return errors
  }

  const downloadTemplate = () => {
    // Indonesian AHU Fidusia Registration format (57 fields, semicolon-separated)
    const headers = [
      'JENIS_KATEGORI_FIDUSA',
      'JENIS_PENGGUNA',
      'TGL_SURAT_KUASA',
      'BERDASARKAN_PERJANJIAN',
      'NOMOR_KONTRAK',
      'TGL_AWAL_PERJANJIAN',
      'TGL_AKHIR_PERJANJIAN',
      'NILAI_PENJAMINAN',
      'NILAI_PENJAMINAN_FIDUSIA',
      'MERK',
      'TYPE',
      'MODEL',
      'TAHUN_PEMBUATAN',
      'NOMOR_RANGKA',
      'NOMOR_MESIN',
      'JUMLAH_RODA',
      'JENIS_BUKTI_OBJEK',
      'NO_BUKTI_OBJEK',
      'NILAI_OBJEK',
      'PANGGILAN_DEBITUR',
      'KEWARGANEGARAAN_DEBITUR',
      'NAMA_DEBITUR',
      'TEMPAT_LAHIR_FIDUSIA',
      'TANGGAL_LAHIR_DEBITUR',
      'PEKERJAAN_DEBITUR',
      'ALAMAT_DEBITUR',
      'KABKOTA_DEBITUR',
      'KECAMATAN_DEBITUR',
      'KELURAHAN_DEBITUR',
      'RT_DEBITUR',
      'RW_DEBITUR',
      'KODE_POS',
      'NO_KTP_DEBITUR',
      'NPWP',
      'NO_SK',
      'NO_PASPOR',
      'NEGARA_PASPOR',
      'NO_TELEPON',
      'NAMA_PASANGAN',
      'TEMPAT_LAHIR_PASANGAN',
      'TANGGAL_LAHIR_PASANGAN',
      'PEKERJAAN_PASANGAN',
      'NO_KTP_PASANGAN',
      'PANGGILAN_DEBITUR_SEC',
      'NAMA_DEBITUR_SEC',
      'TEMPAT_LAHIR_DEBITUR_SEC',
      'TANGGAL_LAHIR_DEBITUR_SEC',
      'PEKERJAAN_DEBITUR_SEC',
      'ALAMAT_DEBITUR_SEC',
      'KELURAHAN_DEBITUR_SEC',
      'RT_DEBITUR_SEC',
      'RW_DEBITUR_SEC',
      'NO_KTP_DEBITUR_SEC',
      'KODE_POS_SEC',
      'KODE_MULTIFINANCE',
      'SERTIFIKAT',
      'WILAYAH',
      'REGIONAL'
    ].join(';')

    // Sample data rows
    const sampleRow1 = [
      'KENDARAAN',
      'PERORANGAN',
      '2025-01-15',
      'PERJANJIAN_PEMBIAYAAN',
      'FID-2025-001234',
      '2025-01-15',
      '2026-01-15',
      '250000000',
      '250000000',
      'TOYOTA',
      'AVANZA',
      'G',
      '2024',
      'MHKM1BA3JLK123456',
      'NR123456',
      '4',
      'BPKB',
      'A1234567890',
      '300000000',
      'Tuan',
      'WNI',
      'AHMAD WIJAYA',
      'Jakarta',
      '1985-05-20',
      'Karyawan Swasta',
      'Jl. Sudirman No. 123',
      'Jakarta Selatan',
      'Kebayoran Baru',
      'Senayan',
      '001',
      '002',
      '12190',
      '3174012005850001',
      '12.345.678.9-012.000',
      '',
      '',
      '',
      '081234567890',
      'SITI AMINAH',
      'Bandung',
      '1987-08-15',
      'Ibu Rumah Tangga',
      '3174015508870001',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'MF001',
      'CERT-001',
      'DKI Jakarta',
      'Jakarta'
    ].join(';')

    const sampleRow2 = [
      'KENDARAAN',
      'PERORANGAN',
      '2025-01-16',
      'PERJANJIAN_PEMBIAYAAN',
      'FID-2025-001235',
      '2025-01-16',
      '2026-01-16',
      '180000000',
      '180000000',
      'HONDA',
      'CIVIC',
      'RS',
      '2023',
      'MHKM2BA4KLJ789012',
      'NR789012',
      '4',
      'BPKB',
      'B9876543210',
      '220000000',
      'Tuan',
      'WNI',
      'BUDI SANTOSO',
      'Surabaya',
      '1990-12-10',
      'Wiraswasta',
      'Jl. Asia Afrika No. 456',
      'Bandung',
      'Coblong',
      'Dago',
      '005',
      '010',
      '40132',
      '3273021012900001',
      '23.456.789.0-123.000',
      '',
      '',
      '',
      '081298765432',
      'RATNA DEWI',
      'Jakarta',
      '1992-03-25',
      'Guru',
      '3273026503920001',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'MF001',
      'CERT-002',
      'Jawa Barat',
      'Bandung'
    ].join(';')

    const csvContent = `${headers}\n${sampleRow1}\n${sampleRow2}`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fidusia_registration_template_AHU.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearFile = () => {
    setFile(null)
    setPreview([])
    setResult(null)
    setValidationResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Fidusia Registration</h1>
        <p className="text-gray-600 mt-1">Upload CSV to validate and register multiple Fidusia agreements</p>
      </div>

      {/* Download Template */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Download Indonesian AHU CSV Template</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download the official AHU fidusia registration template with 57 fields (semicolon-separated).
              Includes debtor info, vehicle details, spouse info, and regional codes required by fidusia.ahu.go.id.
            </p>
            <button
              onClick={downloadTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Download AHU Template
            </button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              file
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB - Click to change file
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-600">CSV files only</p>
                </div>
              )}
            </label>
          </div>

          {file && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleValidate}
                disabled={validating || uploading}
                className="flex-1 bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                {validating ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-5 h-5" />
                    Validate Agreements
                  </>
                )}
              </button>
              <button
                onClick={handleUploadAndSubmit}
                disabled={uploading || validating}
                className="flex-1 bg-linear-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit to AHU
                  </>
                )}
              </button>
              <button
                onClick={clearFile}
                disabled={uploading || validating}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Validation Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {validationResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{result.row}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.clientIdNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.assetDescription}</td>
                    <td className="px-4 py-3">
                      {result.exists ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          <AlertCircle className="w-3 h-3" />
                          Exists
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Ready
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && !validationResults.length && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Preview (First 5 rows)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debtor Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KTP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chassis No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{row.NOMOR_KONTRAK}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.NAMA_DEBITUR}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.NO_KTP_DEBITUR}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{`${row.MERK} ${row.TYPE} ${row.MODEL}`.trim()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.NOMOR_RANGKA}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Rp {parseFloat(row.NILAI_PENJAMINAN || '0').toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Success</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{result.success}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Send className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Submitted to AHU</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{result.submitted}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Duplicates</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{result.duplicate}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <X className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900">Failed</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{result.failed}</p>
              </div>
            </div>

            {/* AHU Submissions */}
            {result.validationResults && result.validationResults.some(r => r.ahuSubmission?.success) && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Successful AHU Registrations:</h4>
                  <button
                    onClick={() => {
                      // Extract VA numbers from successful submissions
                      const vaList = result.validationResults!
                        .filter(r => r.ahuSubmission?.success)
                        .map((r, idx) => ({
                          agreementNumber: `FID-2025-${String(idx + 1).padStart(4, '0')}`,
                          clientName: r.clientIdNumber || 'N/A',
                          pnbpAmount: 50000, // Get from result
                          pnbpVaNumber: `8808${Math.floor(100000000000000 + Math.random() * 900000000000000)}`,
                          pnbpExpiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                        }))
                      downloadVAList(vaList, 'Bulk_Submission_VA_List')
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download VA List
                  </button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  {result.validationResults
                    .filter(r => r.ahuSubmission?.success)
                    .map((result, index) => (
                      <div key={index} className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Row {result.row}: {result.assetDescription}
                          </p>
                          <p className="text-xs text-gray-600">
                            Registration: {result.ahuSubmission?.registrationNumber}
                          </p>
                        </div>
                        {result.ahuSubmission?.certificateUrl && (
                          <a
                            href={result.ahuSubmission.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 underline"
                          >
                            View Certificate
                          </a>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Errors:</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <ul className="space-y-2">
                    {result.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-800">
                        <span className="font-medium">Row {error.row}</span> - {error.field}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Indonesian AHU Fidusia Process Flow</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Upload AHU CSV File</p>
              <p>Upload CSV file with 57 fields (semicolon-separated): debtor info, vehicle details, contract data, spouse info, regional codes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-yellow-600 font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Validate (Optional)</p>
              <p>Verify KTP format (16 digits), vehicle data (chassis/engine numbers), and check for existing agreements</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Submit to AHU</p>
              <p>System automatically submits to fidusia.ahu.go.id with complete debtor, vehicle, and regional information</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-orange-600 font-bold">4</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">PNBP Payment</p>
              <p>Complete PNBP payment using Virtual Account to proceed with certificate issuance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
