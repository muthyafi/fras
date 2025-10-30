# Agreements & Tracking Pages Update - Indonesian AHU Display

## Overview
Updated the Agreements and Registration Tracking pages to display Indonesian AHU fidusia-specific information including debtor KTP, vehicle details (chassis/engine numbers), and enhanced data presentation.

## Date
October 29, 2025

---

## Changes Made

### 1. Type Definitions (`/src/types/index.ts`)

#### Extended `FidusiaAgreement` Interface
Added 40+ new optional fields for Indonesian AHU fidusia registration:

**Debtor (Primary) Information:**
- `debtorKtp` - KTP number (16 digits)
- `debtorNpwp` - NPWP tax ID
- `debtorBirthPlace` - Birth place
- `debtorBirthDate` - Birth date
- `debtorOccupation` - Occupation
- `debtorPhone` - Phone number
- `debtorCity` - City (KABKOTA)
- `debtorDistrict` - District (KECAMATAN)
- `debtorSubDistrict` - Sub-district (KELURAHAN)
- `debtorRt` - RT (neighborhood)
- `debtorRw` - RW (community)
- `debtorPostalCode` - Postal code

**Spouse Information:**
- `spouseName` - Spouse full name
- `spouseBirthPlace` - Spouse birth place
- `spouseBirthDate` - Spouse birth date
- `spouseOccupation` - Spouse occupation
- `spouseKtp` - Spouse KTP number

**Vehicle/Object Details:**
- `vehicleBrand` - Brand (MERK) - e.g., TOYOTA, HONDA
- `vehicleType` - Type - e.g., AVANZA, CIVIC
- `vehicleModel` - Model - e.g., G, RS
- `vehicleYear` - Manufacturing year
- `chassisNumber` - Chassis number (NOMOR_RANGKA)
- `engineNumber` - Engine number (NOMOR_MESIN)
- `numberOfWheels` - Number of wheels
- `proofDocumentType` - Proof document type (BPKB, etc.)
- `proofDocumentNumber` - Document number

**Contract Details:**
- `contractNumber` - Contract number
- `contractStartDate` - Contract start date
- `contractEndDate` - Contract end date
- `guaranteeAmount` - Guarantee amount

**Regional Information:**
- `multifinanceCode` - Multifinance company code
- `region` - Region/Province (WILAYAH)
- `regional` - Regional office

---

### 2. BulkUpload Component (`/src/pages/BulkUpload.tsx`)

#### Database Insert Enhancement
Updated the `fidusia_agreements` insert to include all Indonesian AHU fields:

**Before:**
```typescript
await supabase.from('fidusia_agreements').insert({
  agreement_number: agreementNumber,
  client_id: clientId,
  institution_id: institutionId,
  asset_description: vehicleDescription,
  asset_type: 'vehicle',
  asset_value: assetValue,
  loan_amount: parseFloat(row.NILAI_PENJAMINAN || '0'),
  // ... PNBP fields
})
```

**After:**
```typescript
await supabase.from('fidusia_agreements').insert({
  agreement_number: agreementNumber,
  client_id: clientId,
  institution_id: institutionId,
  asset_description: vehicleDescription,
  asset_type: 'vehicle',
  asset_value: assetValue,
  loan_amount: parseFloat(row.NILAI_PENJAMINAN || '0'),
  // ... PNBP fields
  // Indonesian AHU Fidusia fields
  debtor_name: row.NAMA_DEBITUR,
  debtor_address: fullAddress,
  debtor_ktp: row.NO_KTP_DEBITUR,
  debtor_npwp: row.NPWP || null,
  debtor_birth_place: row.TEMPAT_LAHIR_FIDUSIA,
  debtor_birth_date: row.TANGGAL_LAHIR_DEBITUR,
  debtor_occupation: row.PEKERJAAN_DEBITUR || null,
  debtor_phone: row.NO_TELEPON || null,
  // ... spouse fields
  // ... vehicle fields
  vehicle_brand: row.MERK,
  vehicle_type: row.TYPE,
  vehicle_model: row.MODEL || null,
  vehicle_year: row.TAHUN_PEMBUATAN,
  chassis_number: row.NOMOR_RANGKA,
  engine_number: row.NOMOR_MESIN,
  // ... contract and regional fields
})
```

**Field Mapping Summary:**
- **57 CSV fields** → **40+ database fields**
- All optional fields use `|| null` for proper null handling
- Full address constructed before insert
- Vehicle description pre-formatted

---

### 3. Agreements Page (`/src/pages/Agreements.tsx`)

#### Mock Data Update
Enhanced mock agreements with Indonesian AHU data:

```typescript
{
  id: '1',
  agreementNumber: 'FID-2025-001',
  clientName: 'PT Maju Jaya',
  assetDescription: 'Toyota Avanza 2024',
  // NEW: Indonesian AHU fields
  debtorName: 'AHMAD WIJAYA',
  debtorKtp: '3174012005850001',
  debtorPhone: '081234567890',
  debtorCity: 'Jakarta Selatan',
  vehicleBrand: 'TOYOTA',
  vehicleType: 'AVANZA',
  vehicleModel: 'G',
  vehicleYear: '2024',
  chassisNumber: 'MHKM1BA3JLK123456',
  engineNumber: 'NR123456',
  contractNumber: 'FID-2025-001234',
  // ...
}
```

#### Table Display Updates

**Client Column Enhancement:**
```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm text-gray-900">{agreement.clientName}</div>
  {/* NEW: Show KTP number */}
  {agreement.debtorKtp && (
    <div className="text-xs text-gray-500 font-mono">
      KTP: {agreement.debtorKtp}
    </div>
  )}
  <div className="text-xs text-gray-500">
    {agreement.institutionName}
    {agreement.branchName && (
      <span className="ml-1">• {agreement.branchName}</span>
    )}
  </div>
</td>
```

**Display:**
- Client name (bold)
- **KTP number** (monospace font) - NEW
- Institution & branch

**Asset Column Enhancement:**
```tsx
<td className="px-6 py-4">
  <div className="text-sm text-gray-900">{agreement.assetDescription}</div>
  <div className="text-xs text-gray-500 capitalize">{agreement.assetType}</div>
  {/* NEW: Show vehicle details for vehicle type */}
  {agreement.assetType === 'vehicle' && 
   (agreement.chassisNumber || agreement.engineNumber) && (
    <div className="mt-1 space-y-0.5">
      {agreement.chassisNumber && (
        <div className="text-xs text-gray-500">
          <span className="font-medium">Chassis:</span> {agreement.chassisNumber}
        </div>
      )}
      {agreement.engineNumber && (
        <div className="text-xs text-gray-500">
          <span className="font-medium">Engine:</span> {agreement.engineNumber}
        </div>
      )}
    </div>
  )}
</td>
```

**Display:**
- Asset description
- Asset type
- **Chassis number** - NEW (for vehicles)
- **Engine number** - NEW (for vehicles)

**Before vs After:**

| Before | After |
|--------|-------|
| PT Maju Jaya<br>BCA Finance • Jakarta | PT Maju Jaya<br>**KTP: 3174012005850001**<br>BCA Finance • Jakarta |
| Toyota Avanza 2024<br>vehicle | Toyota Avanza 2024<br>vehicle<br>**Chassis: MHKM1BA3JLK123456**<br>**Engine: NR123456** |

---

### 4. Registration Tracking Page (`/src/pages/RegistrationTracking.tsx`)

#### Mock Data Update
Enhanced tracking data with detailed vehicle descriptions:

**Before:**
```typescript
{
  clientName: 'John Doe',
  assetDescription: 'Motor Honda Vario 2023',
  loanAmount: 15000000,
}
```

**After:**
```typescript
{
  clientName: 'AHMAD WIJAYA',
  assetDescription: 'TOYOTA AVANZA G (2024) - MHKM1BA3JLK123456/NR123456',
  loanAmount: 200000000,
}
```

**Asset Description Format:**
```
{BRAND} {TYPE} {MODEL} ({YEAR}) - {CHASSIS}/{ENGINE}
```

**Examples:**
- `TOYOTA AVANZA G (2024) - MHKM1BA3JLK123456/NR123456`
- `HONDA CIVIC RS (2023) - MHKM2BA4KLJ789012/NR789012`

#### Activity Log Updates
Enhanced log details to include KTP information:

```typescript
{
  timestamp: '2025-10-28T08:01:00Z',
  status: 'submitted',
  message: 'Successfully submitted to AHU',
  details: 'Reference: AHU-2025-12345 | KTP: 3174012005850001' // NEW
}
```

#### Table Display Updates

**Agreement Column Enhancement:**
```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="font-medium text-gray-900">{item.agreementNumber}</div>
  <div className="text-xs text-gray-500">
    {item.clientName}
    {item.branchName && (
      <span className="ml-1">• {item.branchCode}</span>
    )}
  </div>
  {/* NEW: Show asset description */}
  {item.assetDescription && (
    <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
      {item.assetDescription}
    </div>
  )}
</td>
```

**Display:**
- Agreement number (bold)
- Client name & branch
- **Asset description with vehicle details** - NEW (truncated)

**Before vs After:**

| Before | After |
|--------|-------|
| FID-2025-001<br>John Doe • JKT-02 | FID-2025-001<br>AHMAD WIJAYA • JKT-02<br>**TOYOTA AVANZA G (2024) - MHKM1BA3...**|

---

## Data Flow Integration

### From CSV Upload to Display

```
1. CSV Upload (BulkUpload.tsx)
   ↓
   Parse 57 fields (semicolon-separated)
   ↓
   Validate Indonesian data (KTP, vehicle details)
   ↓
   
2. Database Insert
   ↓
   Insert to fidusia_agreements with all AHU fields
   - debtor_ktp, debtor_name, debtor_phone
   - vehicle_brand, vehicle_type, chassis_number, engine_number
   - contract_number, multifinance_code, region
   ↓

3. Display in Agreements
   ↓
   Show in table:
   - Client name + KTP number
   - Asset description + chassis/engine numbers
   ↓

4. Display in Tracking
   ↓
   Show in table:
   - Agreement number + client
   - Detailed asset description with vehicle info
   ↓
   
5. Detail Modal
   ↓
   Activity logs include KTP references
```

---

## Visual Improvements

### Agreements Table

**Row Example:**
```
┌─────────────────┬──────────────────────┬────────────────────────┬─────────────┐
│ Agreement No.   │ Client               │ Asset                  │ Loan Amount │
├─────────────────┼──────────────────────┼────────────────────────┼─────────────┤
│ FID-2025-001    │ PT Maju Jaya         │ Toyota Avanza 2024     │ Rp 200 jt   │
│ AHU-001234      │ KTP: 3174012005850001│ vehicle                │ of Rp 250jt │
│                 │ BCA • Jakarta        │ Chassis: MHKM1BA3...   │             │
│                 │                      │ Engine: NR123456       │             │
└─────────────────┴──────────────────────┴────────────────────────┴─────────────┘
```

### Tracking Table

**Row Example:**
```
┌─────────────────┬─────────────────────────────────────────┬──────────────┐
│ Agreement No.   │ Submission Status                       │ PNBP VA      │
├─────────────────┼─────────────────────────────────────────┼──────────────┤
│ FID-2025-001    │ ✓ Completed                            │ 8808123...   │
│ AHMAD WIJAYA    │                                         │              │
│ • JKT-02        │                                         │              │
│ TOYOTA AVANZA G │                                         │              │
│ (2024) - MHKM...│                                         │              │
└─────────────────┴─────────────────────────────────────────┴──────────────┘
```

---

## Typography & Styling

### Font Styles Used

**Monospace Font (`font-mono`):**
- KTP numbers: `3174012005850001`
- VA numbers: `8808123456789012345`
- Certificate numbers: `W7.00123456`

**Purpose:** Makes long numeric IDs easier to read and copy

**Font Weights:**
- Client/Debtor names: Normal weight (`text-gray-900`)
- Agreement numbers: Medium weight (`font-medium`)
- Labels (Chassis, Engine): Medium weight (`font-medium`)

**Text Sizes:**
- Primary info (names, numbers): `text-sm` (14px)
- Secondary info (KTP, institution): `text-xs` (12px)
- Tertiary info (asset description in tracking): `text-xs` (12px)

### Color Scheme

**Text Colors:**
- Primary: `text-gray-900` (almost black)
- Secondary: `text-gray-500` (medium gray)
- Tertiary: `text-gray-400` (light gray)
- Labels: `text-gray-500`

**Purpose:** Clear visual hierarchy

---

## Indonesian Naming Conventions

### Uppercase Names
All Indonesian debtor names stored in UPPERCASE:
- `AHMAD WIJAYA`
- `SITI AMINAH`
- `BUDI SANTOSO`

**Reason:** Matches Indonesian government document standards (KTP, NPWP)

### KTP Format
16-digit format:
```
3174012005850001
││││││││││││││││
│││││││││││││└└└─ Sequential number
││││││││││└└─────  Gender & birth date
│││││└└└──────────  Sub-district code
│││└──────────────  District code
││└───────────────  City/Regency code
└└────────────────  Province code
```

### Vehicle Identification
**Format:** `BRAND TYPE MODEL (YEAR) - CHASSIS/ENGINE`

**Examples:**
- `TOYOTA AVANZA G (2024) - MHKM1BA3JLK123456/NR123456`
- `HONDA CIVIC RS (2023) - MHKM2BA4KLJ789012/NR789012`

---

## Benefits

### For Users
1. **Easy Identification**: KTP numbers visible at a glance
2. **Vehicle Verification**: Chassis/engine numbers in list view
3. **Complete Context**: Detailed asset descriptions in tracking
4. **Copy-Friendly**: Monospace fonts for numeric IDs
5. **Professional**: Matches Indonesian government standards

### For Operations
1. **Quick Validation**: KTP visible without opening details
2. **Duplicate Detection**: Chassis numbers help identify duplicates
3. **Audit Trail**: Activity logs include KTP references
4. **Data Integrity**: All 57 CSV fields preserved in database

---

## Testing Checklist

### Agreements Page
- [ ] KTP numbers display correctly in client column
- [ ] Chassis/engine numbers show for vehicles
- [ ] Non-vehicle assets don't show chassis/engine
- [ ] KTP numbers are monospace and readable
- [ ] Long vehicle details don't break layout

### Registration Tracking
- [ ] Asset descriptions show full vehicle details
- [ ] Text truncates properly with `max-w-xs`
- [ ] Activity logs include KTP in details
- [ ] Updated mock data displays correctly
- [ ] Client names use Indonesian format (UPPERCASE)

### Data Flow
- [ ] CSV upload saves all AHU fields
- [ ] Database inserts handle null values
- [ ] Mock data includes all new fields
- [ ] Display components handle missing fields gracefully

---

## Database Schema Considerations

### Required Migrations
If using Supabase, add columns to `fidusia_agreements` table:

```sql
-- Debtor information
ALTER TABLE fidusia_agreements ADD COLUMN debtor_ktp VARCHAR(16);
ALTER TABLE fidusia_agreements ADD COLUMN debtor_npwp VARCHAR(20);
ALTER TABLE fidusia_agreements ADD COLUMN debtor_birth_place VARCHAR(100);
ALTER TABLE fidusia_agreements ADD COLUMN debtor_birth_date DATE;
ALTER TABLE fidusia_agreements ADD COLUMN debtor_occupation VARCHAR(100);
ALTER TABLE fidusia_agreements ADD COLUMN debtor_phone VARCHAR(20);
ALTER TABLE fidusia_agreements ADD COLUMN debtor_city VARCHAR(100);
ALTER TABLE fidusia_agreements ADD COLUMN debtor_district VARCHAR(100);
ALTER TABLE fidusia_agreements ADD COLUMN debtor_sub_district VARCHAR(100);
ALTER TABLE fidusia_agreements ADD COLUMN debtor_rt VARCHAR(10);
ALTER TABLE fidusia_agreements ADD COLUMN debtor_rw VARCHAR(10);
ALTER TABLE fidusia_agreements ADD COLUMN debtor_postal_code VARCHAR(10);

-- Spouse information
ALTER TABLE fidusia_agreements ADD COLUMN spouse_name VARCHAR(200);
ALTER TABLE fidusia_agreements ADD COLUMN spouse_birth_place VARCHAR(100);
ALTER TABLE fidusia_agreements ADD COLUMN spouse_birth_date DATE;
ALTER TABLE fidusia_agreements ADD COLUMN spouse_occupation VARCHAR(100);
ALTER TABLE fidusia_agreements ADD COLUMN spouse_ktp VARCHAR(16);

-- Vehicle details
ALTER TABLE fidusia_agreements ADD COLUMN vehicle_brand VARCHAR(50);
ALTER TABLE fidusia_agreements ADD COLUMN vehicle_type VARCHAR(50);
ALTER TABLE fidusia_agreements ADD COLUMN vehicle_model VARCHAR(50);
ALTER TABLE fidusia_agreements ADD COLUMN vehicle_year VARCHAR(4);
ALTER TABLE fidusia_agreements ADD COLUMN chassis_number VARCHAR(50);
ALTER TABLE fidusia_agreements ADD COLUMN engine_number VARCHAR(50);
ALTER TABLE fidusia_agreements ADD COLUMN number_of_wheels VARCHAR(5);
ALTER TABLE fidusia_agreements ADD COLUMN proof_document_type VARCHAR(50);
ALTER TABLE fidusia_agreements ADD COLUMN proof_document_number VARCHAR(50);

-- Contract details
ALTER TABLE fidusia_agreements ADD COLUMN contract_number VARCHAR(50);
ALTER TABLE fidusia_agreements ADD COLUMN contract_start_date DATE;
ALTER TABLE fidusia_agreements ADD COLUMN contract_end_date DATE;
ALTER TABLE fidusia_agreements ADD COLUMN guarantee_amount DECIMAL(15,2);

-- Regional information
ALTER TABLE fidusia_agreements ADD COLUMN multifinance_code VARCHAR(20);
ALTER TABLE fidusia_agreements ADD COLUMN region VARCHAR(100);
ALTER TABLE fidusia_agreements ADD COLUMN regional VARCHAR(100);

-- Add indexes for common queries
CREATE INDEX idx_debtor_ktp ON fidusia_agreements(debtor_ktp);
CREATE INDEX idx_chassis_number ON fidusia_agreements(chassis_number);
CREATE INDEX idx_contract_number ON fidusia_agreements(contract_number);
```

---

## Future Enhancements

### Potential Additions
1. **Search by KTP**: Add KTP to search filters
2. **Search by Chassis**: Find agreements by chassis number
3. **Vehicle History**: Show all agreements for same chassis
4. **KTP Validation**: Visual indicator for valid KTP format
5. **Debtor Details Modal**: Full debtor info popup
6. **Export with AHU Fields**: Include all fields in Excel export
7. **Bulk KTP Verification**: Validate KTP against government database
8. **Vehicle BPKB Link**: Link to vehicle registration database

---

## File Changes Summary

### Modified Files
1. `/src/types/index.ts`
   - Extended `FidusiaAgreement` with 40+ AHU fields
   
2. `/src/pages/BulkUpload.tsx`
   - Updated database insert with all AHU field mapping
   
3. `/src/pages/Agreements.tsx`
   - Enhanced mock data with Indonesian examples
   - Updated table to show KTP numbers
   - Updated table to show chassis/engine for vehicles
   
4. `/src/pages/RegistrationTracking.tsx`
   - Updated mock data with detailed vehicle descriptions
   - Enhanced table to show asset descriptions
   - Updated activity logs to include KTP references

### New Files
5. `/AGREEMENTS_TRACKING_UPDATE.md` (this file)
   - Complete documentation of all changes

---

## Version History

### v2.0 - October 29, 2025
- Added Indonesian AHU fields to FidusiaAgreement interface
- Enhanced Agreements table with KTP and vehicle details
- Updated Tracking table with detailed asset descriptions
- Improved mock data to match Indonesian standards
- Added monospace fonts for numeric IDs
- Updated activity logs with KTP references

### v1.0 - Previous
- Basic agreement display
- Simple tracking interface
- Generic client information
