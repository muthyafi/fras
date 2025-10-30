import { supabase } from './supabase'

export interface AgreementCheckResult {
  exists: boolean
  agreementNumber?: string
  status?: string
  registrationNumber?: string
  message: string
}

export interface AHUSubmissionResult {
  success: boolean
  registrationNumber?: string
  certificateUrl?: string
  submittedAt?: string
  // PNBP payment info from AHU
  pnbpAmount?: number
  pnbpVaNumber?: string // Virtual Account number from AHU
  pnbpExpiredDate?: string
  error?: string
}

/**
 * Check if a Fidusia agreement already exists in the system
 */
export async function checkExistingAgreement(
  clientIdNumber: string,
  assetDescription: string
): Promise<AgreementCheckResult> {
  try {
    // First, find the client by ID number
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id_number', clientIdNumber)
      .single()

    if (clientError || !client) {
      return {
        exists: false,
        message: 'Client not found - will create new agreement',
      }
    }

    // Check if agreement exists for this client and asset
    const { data: agreement, error: agreementError } = await supabase
      .from('fidusia_agreements')
      .select('agreement_number, status, registration_number')
      .eq('client_id', client.id)
      .ilike('asset_description', `%${assetDescription}%`)
      .single()

    if (agreementError || !agreement) {
      return {
        exists: false,
        message: 'No existing agreement found - ready for registration',
      }
    }

    return {
      exists: true,
      agreementNumber: agreement.agreement_number,
      status: agreement.status,
      registrationNumber: agreement.registration_number,
      message: `Agreement ${agreement.agreement_number} already exists with status: ${agreement.status}`,
    }
  } catch (error) {
    console.error('Error checking agreement:', error)
    return {
      exists: false,
      message: 'Error checking agreement - will proceed with caution',
    }
  }
}

/**
 * Submit Fidusia registration to AHU (Administrasi Hukum Umum)
 * This is a mock implementation - replace with actual AHU API integration
 */
export async function submitToAHU(agreementData: {
  clientName: string
  clientIdNumber: string
  clientAddress: string
  assetDescription: string
  assetType: string
  assetValue: number
  loanAmount: number
  institutionName: string
  institutionRegistrationNumber: string
}): Promise<AHUSubmissionResult> {
  try {
    // In production, this would call the actual fidusia.ahu.go.id API
    // For now, we'll simulate the API call
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock AHU API endpoint (replace with actual endpoint)
    // const AHU_API_ENDPOINT = 'https://fidusia.ahu.go.id/api/v1/register'
    
    // Calculate PNBP amount
    const pnbpAmount = calculatePNBP(agreementData.assetValue)
    
    // Mock response - in production, make actual API call
    // AHU will return VA number and PNBP details
    console.log('Submitting to AHU:', agreementData)
    
    const mockResponse = {
      success: true,
      data: {
        registrationNumber: `AHU-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        certificateUrl: `https://fidusia.ahu.go.id/certificate/${Date.now()}`,
        submittedAt: new Date().toISOString(),
        // PNBP payment info from AHU
        pnbp: {
          amount: pnbpAmount,
          vaNumber: `8808${Math.floor(100000000000000 + Math.random() * 900000000000000)}`, // VA format from AHU
          expiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
        },
      },
    }

    // Uncomment this for actual API integration:
    /*
    const response = await fetch(AHU_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_AHU_API_KEY}`,
      },
      body: JSON.stringify({
        debitor: {
          name: agreementData.clientName,
          identityNumber: agreementData.clientIdNumber,
          address: agreementData.clientAddress,
        },
        creditor: {
          name: agreementData.institutionName,
          registrationNumber: agreementData.institutionRegistrationNumber,
        },
        object: {
          description: agreementData.assetDescription,
          type: agreementData.assetType,
          value: agreementData.assetValue,
        },
        obligation: {
          amount: agreementData.loanAmount,
        },
      }),
    })

    const result = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Failed to submit to AHU',
      }
    }
    */

    return {
      success: mockResponse.success,
      registrationNumber: mockResponse.data.registrationNumber,
      certificateUrl: mockResponse.data.certificateUrl,
      submittedAt: mockResponse.data.submittedAt,
      pnbpAmount: mockResponse.data.pnbp.amount,
      pnbpVaNumber: mockResponse.data.pnbp.vaNumber,
      pnbpExpiredDate: mockResponse.data.pnbp.expiredDate,
    }
  } catch (error) {
    console.error('Error submitting to AHU:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Calculate PNBP (Penerimaan Negara Bukan Pajak) for Fidusia registration
 * Based on asset value
 * Note: Actual PNBP amount and VA number will be provided by AHU response
 */
export function calculatePNBP(assetValue: number): number {
  // PNBP calculation based on Peraturan Pemerintah
  // Tarif PNBP Jaminan Fidusia (example rates):
  // Rp 0 - Rp 100 juta: Rp 50,000
  // Rp 100 juta - Rp 500 juta: Rp 100,000
  // Rp 500 juta - Rp 1 miliar: Rp 200,000
  // > Rp 1 miliar: Rp 500,000

  if (assetValue <= 100000000) {
    return 50000
  } else if (assetValue <= 500000000) {
    return 100000
  } else if (assetValue <= 1000000000) {
    return 200000
  } else {
    return 500000
  }
}

/**
 * Download VA number list for registrations
 * Can download per registration or per bulk submission
 */
export function downloadVAList(
  registrations: Array<{
    agreementNumber: string
    clientName: string
    pnbpAmount: number
    pnbpVaNumber: string
    pnbpExpiredDate: string
  }>,
  filename: string = 'VA_PNBP_List'
): void {
  // Create CSV content
  const headers = ['No. Perjanjian', 'Nama Debitur', 'Jumlah PNBP', 'Nomor VA', 'Berlaku Hingga']
  const rows = registrations.map((reg) => [
    reg.agreementNumber,
    reg.clientName,
    `Rp ${reg.pnbpAmount.toLocaleString('id-ID')}`,
    reg.pnbpVaNumber,
    new Date(reg.pnbpExpiredDate).toLocaleString('id-ID'),
  ])

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')

  // Create download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Get registration status from AHU
 */
export async function checkRegistrationStatus(
  ahuReferenceNumber: string
): Promise<{
  status: 'processing' | 'completed' | 'rejected'
  certificateNumber?: string
  certificateUrl?: string
  message: string
}> {
  try {
    // Mock implementation - replace with actual AHU status check API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate random status
    const statuses: Array<'processing' | 'completed' | 'rejected'> = ['processing', 'completed', 'rejected']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    if (randomStatus === 'completed') {
      return {
        status: 'completed',
        certificateNumber: `W7.00${Math.floor(Math.random() * 1000000)}`,
        certificateUrl: `https://fidusia.ahu.go.id/certificate/${ahuReferenceNumber}`,
        message: 'Certificate has been issued',
      }
    } else if (randomStatus === 'rejected') {
      return {
        status: 'rejected',
        message: 'Registration rejected - please check documents',
      }
    } else {
      return {
        status: 'processing',
        message: 'Registration is being processed by AHU',
      }
    }
  } catch (error) {
    console.error('Error checking status:', error)
    return {
      status: 'processing',
      message: 'Unable to check status at this time',
    }
  }
}

/**
 * Download certificate from AHU
 */
export async function downloadCertificate(
  certificateNumber: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Mock implementation - replace with actual AHU certificate download API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      url: `https://fidusia.ahu.go.id/download/certificate/${certificateNumber}.pdf`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download certificate',
    }
  }
}

/**
 * Batch validate multiple agreements from CSV data
 */
export async function batchValidateAgreements(
  agreements: Array<{
    clientIdNumber: string
    assetDescription: string
  }>
): Promise<AgreementCheckResult[]> {
  const results = await Promise.all(
    agreements.map((agreement) =>
      checkExistingAgreement(agreement.clientIdNumber, agreement.assetDescription)
    )
  )
  return results
}
