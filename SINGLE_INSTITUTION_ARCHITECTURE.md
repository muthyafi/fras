# FRAS - Single Institution, Multi-Branch Architecture

## System Overview

**FRAS (Fidusia Registration & Agreement System)** is designed for **ONE multifinance institution** (e.g., PT Adira Finance) with **multiple branch offices** across Indonesia.

---

## Key Principles

1. **Single Institution** - The entire system serves ONE multifinance company
2. **Multi-Branch** - The institution has many branch offices (Jakarta, Bandung, Surabaya, etc.)
3. **Branch Autonomy** - Each branch can manage their own agreements and bulk uploads
4. **Centralized Visibility** - Head office (main branch admin) can see ALL data from ALL branches
5. **Branch Isolation** - Branch users only see their own branch data

---

## User Roles

### 1. Super Admin (Head Office)
**Access Level:** ALL BRANCHES

**Capabilities:**
- View all agreements from all branches
- View all tracking submissions from all branches
- See branch performance comparison
- Access all reports and analytics
- Manage branch settings
- Manage all users

**Dashboard Shows:**
- Total agreements across all branches
- Top performing branches
- Regional distribution
- System-wide statistics

---

### 2. Branch Admin
**Access Level:** SINGLE BRANCH ONLY

**Capabilities:**
- View agreements from their branch only
- Create new agreements
- Bulk upload for their branch
- Submit agreements to AHU
- View tracking for their submissions
- Manage their branch users
- Branch-specific reports

**Dashboard Shows:**
- Branch-specific statistics
- Branch performance
- Branch submissions
- Branch comparisons (limited)

---

### 3. Branch User (Operator)
**Access Level:** SINGLE BRANCH ONLY

**Capabilities:**
- View agreements from their branch
- Create new agreements
- Upload bulk submissions
- Track submissions
- Limited reporting

---

## Data Structure

### Institution (Single Instance)
```typescript
{
  id: "main-institution",
  name: "PT Adira Finance",
  registrationNumber: "NPP-001234567",
  email: "headoffice@adira.co.id",
  phone: "021-12345678",
  address: "Menara Batavia Lt. 5, Jakarta",
  director: "John Doe",
  totalBranches: 25,
  isActive: true
}
```

### Branches (Multiple Instances)
```typescript
{
  id: "branch-001",
  branchCode: "BDG-01",
  branchName: "Bandung Dago",
  city: "Bandung",
  province: "Jawa Barat",
  address: "Jl. Ir. H. Juanda No. 123",
  phone: "022-87654321",
  managerName: "Jane Smith",
  email: "bandung.dago@adira.co.id",
  isHeadOffice: false,
  totalAgreements: 145,
  isActive: true
}
```

### User with Branch Assignment
```typescript
{
  id: "user-001",
  name: "Jane Smith",
  email: "jane@adira.co.id",
  role: "branch_admin", // or "super_admin", "branch_user"
  branchId: "branch-001", // null for super_admin
  branchCode: "BDG-01",
  branchName: "Bandung Dago",
  isActive: true
}
```

### Agreement with Branch
```typescript
{
  agreementNumber: "FID-BDG-2025-001", // Branch code in number
  branchId: "branch-001",
  branchCode: "BDG-01",
  branchName: "Bandung Dago",
  clientName: "PT Maju Jaya",
  assetDescription: "Toyota Avanza 2024",
  status: "active",
  createdBy: "user-001",
  createdByName: "Jane Smith"
}
```

### Bulk Upload with Branch
```typescript
{
  id: "bulk-001",
  batchId: "BATCH-BDG-2025-001",
  batchName: "Bandung October Batch",
  branchId: "branch-001",
  branchCode: "BDG-01",
  totalRecords: 50,
  successCount: 48,
  failedCount: 2,
  uploadedBy: "user-001",
  uploadedAt: "2025-10-29T08:00:00Z"
}
```

---

## Access Control Implementation

### Row-Level Security (RLS) in Supabase

**For Branch Users:**
```sql
-- Branch users can only see their branch data
CREATE POLICY "Branch users see own branch"
ON fidusia_agreements
FOR SELECT
USING (
  auth.jwt() ->> 'branchId' = branchId
  OR 
  auth.jwt() ->> 'role' = 'super_admin'
);
```

**For Super Admin:**
```sql
-- Super admin sees everything
CREATE POLICY "Super admin sees all"
ON fidusia_agreements
FOR ALL
USING (
  auth.jwt() ->> 'role' = 'super_admin'
);
```

---

## UI Behavior by Role

### Super Admin View

**Dashboard:**
```
┌─────────────────────────────────────────┐
│  FRAS Dashboard - PT Adira Finance      │
│  All Branches View                      │
├─────────────────────────────────────────┤
│  Total Agreements: 1,245                │
│  Active Branches: 25                    │
│  Pending Submissions: 67                │
│  Awaiting Payment: 23                   │
├─────────────────────────────────────────┤
│  Top Branches:                          │
│  1. Jakarta Sudirman (JKT-01) - 145     │
│  2. Bandung Dago (BDG-01) - 132         │
│  3. Surabaya Tunjungan (SBY-01) - 128   │
├─────────────────────────────────────────┤
│  Filter: [All Branches ▼]               │
└─────────────────────────────────────────┘
```

**Agreements Page:**
- Shows agreements from ALL branches
- Filter dropdown: "All Branches" or select specific branch
- Branch column always visible
- Can edit/delete any agreement

**Tracking Page:**
- Shows submissions from ALL branches
- Batch filter includes all batches from all branches
- Can download VA lists for any branch

---

### Branch Admin/User View

**Dashboard:**
```
┌─────────────────────────────────────────┐
│  FRAS Dashboard - PT Adira Finance      │
│  Bandung Dago Branch (BDG-01)           │
├─────────────────────────────────────────┤
│  Total Agreements: 132                  │
│  Active: 98                             │
│  Pending Submissions: 8                 │
│  Awaiting Payment: 5                    │
├─────────────────────────────────────────┤
│  Branch Performance:                    │
│  This Month: +12 agreements             │
│  vs Average: +5.2%                      │
│  Ranking: #2 of 25 branches             │
└─────────────────────────────────────────┘
```

**Agreements Page:**
- Shows ONLY their branch agreements
- No branch filter (automatic)
- Branch name shown in header
- Can only edit/delete their branch data

**Bulk Upload:**
- Uploaded files automatically tagged with their branch
- Batch name includes branch code
- Can only see their branch batches

---

## Agreement Numbering Convention

### Format: `FID-{BRANCH}-{YEAR}-{SEQ}`

**Examples:**
- `FID-BDG-2025-001` - Bandung branch, first agreement of 2025
- `FID-JKT-2025-123` - Jakarta branch, 123rd agreement of 2025
- `FID-SBY-2025-045` - Surabaya branch, 45th agreement of 2025

**Benefits:**
- Easy to identify which branch created it
- Unique across entire institution
- Sequential per branch per year
- Human-readable

---

## Batch Naming Convention

### Format: `{BRANCH}-{MONTH}-BATCH-{SEQ}`

**Examples:**
- `BDG-OCT-BATCH-01` - Bandung, October, first batch
- `JKT-OCT-BATCH-03` - Jakarta, October, third batch
- `SBY-NOV-BATCH-01` - Surabaya, November, first batch

---

## Branch List Examples

### PT Adira Finance Branches

**Jakarta (5 branches):**
- JKT-01: Jakarta Sudirman
- JKT-02: Jakarta Thamrin
- JKT-03: Jakarta Gatot Subroto
- JKT-04: Jakarta Kuningan
- JKT-05: Jakarta Kemang

**Bandung (3 branches):**
- BDG-01: Bandung Dago
- BDG-02: Bandung Pasteur
- BDG-03: Bandung Soekarno Hatta

**Surabaya (3 branches):**
- SBY-01: Surabaya Tunjungan
- SBY-02: Surabaya Darmo
- SBY-03: Surabaya Rungkut

**Other Cities:**
- SMG-01: Semarang Simpang Lima
- YOG-01: Yogyakarta Malioboro
- MLG-01: Malang Ijen
- MDN-01: Medan Gatot Subroto
- MKS-01: Makassar Panakkukang
- DPS-01: Denpasar Renon
- PLB-01: Palembang Sudirman

**Total: 25 branches**

---

## Reports & Analytics

### Super Admin Reports

1. **All Branches Performance**
   - Agreements per branch
   - Success rate by branch
   - Regional distribution
   - Monthly trends per branch

2. **Branch Comparison**
   - Top 10 branches
   - Bottom 5 branches
   - Growth rate comparison
   - Efficiency metrics

3. **Consolidated Reports**
   - Total portfolio value
   - Total active agreements
   - Payment collection rates
   - Certificate issuance rates

---

### Branch Reports

1. **Branch Performance**
   - Monthly statistics
   - Agreement breakdown by status
   - Client analysis
   - Asset type distribution

2. **Branch vs Average**
   - Compare to institution average
   - Ranking among branches
   - Growth trends

3. **Branch Operations**
   - Pending submissions
   - Payment tracking
   - Certificate status

---

## Login Flow

```
User logs in
    ↓
System checks role
    ↓
    ├── Super Admin
    │   ├── Set branchFilter = "all"
    │   ├── Show all branches dropdown
    │   └── Load all data
    │
    └── Branch User/Admin
        ├── Set branchFilter = user.branchId
        ├── Hide branch filter (auto-applied)
        └── Load branch-specific data
```

---

## Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'branch_admin', 'branch_user')),
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### branches
```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY,
  branch_code TEXT UNIQUE,
  branch_name TEXT,
  city TEXT,
  province TEXT,
  address TEXT,
  phone TEXT,
  manager_name TEXT,
  is_head_office BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### fidusia_agreements
```sql
CREATE TABLE fidusia_agreements (
  id UUID PRIMARY KEY,
  agreement_number TEXT UNIQUE,
  branch_id UUID REFERENCES branches(id),
  branch_code TEXT,
  branch_name TEXT, -- denormalized
  client_name TEXT,
  asset_description TEXT,
  status TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### bulk_uploads
```sql
CREATE TABLE bulk_uploads (
  id UUID PRIMARY KEY,
  batch_id TEXT UNIQUE,
  batch_name TEXT,
  branch_id UUID REFERENCES branches(id),
  branch_code TEXT,
  total_records INTEGER,
  success_count INTEGER,
  failed_count INTEGER,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Environment Configuration

### .env file
```env
# Institution Info
VITE_INSTITUTION_NAME="PT Adira Finance"
VITE_INSTITUTION_CODE="ADIRA"
VITE_INSTITUTION_LOGO="/logo.png"

# Default Branch (for development)
VITE_DEFAULT_BRANCH_ID="branch-001"
VITE_DEFAULT_BRANCH_CODE="BDG-01"

# Feature Flags
VITE_MULTI_INSTITUTION=false
VITE_SINGLE_INSTITUTION=true
```

---

## Navigation Structure

### Super Admin Menu
```
📊 Dashboard (All Branches)
📄 Agreements (All Branches)
🔄 Tracking (All Branches)
👥 Clients (All Branches)
📤 Bulk Upload (Select Branch)
🏢 Branches (Manage)
👤 Users (Manage)
📊 Reports (Consolidated)
⚙️  Settings
```

### Branch User Menu
```
📊 Dashboard (My Branch)
📄 Agreements (My Branch)
🔄 Tracking (My Branch)
👥 Clients (My Branch)
📤 Bulk Upload (My Branch)
📊 Reports (My Branch)
⚙️  Settings
```

---

## Benefits of This Architecture

1. **Simplicity** - No institution selection, single institution hardcoded
2. **Branch Focus** - Clear branch ownership of data
3. **Security** - Automatic branch-level filtering
4. **Scalability** - Easy to add new branches
5. **Performance** - Smaller data sets per branch user
6. **Clarity** - Clear data ownership and responsibility
7. **Analytics** - Easy to compare branch performance

---

## Implementation Priority

### Phase 1: Core Structure ✅
- [x] Add branch fields to types
- [x] Update mock data with branches
- [x] Show branch in UI

### Phase 2: Access Control
- [ ] Add user roles
- [ ] Implement branch filtering
- [ ] Add RLS policies

### Phase 3: Branch Management
- [ ] Branch selection for super admin
- [ ] Branch-specific dashboards
- [ ] Branch comparison reports

### Phase 4: Advanced Features
- [ ] Branch performance KPIs
- [ ] Branch vs branch comparison
- [ ] Regional analytics
- [ ] Branch manager portal
