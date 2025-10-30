# PNBP Payment Implementation

## Overview
Implemented complete PNBP (Penerimaan Negara Bukan Pajak) payment workflow for Fidusia registration system, matching the real fidusia.ahu.go.id process.

## What Was Implemented

### 1. Data Models (`src/types/index.ts`)
Updated interfaces to support PNBP payment workflow:

**FidusiaAgreement:**
- `pnbpAmount`: Biaya PNBP based on asset value
- `pnbpBillingCode`: Kode billing for payment
- `pnbpPaymentStatus`: 'unpaid' | 'pending' | 'paid' | 'expired'
- `pnbpPaymentDate`: Payment timestamp
- `pnbpPaymentProof`: URL to uploaded payment proof
- `pnbpExpiredDate`: Billing code expiration

**RegistrationTracking:**
- Added `clientName`, `institutionName`, `assetDescription`, `loanAmount`
- Added `registrationNumber` for tracking
- New statuses: `waiting_payment`, `payment_verified`
- Added PNBP fields: amount, billingCode, paymentStatus, paymentDate, expiredDate, paymentProof

### 2. Payment Calculation API (`src/lib/api.ts`)

**calculatePNBP(assetValue: number)**
- Calculates PNBP based on asset value tiers:
  - ≤ Rp 100 juta: Rp 50,000
  - ≤ Rp 500 juta: Rp 100,000
  - ≤ Rp 1 miliar: Rp 200,000
  - > Rp 1 miliar: Rp 500,000

**generatePNBPBilling(agreementNumber, pnbpAmount, institutionName)**
- Generates billing code (format: XXXX-XXXX-XXXX-XXXX)
- Sets 2-day expiration
- Returns payment instructions for Bank Persepsi, ATM, Mobile Banking

**verifyPNBPPayment(billingCode)**
- Verifies payment status (mock 70% success rate)
- Returns NTPN (Nomor Transaksi Penerimaan Negara)
- In production, integrates with Simponi API

### 3. Payment Confirmation Page (`src/pages/PaymentConfirmation.tsx`)

**Features:**
- Display registration details (agreement number, client, institution, asset, loan amount)
- Show PNBP amount with billing code
- Copy billing code to clipboard
- Payment instructions for Bank Persepsi (BRI, BNI, Mandiri, BTN)
- Automatic payment verification
- Manual payment proof upload (JPG, PNG, PDF)
- Expiration warning
- Success state with certificate notification

**Route:** `/payment/:registrationId`

### 4. Registration Tracking Updates (`src/pages/RegistrationTracking.tsx`)

**Enhanced Status Config:**
- Added `waiting_payment` status (orange badge with credit card icon)
- Added `payment_verified` status (purple badge)

**New Features:**
- Payment button in actions column for `waiting_payment` status
- Direct link to payment confirmation page
- Enhanced mock data with PNBP details
- Payment workflow in activity logs

### 5. Bulk Upload Workflow (`src/pages/BulkUpload.tsx`)

**Integration:**
- Calculate PNBP after successful AHU submission
- Generate billing code automatically
- Set agreement status to `submitted` (awaiting payment)
- Include PNBP amount in validation results
- Updated process flow description (4 steps including payment)

## Workflow Sequence

1. **Submission to AHU**
   - User submits via Bulk Upload
   - System validates and submits to AHU
   - AHU returns reference number

2. **PNBP Calculation**
   - System calculates PNBP based on asset value
   - Generates billing code with 2-day expiration
   - Status: `waiting_payment`

3. **Payment Process**
   - User clicks payment button in tracking
   - Views billing details and instructions
   - Pays via Bank Persepsi/ATM/Mobile Banking
   - Uploads proof or uses auto-verification
   - Status: `payment_verified`

4. **Certificate Issuance**
   - After payment verified, AHU processes
   - Status: `processing` → `completed`
   - Certificate becomes available

## Files Modified

1. `/src/types/index.ts` - Data model updates
2. `/src/lib/api.ts` - Payment calculation and billing APIs
3. `/src/pages/PaymentConfirmation.tsx` - New payment page
4. `/src/pages/RegistrationTracking.tsx` - Payment workflow integration
5. `/src/pages/BulkUpload.tsx` - PNBP calculation in submission
6. `/src/App.tsx` - Added payment route

## Production Integration Notes

### Simponi API Integration
Replace mock functions with actual Simponi (Sistem Informasi PNBP Online) API:
- Billing code generation endpoint
- Payment verification endpoint
- NTPN retrieval

### Supabase Storage
Upload payment proofs to Supabase Storage:
```typescript
const { data, error } = await supabase.storage
  .from('payment-proofs')
  .upload(`${agreementId}/${Date.now()}.pdf`, file)
```

### Real-time Updates
Subscribe to payment status changes:
```typescript
supabase
  .channel('pnbp-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'fidusia_agreements',
    filter: `pnbp_payment_status=eq.paid`
  }, payload => {
    // Update UI
  })
  .subscribe()
```

## Testing

Mock data includes:
- Completed payment (FID-2025-001)
- Awaiting payment (FID-2025-002) - with billing code
- Failed submission (FID-2025-003)
- Processing after payment (FID-2025-004)

## Next Steps

1. **Database Migration**
   - Add PNBP columns to `fidusia_agreements` table
   - Create payment history table
   - Add indexes for billing codes

2. **Email Notifications**
   - Send billing code via email
   - Payment reminder before expiration
   - Payment confirmation email

3. **Admin Panel**
   - Manual payment verification
   - Payment report export
   - PNBP reconciliation

4. **Mobile App**
   - Payment QR code
   - Push notification for payment status
