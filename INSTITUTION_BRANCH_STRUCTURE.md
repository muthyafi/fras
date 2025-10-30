# Institution & Branch Structure

## Overview

The FRAS system supports **multi-branch multifinance institutions**. Each institution (e.g., PT Adira Finance) can have multiple branch offices across different cities.

---

## Data Model

### 1. Institution (Head Office)
Represents the main multifinance company.

**Fields:**
- `id` - Unique identifier
- `name` - Institution name (e.g., "PT Adira Finance")
- `registrationNumber` - NPP/SIUP number
- `email` - Head office email
- `phone` - Head office phone
- `address` - Head office address
- `city` - Head office city
- `province` - Head office province
- `director` - Director name
- `totalBranches` - Count of active branches
- `isActive` - Active status

**Example:**
```json
{
  "id": "inst-001",
  "name": "PT Adira Finance",
  "registrationNumber": "NPP-001234567",
  "email": "headoffice@adira.co.id",
  "phone": "021-12345678",
  "address": "Menara Batavia Lt. 5",
  "city": "Jakarta Pusat",
  "province": "DKI Jakarta",
  "director": "John Doe",
  "totalBranches": 25,
  "isActive": true
}
```

---

### 2. Institution Branch
Represents a regional/city branch office.

**Fields:**
- `id` - Unique branch identifier
- `institutionId` - Parent institution ID
- `institutionName` - Denormalized for display
- `branchCode` - Short code (e.g., "BDG-01", "JKT-02")
- `branchName` - Branch name (e.g., "Bandung Dago", "Jakarta Sudirman")
- `city` - Branch city
- `province` - Branch province
- `address` - Full address
- `phone` - Branch phone
- `managerName` - Branch manager
- `totalAgreements` - Count of agreements from this branch
- `isActive` - Active status

**Example:**
```json
{
  "id": "br-001",
  "institutionId": "inst-001",
  "institutionName": "PT Adira Finance",
  "branchCode": "BDG-01",
  "branchName": "Bandung Dago",
  "city": "Bandung",
  "province": "Jawa Barat",
  "address": "Jl. Ir. H. Juanda No. 123",
  "phone": "022-87654321",
  "managerName": "Jane Smith",
  "totalAgreements": 45,
  "isActive": true
}
```

---

### 3. Fidusia Agreement (with Branch)
Each agreement is linked to both an institution and a specific branch.

**New Fields:**
- `branchId` - Branch where agreement was created
- `branchName` - Denormalized branch name
- `branchCode` - Branch code for filtering

**Example:**
```json
{
  "agreementNumber": "FID-2025-001",
  "institutionId": "inst-001",
  "institutionName": "PT Adira Finance",
  "branchId": "br-001",
  "branchName": "Bandung Dago",
  "branchCode": "BDG-01",
  "clientName": "PT Maju Jaya",
  "assetDescription": "Toyota Avanza 2024"
}
```

---

## Branch Naming Convention

### Branch Codes
Format: `{CITY_CODE}-{NUMBER}`

**Examples:**
- `JKT-01` - Jakarta branch #1
- `JKT-02` - Jakarta branch #2
- `BDG-01` - Bandung branch #1
- `SBY-01` - Surabaya branch #1
- `MLG-01` - Malang branch #1

**Common City Codes:**
- `JKT` - Jakarta
- `BDG` - Bandung
- `SBY` - Surabaya
- `SMG` - Semarang
- `YOG` - Yogyakarta
- `MDN` - Medan
- `MLG` - Malang
- `DPS` - Denpasar
- `MKS` - Makassar
- `PLB` - Palembang

### Branch Names
Format: `{City Name} {District/Area}`

**Examples:**
- "Jakarta Sudirman"
- "Jakarta Thamrin"
- "Bandung Dago"
- "Bandung Pasteur"
- "Surabaya Tunjungan"
- "Surabaya Darmo"

---

## UI Display

### Agreements Page
**Client Column:**
```
PT Maju Jaya
PT Adira Finance • Bandung Dago
```

### Tracking Page
**Agreement Column:**
```
FID-2025-001
PT Maju Jaya • BDG-01
```

### Detail Modal
**Client & Institution Section:**
```
Client Name:     PT Maju Jaya
Institution:     PT Adira Finance
Branch:          Bandung Dago
Branch Code:     BDG-01
```

---

## Business Logic

### 1. Agreement Creation
- User selects institution from dropdown
- System shows branches for that institution
- User selects specific branch
- Agreement is tagged with both institution and branch

### 2. Reporting & Analytics
- Filter agreements by:
  - Institution (all branches)
  - Specific branch
  - City
  - Province

### 3. Performance Tracking
- Top institutions by total agreements
- Top branches by total agreements
- Regional performance analysis

### 4. User Access Control
- Head office users: Access all branches
- Branch users: Access only their branch
- Regional managers: Access branches in their region

---

## Example Scenarios

### Scenario 1: PT Adira Finance Structure
```
PT Adira Finance (Head Office - Jakarta)
├── Jakarta Sudirman (JKT-01) - 45 agreements
├── Jakarta Thamrin (JKT-02) - 38 agreements
├── Bandung Dago (BDG-01) - 32 agreements
├── Bandung Pasteur (BDG-02) - 28 agreements
├── Surabaya Tunjungan (SBY-01) - 41 agreements
└── Surabaya Darmo (SBY-02) - 35 agreements
Total: 219 agreements across 6 branches
```

### Scenario 2: Agreement Tracking
```
Agreement: FID-2025-001
Client: PT Maju Jaya
Created by: PT Adira Finance - Bandung Dago (BDG-01)
Status: Active
Certificate: W7.00123456

This shows:
- Which institution manages the agreement
- Which branch created it
- Where to send notifications
- Regional performance metrics
```

---

## Database Relationships

```
Institution (1)
    ↓
    has many
    ↓
InstitutionBranch (N)
    ↓
    has many
    ↓
FidusiaAgreement (N)
```

---

## Benefits

1. **Granular Reporting** - Performance by branch, not just institution
2. **Better Support** - Know which branch to contact for specific agreements
3. **Regional Analytics** - Understand geographic distribution
4. **Access Control** - Branch-level permissions
5. **Scalability** - Institutions can expand without data structure changes
6. **Audit Trail** - Track which branch created each agreement

---

## Future Enhancements

1. **Branch Dashboard** - Per-branch statistics and performance
2. **Branch Comparison** - Compare branches within same institution
3. **Regional Reporting** - Aggregate by province/city
4. **Branch Transfer** - Move agreements between branches
5. **Branch Manager Portal** - Dedicated view for branch managers
6. **Branch Performance KPIs** - Monthly/quarterly metrics per branch
