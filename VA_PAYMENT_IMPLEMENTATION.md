# PNBP Payment VA Number Implementation

## Overview
Updated PNBP payment workflow to use Virtual Account (VA) numbers provided by AHU (fidusia.ahu.go.id) instead of internal billing code generation. Users can download VA number lists for payment processing.

## Changes Made

### 1. API Updates (`src/lib/api.ts`)

**submitToAHU() - Enhanced Response**
Now returns PNBP payment details from AHU:
```typescript
{
  success: boolean
  registrationNumber: string
  pnbpAmount: number
  pnbpVaNumber: string  // VA format: 8808XXXXXXXXXXXXXXX
  pnbpExpiredDate: string // 2 days validity
}
```

**downloadVAList() - New Function**
Downloads VA number list as CSV:
```typescript
downloadVAList(
  registrations: Array<{
    agreementNumber: string
    clientName: string
    pnbpAmount: number
    pnbpVaNumber: string
    pnbpExpiredDate: string
  }>,
  filename: string
)
```

CSV Format:
- No. Perjanjian
- Nama Debitur
- Jumlah PNBP
- Nomor VA
- Berlaku Hingga

**Removed Functions:**
- ~~`generatePNBPBilling()`~~ - No longer needed
- ~~`verifyPNBPPayment()`~~ - Payment verified externally

### 2. Data Model Updates (`src/types/index.ts`)

**FidusiaAgreement:**
- Changed: `pnbpBillingCode` → `pnbpVaNumber`
- Kept: All other PNBP fields (amount, status, date, proof, expiry)

**RegistrationTracking:**
- Changed: `pnbpBillingCode` → `pnbpVaNumber`
- Added: Display fields (clientName, institutionName, assetDescription, loanAmount)

### 3. Registration Tracking Updates (`src/pages/RegistrationTracking.tsx`)

**New Features:**
- **VA Number Column**: Shows VA with copy button
- **Download All VA Button**: Export all pending VA numbers
- **Amount Display**: Shows PNBP amount for unpaid status

**Table Layout:**
| Agreement No. | Status | PNBP VA Number | Certificate No. | Submitted | Duration | Actions |
|---------------|--------|----------------|-----------------|-----------|----------|---------|
| FID-2025-001  | 🟢 Paid | 8808123...     | W7.00123456     | Oct 28    | 2h 30m   | 👁️      |
| FID-2025-002  | 🟠 Unpaid | 8808987... 📋 Rp 50,000 | -   | Oct 28    | -        | 👁️      |

**VA Number Display:**
```
8808987654321098765  📋  Rp 50,000
[VA Number]        [Copy] [Amount if unpaid]
```

### 4. Bulk Upload Updates (`src/pages/BulkUpload.tsx`)

**Submission Workflow:**
1. Upload CSV ✅
2. Validate data ✅
3. Submit to AHU ✅
4. **Receive VA numbers from AHU** ← New
5. Store to database with VA ✅

**Results Display:**
- Shows VA number in success message
- **Download VA List** button for all successful submissions
- Format: `Submitted to AHU. PNBP: Rp 50,000 | VA: 8808123456789012345`

**Database Fields:**
```sql
pnbp_amount: number
pnbp_va_number: string  -- From AHU
pnbp_payment_status: 'unpaid'
pnbp_expired_date: string
```

### 5. Removed Components

**❌ PaymentConfirmation.tsx**
- Deleted: Full payment page with billing details
- Reason: Payment is handled externally via VA transfer
- Users pay directly to VA via bank transfer/mobile banking

**❌ /payment/:id route**
- Removed from App.tsx routing
- Users don't need internal payment processing

## Payment Workflow (Updated)

### For Single Registration:
1. Submit to AHU → Get VA number
2. View VA in Tracking table
3. Copy VA number (📋 button)
4. Pay via bank transfer to VA
5. AHU verifies payment automatically
6. Status updates to `paid` → `processing` → `completed`

### For Bulk Submissions:
1. Upload CSV → Submit all to AHU
2. Click "Download VA List" button
3. Distribute VA numbers to clients
4. Clients pay to their respective VAs
5. Track payment status in Tracking page
6. Download all VA numbers anytime

## VA Number Format

**Example:** `8808123456789012345`
- Prefix: `8808` (Bank/Payment Gateway code)
- Unique ID: 15 digits
- Validity: 2 days from issuance

## Download Options

### 1. Bulk Submission VA List
Location: Bulk Upload Results page
Filename: `Bulk_Submission_VA_List_YYYY-MM-DD.csv`

### 2. All Registrations VA List  
Location: Registration Tracking page header
Filename: `All_Registrations_VA_List_YYYY-MM-DD.csv`

### 3. Individual Registration
Location: Tracking table (Copy button per row)

## Mock Data Examples

### Registration with VA - Unpaid
```typescript
{
  id: '2',
  agreementNumber: 'FID-2025-002',
  clientName: 'Jane Smith',
  status: 'waiting_payment',
  pnbpAmount: 50000,
  pnbpVaNumber: '8808987654321098765',
  pnbpPaymentStatus: 'unpaid',
  pnbpExpiredDate: '2025-10-30T09:20:00Z'
}
```

### Registration with VA - Paid
```typescript
{
  id: '1',
  agreementNumber: 'FID-2025-001',
  clientName: 'John Doe',
  status: 'completed',
  pnbpAmount: 50000,
  pnbpVaNumber: '8808123456789012345',
  pnbpPaymentStatus: 'paid',
  pnbpPaymentDate: '2025-10-28T09:30:00Z',
  certificateNumber: 'W7.00123456'
}
```

## Production Integration

### AHU API Response Format
Expected from `fidusia.ahu.go.id`:
```json
{
  "success": true,
  "data": {
    "registrationNumber": "AHU-2025-12345",
    "pnbp": {
      "amount": 50000,
      "vaNumber": "8808123456789012345",
      "expiredDate": "2025-10-30T12:00:00Z",
      "bank": "BNI",
      "accountName": "PNBP KEMENKUMHAM"
    }
  }
}
```

### Payment Verification
AHU will update status automatically when:
- VA receives payment
- Payment clears bank system
- Status changes: `unpaid` → `paid` → certificate processing begins

### Real-time Updates
Use Supabase subscriptions:
```typescript
supabase
  .channel('pnbp-payments')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'fidusia_agreements',
    filter: 'pnbp_payment_status=eq.paid'
  }, handlePaymentUpdate)
  .subscribe()
```

## User Instructions

### How to Pay PNBP:
1. Get VA number from system (copy from tracking or download list)
2. Open mobile banking / ATM
3. Select Transfer → Virtual Account
4. Enter VA number: `8808XXXXXXXXXXXXX`
5. Verify amount: `Rp 50,000`
6. Complete payment
7. Save receipt
8. System will auto-update within 5-10 minutes

### Supported Banks:
- BRI
- BNI  
- Mandiri
- BTN
- Other Bank Persepsi

## Benefits of VA Approach

✅ **No Manual Verification**: AHU handles payment confirmation
✅ **Automatic Reconciliation**: Payment status updates real-time
✅ **Bulk Distribution**: Download and share VA list easily
✅ **Standard Process**: Matches official AHU workflow
✅ **Audit Trail**: All payments tracked via VA
✅ **Simple UX**: Copy VA → Pay → Done

## Files Modified

1. `/src/lib/api.ts` - Added downloadVAList, updated submitToAHU
2. `/src/types/index.ts` - Changed billingCode to vaNumber
3. `/src/pages/RegistrationTracking.tsx` - Added VA column & download
4. `/src/pages/BulkUpload.tsx` - Added VA in results & download button
5. `/src/App.tsx` - Removed payment route
6. **Deleted**: `/src/pages/PaymentConfirmation.tsx`

## Database Migration Needed

```sql
-- Rename column
ALTER TABLE fidusia_agreements 
  RENAME COLUMN pnbp_billing_code TO pnbp_va_number;

-- Add index for faster VA lookups
CREATE INDEX idx_pnbp_va_number ON fidusia_agreements(pnbp_va_number);

-- Add index for payment status filtering
CREATE INDEX idx_pnbp_payment_status ON fidusia_agreements(pnbp_payment_status);
```

## Testing Checklist

- [ ] Submit to AHU returns VA number
- [ ] VA number displays in tracking table
- [ ] Copy VA button works
- [ ] Download single VA from tracking
- [ ] Download all VAs from tracking header
- [ ] Download VAs from bulk upload results
- [ ] CSV format includes all required fields
- [ ] Expired VAs show warning
- [ ] Paid VAs show checkmark
- [ ] Mobile responsive table scrolling
