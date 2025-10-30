# Fidusia CSV Format Update - Indonesian AHU Standard

## Overview
Updated the Bulk Upload feature to use the official Indonesian AHU (Administrasi Hukum Umum) fidusia registration CSV format with 57 fields.

## Date
January 2025

---

## Changes Made

### 1. Type Definitions (`/src/types/index.ts`)

#### New Type: `FidusiaCSVData`
Added complete 57-field interface matching Indonesian AHU requirements:

**Contract Fields:**
- `JENIS_KATEGORI_FIDUSA` - Fidusia category type
- `JENIS_PENGGUNA` - User type
- `TGL_SURAT_KUASA` - Power of attorney date
- `BERDASARKAN_PERJANJIAN` - Agreement basis
- `NOMOR_KONTRAK` - Contract number
- `TGL_AWAL_PERJANJIAN` - Start date
- `TGL_AKHIR_PERJANJIAN` - End date
- `NILAI_PENJAMINAN` - Guarantee amount
- `NILAI_PENJAMINAN_FIDUSIA` - Fidusia guarantee amount

**Vehicle/Object Fields:**
- `MERK` - Brand
- `TYPE` - Type
- `MODEL` - Model
- `TAHUN_PEMBUATAN` - Manufacturing year
- `NOMOR_RANGKA` - Chassis number
- `NOMOR_MESIN` - Engine number
- `JUMLAH_RODA` - Number of wheels
- `JENIS_BUKTI_OBJEK` - Proof document type
- `NO_BUKTI_OBJEK` - Proof document number
- `NILAI_OBJEK` - Object value

**Primary Debtor (DEBITUR) Fields:**
- `PANGGILAN_DEBITUR` - Title (Mr./Mrs.)
- `KEWARGANEGARAAN_DEBITUR` - Citizenship
- `NAMA_DEBITUR` - Full name
- `TEMPAT_LAHIR_FIDUSIA` - Birth place
- `TANGGAL_LAHIR_DEBITUR` - Birth date
- `PEKERJAAN_DEBITUR` - Occupation
- `ALAMAT_DEBITUR` - Address
- `KABKOTA_DEBITUR` - City/Regency
- `KECAMATAN_DEBITUR` - District
- `KELURAHAN_DEBITUR` - Sub-district
- `RT_DEBITUR` - RT (neighborhood)
- `RW_DEBITUR` - RW (community)
- `KODE_POS` - Postal code
- `NO_KTP_DEBITUR` - KTP (ID card) number
- `NPWP` - Tax ID number
- `NO_SK` - Decree number
- `NO_PASPOR` - Passport number
- `NEGARA_PASPOR` - Passport country
- `NO_TELEPON` - Phone number

**Spouse (PASANGAN) Fields:**
- `NAMA_PASANGAN` - Spouse name
- `TEMPAT_LAHIR_PASANGAN` - Spouse birth place
- `TANGGAL_LAHIR_PASANGAN` - Spouse birth date
- `PEKERJAAN_PASANGAN` - Spouse occupation
- `NO_KTP_PASANGAN` - Spouse KTP number

**Secondary Debtor Fields:**
- `PANGGILAN_DEBITUR_SEC` - Secondary debtor title
- `NAMA_DEBITUR_SEC` - Secondary debtor name
- `TEMPAT_LAHIR_DEBITUR_SEC` - Secondary debtor birth place
- `TANGGAL_LAHIR_DEBITUR_SEC` - Secondary debtor birth date
- `PEKERJAAN_DEBITUR_SEC` - Secondary debtor occupation
- `ALAMAT_DEBITUR_SEC` - Secondary debtor address
- `KELURAHAN_DEBITUR_SEC` - Secondary debtor sub-district
- `RT_DEBITUR_SEC` - Secondary debtor RT
- `RW_DEBITUR_SEC` - Secondary debtor RW
- `NO_KTP_DEBITUR_SEC` - Secondary debtor KTP
- `KODE_POS_SEC` - Secondary debtor postal code

**Administrative Fields:**
- `KODE_MULTIFINANCE` - Multifinance company code
- `SERTIFIKAT` - Certificate number
- `WILAYAH` - Region/Province
- `REGIONAL` - Regional office

#### Legacy Type: `CSVClientData`
Kept for backward compatibility but no longer used in BulkUpload.

---

### 2. BulkUpload Component (`/src/pages/BulkUpload.tsx`)

#### CSV Parsing Updates

**Delimiter Change:**
```typescript
Papa.parse(file, {
  header: true,
  delimiter: ';', // Changed from comma to semicolon
  skipEmptyLines: true,
  // ...
})
```

**Type Updates:**
- Changed all `CSVClientData` references to `FidusiaCSVData`
- Updated preview state: `useState<FidusiaCSVData[]>([])`

#### Validation Function

**New Function: `validateFidusiaData()`**
Replaces `validateClientData()` with Indonesian-specific validations:

**Required Fields Validation:**
- Debtor name (`NAMA_DEBITUR`)
- KTP number (`NO_KTP_DEBITUR`) - must be 16 digits
- Address (`ALAMAT_DEBITUR`)
- Birth place (`TEMPAT_LAHIR_FIDUSIA`)
- Birth date (`TANGGAL_LAHIR_DEBITUR`)
- Contract number (`NOMOR_KONTRAK`)
- Loan amount (`NILAI_PENJAMINAN`) - must be numeric
- Vehicle brand (`MERK`)
- Vehicle type (`TYPE`)
- Chassis number (`NOMOR_RANGKA`)
- Engine number (`NOMOR_MESIN`)
- Manufacturing year (`TAHUN_PEMBUATAN`)
- Object value (`NILAI_OBJEK`) - must be numeric

#### Field Mapping

**Client Creation:**
```typescript
{
  name: row.NAMA_DEBITUR,
  email: `${row.NO_KTP_DEBITUR}@placeholder.com`, // Email not in AHU format
  phone: row.NO_TELEPON || '',
  id_number: row.NO_KTP_DEBITUR,
  address: fullAddress, // Constructed from multiple fields
  city: row.KABKOTA_DEBITUR,
  province: row.WILAYAH,
  postal_code: row.KODE_POS || ''
}
```

**Full Address Construction:**
```typescript
const fullAddress = `${row.ALAMAT_DEBITUR}, RT ${row.RT_DEBITUR}/RW ${row.RW_DEBITUR}, ${row.KELURAHAN_DEBITUR}, ${row.KECAMATAN_DEBITUR}, ${row.KABKOTA_DEBITUR}`.trim()
```

**Vehicle Description:**
```typescript
const vehicleDescription = `${row.MERK} ${row.TYPE} ${row.MODEL} (${row.TAHUN_PEMBUATAN}) - ${row.NOMOR_RANGKA}/${row.NOMOR_MESIN}`
```

**Asset Description for Duplicate Check:**
```typescript
const assetDescription = `${row.MERK} ${row.TYPE} ${row.MODEL} - ${row.NOMOR_RANGKA}`.trim()
```

**AHU Submission:**
```typescript
await submitToAHU({
  clientName: row.NAMA_DEBITUR,
  clientIdNumber: row.NO_KTP_DEBITUR,
  clientAddress: fullAddress,
  assetDescription: vehicleDescription,
  assetType: 'vehicle', // Fixed as vehicle based on AHU format
  assetValue: parseFloat(row.NILAI_OBJEK || '0'),
  loanAmount: parseFloat(row.NILAI_PENJAMINAN || '0'),
  institutionName: 'Institution Name',
  institutionRegistrationNumber: row.KODE_MULTIFINANCE || '1234567890'
})
```

**Agreement Creation:**
```typescript
{
  agreement_number: row.NOMOR_KONTRAK || `FID-${year}-${timestamp}`,
  asset_description: vehicleDescription,
  asset_type: 'vehicle',
  asset_value: parseFloat(row.NILAI_OBJEK || '0'),
  loan_amount: parseFloat(row.NILAI_PENJAMINAN || '0')
  // ... PNBP and registration fields
}
```

#### Preview Table

**Updated Columns:**
1. Contract No (`NOMOR_KONTRAK`)
2. Debtor Name (`NAMA_DEBITUR`)
3. KTP (`NO_KTP_DEBITUR`)
4. Vehicle (`MERK TYPE MODEL`)
5. Chassis No (`NOMOR_RANGKA`)
6. Loan Amount (`NILAI_PENJAMINAN`) - formatted as Indonesian Rupiah

**Display Format:**
```typescript
<td>Rp {parseFloat(row.NILAI_PENJAMINAN || '0').toLocaleString('id-ID')}</td>
```

#### CSV Template

**New Template Function:**
- Generates 57-field header row
- Uses semicolon (`;`) as delimiter
- Includes 2 sample rows with realistic Indonesian data
- File name: `fidusia_registration_template_AHU.csv`

**Sample Data Includes:**
- Complete KTP numbers (16 digits)
- NPWP format (Indonesian tax ID)
- Full Indonesian addresses with RT/RW
- Vehicle data (chassis, engine numbers)
- Multifinance codes
- Regional information

#### UI Updates

**Template Download Section:**
- Updated description to mention 57 fields and semicolon separation
- References Indonesian AHU standard
- Button text: "Download AHU Template"

**Instructions Section:**
- Updated to reference Indonesian AHU format specifics
- Mentions KTP validation (16 digits)
- References vehicle data requirements
- Clarifies regional codes

---

## Data Flow

### 1. CSV Upload
```
User uploads CSV → Papa Parse (delimiter: ';') → FidusiaCSVData[]
```

### 2. Validation
```
For each row:
  - Validate required fields (debtor, vehicle, contract)
  - Check KTP format (16 digits)
  - Validate numeric fields (amounts)
  - Check for existing agreements (KTP + vehicle)
```

### 3. Processing
```
For each valid row:
  - Construct full address from RT/RW/Kelurahan/Kecamatan
  - Build vehicle description
  - Check/create client in database
  - Submit to AHU API
  - Create fidusia_agreement record
  - Track PNBP payment status
```

### 4. Results Display
```
Show summary:
  - Success count
  - Submitted to AHU count
  - Duplicate count
  - Failed count
  - Download VA list for payments
```

---

## Indonesian-Specific Features

### KTP Validation
- Format: 16-digit number
- Example: `3174012005850001`
- Validation: `row.NO_KTP_DEBITUR.length !== 16`

### NPWP Format
- Format: `XX.XXX.XXX.X-XXX.XXX`
- Example: `12.345.678.9-012.000`
- Optional field

### Address Components
Indonesian addresses include hierarchical components:
```
ALAMAT_DEBITUR: Jl. Sudirman No. 123
RT_DEBITUR: 001
RW_DEBITUR: 002
KELURAHAN_DEBITUR: Senayan
KECAMATAN_DEBITUR: Kebayoran Baru
KABKOTA_DEBITUR: Jakarta Selatan
WILAYAH: DKI Jakarta
REGIONAL: Jakarta
KODE_POS: 12190
```

### Vehicle Identification
Required for fidusia registration:
- `NOMOR_RANGKA` (Chassis Number): Unique vehicle identifier
- `NOMOR_MESIN` (Engine Number): Engine serial number
- `MERK` (Brand): Toyota, Honda, etc.
- `TYPE` (Type): Avanza, Civic, etc.
- `MODEL` (Model): G, RS, etc.
- `TAHUN_PEMBUATAN` (Manufacturing Year): 2024

---

## File Changes Summary

### Modified Files
1. `/src/types/index.ts`
   - Added `FidusiaCSVData` interface (57 fields)
   - Kept `CSVClientData` for backward compatibility

2. `/src/pages/BulkUpload.tsx`
   - Updated imports: `FidusiaCSVData` instead of `CSVClientData`
   - Changed delimiter to semicolon (`;`)
   - Replaced validation function
   - Updated field mapping for client creation
   - Updated AHU submission mapping
   - Updated preview table columns
   - Rewrote template generation
   - Updated UI text and instructions

### New Files
3. `/FIDUSIA_CSV_FORMAT_UPDATE.md` (this file)
   - Documentation of all changes
   - Field reference guide
   - Data flow documentation

---

## Testing Checklist

### Template Download
- [ ] Download template generates semicolon-separated CSV
- [ ] All 57 headers present in correct order
- [ ] Sample data rows are valid
- [ ] File name is `fidusia_registration_template_AHU.csv`

### CSV Upload
- [ ] Accepts CSV with semicolon delimiter
- [ ] Parses all 57 fields correctly
- [ ] Shows preview with correct data
- [ ] Handles empty/null values gracefully

### Validation
- [ ] Detects missing required fields
- [ ] Validates KTP length (16 digits)
- [ ] Validates numeric fields (amounts)
- [ ] Checks for duplicate agreements
- [ ] Shows appropriate error messages

### Processing
- [ ] Constructs full Indonesian address correctly
- [ ] Builds vehicle description properly
- [ ] Creates/updates client records
- [ ] Submits to AHU with correct data
- [ ] Creates fidusia_agreement records
- [ ] Tracks PNBP payment status

### UI Display
- [ ] Preview shows relevant columns
- [ ] Currency formatted as Indonesian Rupiah
- [ ] Validation results display correctly
- [ ] Success/failure counts accurate
- [ ] VA list download works

---

## Migration Notes

### Backward Compatibility
- Old `CSVClientData` type still exists but is not used
- Old template format is no longer generated
- Existing agreements in database are not affected
- Only new bulk uploads use the new format

### Data Mapping
Users transitioning from old format to new format need to:
1. Map `name` → `NAMA_DEBITUR`
2. Map `idNumber` → `NO_KTP_DEBITUR`
3. Map `phone` → `NO_TELEPON`
4. Map `address` → `ALAMAT_DEBITUR` (partial)
5. Split address into RT/RW/Kelurahan/Kecamatan components
6. Map `assetDescription` → Vehicle fields (MERK/TYPE/MODEL)
7. Map `loanAmount` → `NILAI_PENJAMINAN`
8. Map `assetValue` → `NILAI_OBJEK`

### Required New Data
Fields that were not in old format:
- KTP number (16 digits)
- Birth place and date
- Full address breakdown (RT/RW/etc.)
- Vehicle details (chassis, engine numbers)
- Spouse information (optional)
- Regional codes
- Multifinance code

---

## API Integration

### AHU Submission Format
The system now sends more complete data to fidusia.ahu.go.id:

**Before:**
- Basic client info
- Simple asset description
- Loan amount

**After:**
- Complete debtor information (KTP, address, birth details)
- Detailed vehicle identification (chassis, engine numbers)
- Full address with RT/RW/regional codes
- Multifinance company code
- Contract details

---

## Future Enhancements

### Potential Improvements
1. **Date Format Validation**: Add Indonesian date format validation (DD-MM-YYYY)
2. **NPWP Validation**: Add format checking for tax ID numbers
3. **Regional Code Validation**: Validate against known Indonesian regions
4. **Spouse Info**: Make spouse fields conditionally required
5. **Secondary Debtor**: Add UI for secondary debtor management
6. **Batch Processing**: Optimize for large CSV files (1000+ rows)
7. **Progress Indicator**: Show row-by-row progress during upload
8. **Error Export**: Allow downloading validation errors as CSV
9. **Template Variants**: Provide templates for different fidusia types
10. **Auto-fill**: Auto-populate regional data based on postal code

---

## Contact & Support

For questions about:
- **AHU Format**: Refer to fidusia.ahu.go.id documentation
- **Field Definitions**: See Indonesian Ministry of Law regulations
- **Implementation**: Review this document and code comments
- **Bugs/Issues**: Check error messages and validation results

---

## Version History

### v2.0 - January 2025
- Complete rewrite to support Indonesian AHU 57-field format
- Semicolon delimiter support
- Indonesian-specific validations (KTP, address)
- Enhanced vehicle identification
- Regional code support

### v1.0 - Previous
- Simple CSV format (12 fields)
- Comma delimiter
- Basic client and asset data
