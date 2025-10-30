export interface Client {
  id: string
  name: string
  email: string
  phone: string
  idNumber: string // KTP/Identity Number
  address: string
  city: string
  province: string
  postalCode: string
  createdAt: string
  institutionId: string
}

export interface FidusiaAgreement {
  id: string
  agreementNumber: string
  clientId: string
  clientName?: string
  institutionId: string
  institutionName?: string
  branchId?: string // Branch where agreement was created
  branchName?: string // Denormalized branch name for display
  branchCode?: string // Branch code for easy identification
  assetDescription: string
  assetType: 'vehicle' | 'machinery' | 'inventory' | 'receivables' | 'other'
  assetValue: number
  loanAmount: number
  registrationNumber?: string // Certificate number from AHU
  registrationDate?: string
  expiryDate?: string
  status: 'draft' | 'pending' | 'submitted' | 'processing' | 'registered' | 'active' | 'expired' | 'rejected' | 'cancelled'
  submissionStatus?: 'not_submitted' | 'submitting' | 'submitted' | 'failed'
  ahuResponse?: string // Response from AHU API
  // PNBP Payment fields
  pnbpAmount?: number // Biaya PNBP
  pnbpVaNumber?: string // Virtual Account number from AHU
  pnbpPaymentStatus?: 'unpaid' | 'pending' | 'paid' | 'expired'
  pnbpPaymentDate?: string
  pnbpPaidDate?: string // Actual date payment was received
  pnbpPaymentProof?: string // URL to payment proof
  pnbpExpiredDate?: string // VA expiry
  // Certificate fields
  certificateUrl?: string // URL to download certificate
  certificateNumber?: string // Sertifikat Jaminan Fidusia number
  certificateDate?: string // Date certificate was issued
  submittedAt?: string
  processedAt?: string
  rejectionReason?: string
  notes?: string
  createdAt: string
  updatedAt: string
  // Additional AHU fields
  creditorName?: string // Penerima Fidusia
  creditorAddress?: string
  debtorName?: string // Pemberi Fidusia  
  debtorAddress?: string
  debtorIdNumber?: string
  agreementDate?: string
  notaryName?: string
  notaryNumber?: string
  objectLocation?: string // Lokasi benda jaminan
  // Indonesian AHU Fidusia specific fields
  debtorKtp?: string // NO_KTP_DEBITUR (16 digits)
  debtorNpwp?: string // NPWP number
  debtorBirthPlace?: string // TEMPAT_LAHIR_FIDUSIA
  debtorBirthDate?: string // TANGGAL_LAHIR_DEBITUR
  debtorOccupation?: string // PEKERJAAN_DEBITUR
  debtorPhone?: string // NO_TELEPON
  debtorCity?: string // KABKOTA_DEBITUR
  debtorDistrict?: string // KECAMATAN_DEBITUR
  debtorSubDistrict?: string // KELURAHAN_DEBITUR
  debtorRt?: string // RT_DEBITUR
  debtorRw?: string // RW_DEBITUR
  debtorPostalCode?: string // KODE_POS
  // Spouse information
  spouseName?: string // NAMA_PASANGAN
  spouseBirthPlace?: string // TEMPAT_LAHIR_PASANGAN
  spouseBirthDate?: string // TANGGAL_LAHIR_PASANGAN
  spouseOccupation?: string // PEKERJAAN_PASANGAN
  spouseKtp?: string // NO_KTP_PASANGAN
  // Vehicle/Object details
  vehicleBrand?: string // MERK
  vehicleType?: string // TYPE
  vehicleModel?: string // MODEL
  vehicleYear?: string // TAHUN_PEMBUATAN
  chassisNumber?: string // NOMOR_RANGKA
  engineNumber?: string // NOMOR_MESIN
  numberOfWheels?: string // JUMLAH_RODA
  proofDocumentType?: string // JENIS_BUKTI_OBJEK
  proofDocumentNumber?: string // NO_BUKTI_OBJEK
  // Contract details
  contractNumber?: string // NOMOR_KONTRAK
  contractStartDate?: string // TGL_AWAL_PERJANJIAN
  contractEndDate?: string // TGL_AKHIR_PERJANJIAN
  guaranteeAmount?: string // NILAI_PENJAMINAN
  // Regional information
  multifinanceCode?: string // KODE_MULTIFINANCE
  region?: string // WILAYAH
  regional?: string // REGIONAL
}

export interface Institution {
  id: string
  name: string
  registrationNumber: string // Company registration number (NPP/SIUP)
  email: string
  phone: string
  address: string // Head office address
  city: string
  province: string
  postalCode?: string
  director: string
  isActive: boolean
  totalBranches?: number // Count of active branches
  createdAt: string
  updatedAt?: string
}

export interface InstitutionBranch {
  id: string
  institutionId: string
  institutionName?: string // Denormalized for easy display
  branchCode: string // Unique branch code (e.g., "BDG-01", "JKT-02")
  branchName: string // e.g., "Bandung Dago", "Jakarta Sudirman"
  city: string
  province: string
  address: string
  postalCode?: string
  phone: string
  email?: string
  managerName: string
  managerPhone?: string
  isActive: boolean
  totalAgreements?: number // Count of agreements from this branch
  createdAt: string
  updatedAt?: string
}

export interface BulkUploadResult {
  success: number
  failed: number
  duplicate: number
  submitted: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
  validationResults?: Array<ValidationResult>
}

export interface ValidationResult {
  row: number
  clientIdNumber: string
  assetDescription: string
  exists: boolean
  agreementNumber?: string
  status?: string
  message: string
  ahuSubmission?: {
    success: boolean
    registrationNumber?: string
    certificateUrl?: string
    error?: string
  }
}

export interface RegistrationTracking {
  id: string
  agreementId: string
  agreementNumber: string
  clientName: string
  institutionName: string
  branchName?: string // Branch that created the agreement
  branchCode?: string
  assetDescription: string
  loanAmount: number
  registrationNumber?: string
  status: 'queued' | 'submitting' | 'submitted' | 'waiting_payment' | 'payment_verified' | 'processing' | 'completed' | 'failed'
  submittedAt?: string
  completedAt?: string
  ahuReferenceNumber?: string
  // Batch/Bulk submission tracking
  batchId?: string // Groups submissions from same bulk upload
  batchName?: string // User-friendly batch name
  isBulkSubmission?: boolean // Flag for bulk vs individual
  // PNBP fields
  pnbpAmount?: number
  pnbpVaNumber?: string // Virtual Account number from AHU
  pnbpPaymentStatus?: 'unpaid' | 'pending' | 'paid'
  pnbpPaymentDate?: string
  pnbpExpiredDate?: string
  pnbpPaymentProof?: string
  // Certificate fields
  certificateNumber?: string
  certificateUrl?: string
  errorMessage?: string
  retryCount: number
  lastUpdated: string
  logs?: RegistrationLog[]
  activityLogs?: RegistrationLog[] // Alias for logs
}

export interface RegistrationLog {
  timestamp: string
  status: string
  message: string
  details?: string
}

// Indonesian AHU Fidusia Registration CSV Format (57 fields, semicolon-separated)
export interface FidusiaCSVData {
  JENIS_KATEGORI_FIDUSA: string
  JENIS_PENGGUNA: string
  TGL_SURAT_KUASA: string
  BERDASARKAN_PERJANJIAN: string
  NOMOR_KONTRAK: string
  TGL_AWAL_PERJANJIAN: string
  TGL_AKHIR_PERJANJIAN: string
  NILAI_PENJAMINAN: string
  NILAI_PENJAMINAN_FIDUSIA: string
  MERK: string
  TYPE: string
  MODEL: string
  TAHUN_PEMBUATAN: string
  NOMOR_RANGKA: string
  NOMOR_MESIN: string
  JUMLAH_RODA: string
  JENIS_BUKTI_OBJEK: string
  NO_BUKTI_OBJEK: string
  NILAI_OBJEK: string
  PANGGILAN_DEBITUR: string
  KEWARGANEGARAAN_DEBITUR: string
  NAMA_DEBITUR: string
  TEMPAT_LAHIR_FIDUSIA: string
  TANGGAL_LAHIR_DEBITUR: string
  PEKERJAAN_DEBITUR: string
  ALAMAT_DEBITUR: string
  KABKOTA_DEBITUR: string
  KECAMATAN_DEBITUR: string
  KELURAHAN_DEBITUR: string
  RT_DEBITUR: string
  RW_DEBITUR: string
  KODE_POS: string
  NO_KTP_DEBITUR: string
  NPWP: string
  NO_SK: string
  NO_PASPOR: string
  NEGARA_PASPOR: string
  NO_TELEPON: string
  NAMA_PASANGAN: string
  TEMPAT_LAHIR_PASANGAN: string
  TANGGAL_LAHIR_PASANGAN: string
  PEKERJAAN_PASANGAN: string
  NO_KTP_PASANGAN: string
  PANGGILAN_DEBITUR_SEC: string
  NAMA_DEBITUR_SEC: string
  TEMPAT_LAHIR_DEBITUR_SEC: string
  TANGGAL_LAHIR_DEBITUR_SEC: string
  PEKERJAAN_DEBITUR_SEC: string
  ALAMAT_DEBITUR_SEC: string
  KELURAHAN_DEBITUR_SEC: string
  RT_DEBITUR_SEC: string
  RW_DEBITUR_SEC: string
  NO_KTP_DEBITUR_SEC: string
  KODE_POS_SEC: string
  KODE_MULTIFINANCE: string
  SERTIFIKAT: string
  WILAYAH: string
  REGIONAL: string
}

// Legacy CSV format (kept for backward compatibility)
export interface CSVClientData {
  name: string
  email: string
  phone: string
  idNumber: string
  address: string
  city: string
  province: string
  postalCode: string
  assetDescription: string
  assetType: 'vehicle' | 'machinery' | 'inventory' | 'receivables' | 'other'
  assetValue: string
  loanAmount: string
}
