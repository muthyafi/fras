# Agreements vs Registration Tracking - Page Comparison

## Overview

The system has **two different pages** serving distinct purposes in the Fidusia registration workflow:

---

## 📋 **Agreements Page** (`/agreements`)

### **Purpose**
Master data management for ALL Fidusia agreements (past, present, future)

### **Focus**
**Business & Legal Management** - Full lifecycle of fidusia agreements

### **Data Source**
- `fidusia_agreements` table (Supabase)
- Stores: Agreement details, client info, asset info, loan details
- Long-term storage (months/years)

### **Key Features**
✅ Create new agreements (New Agreement button)
✅ Edit existing agreements
✅ Delete agreements
✅ Search & filter by client, asset, status
✅ View complete agreement details
✅ Track agreement lifecycle (draft → active → expired)

### **Status Types**
- `draft` - Being prepared
- `pending` - Awaiting submission
- `submitted` - Sent to AHU
- `processing` - AHU is processing
- `registered` - Certificate received
- `active` - Valid and enforced
- `expired` - Past validity date
- `rejected` - AHU rejected
- `cancelled` - Terminated early

### **Columns Shown**
| Agreement # | Client | Asset | Loan Amount | Registration # | Status | Validity | Actions |
|-------------|--------|-------|-------------|----------------|--------|----------|---------|
| FID-2025-001 | PT Maju | Toyota Avanza | Rp 200M | AHU-001234 | Active | 2 years | 👁️ ✏️ 🗑️ |

### **Use Cases**
- 📝 Create new fidusia agreement before submission
- 📊 View all agreements (active, expired, cancelled)
- 🔍 Search historical agreements by client or asset
- 📈 Report on total portfolio value
- ✏️ Edit draft agreements before submission
- 📅 Track agreement expiry dates

---

## 🚀 **Registration Tracking Page** (`/tracking`)

### **Purpose**
Real-time monitoring of AHU submission process

### **Focus**
**Submission Workflow & Payment Tracking** - Live status of registration process

### **Data Source**
- `registration_tracking` table (Supabase)
- Stores: Submission status, timestamps, logs, errors
- Short-term operational data (days/weeks)
- **Real-time updates** via websockets

### **Key Features**
✅ Track AHU submission progress in real-time
✅ Monitor PNBP payment status
✅ View/copy VA numbers for payment
✅ Download VA number lists (bulk)
✅ See detailed activity logs
✅ Track retry attempts on failures
✅ Auto-refresh every 30 seconds

### **Status Types**
- `queued` - Waiting to submit
- `submitting` - Currently submitting to AHU
- `submitted` - Successfully submitted to AHU
- `waiting_payment` - PNBP payment pending
- `payment_verified` - PNBP paid, processing certificate
- `processing` - AHU processing registration
- `completed` - Certificate issued ✅
- `failed` - Submission error ❌

### **Columns Shown**
| Agreement # | Status | PNBP VA Number | Certificate # | Submitted | Duration | Actions |
|-------------|--------|----------------|---------------|-----------|----------|---------|
| FID-2025-002 | 🟠 Waiting Payment | 8808987... 📋 Rp 50K | - | 2h ago | - | 👁️ |
| FID-2025-001 | 🟢 Completed | 8808123... ✅ | W7.001234 | 4h ago | 2h 30m | 👁️ 📥 |

### **Unique Features**
- ⏱️ **Real-time status updates**
- 📋 **Copy VA number** with one click
- 📥 **Download all VA numbers** as CSV
- 🔄 **Auto-refresh** tracking data
- 📊 **Activity timeline** for each submission
- ⚠️ **Error logs** with retry counts
- ⏳ **Duration tracking** from submit to complete

### **Use Cases**
- 👀 Monitor bulk upload submission progress
- 💳 Get VA numbers for PNBP payment
- 📥 Download VA list for distribution
- 🐛 Debug failed submissions
- 📊 Track processing times
- ✅ Verify certificate issuance
- 🔄 Monitor retry attempts

---

## 🔄 **Relationship Between Pages**

```
┌─────────────────────┐
│  Agreements Page    │  (Master Data)
│                     │
│  1. Create agreement│
│  2. Store details   │
└──────────┬──────────┘
           │
           ▼
     [Submit to AHU]
           │
           ▼
┌──────────┴──────────┐
│ Registration        │  (Process Tracking)
│ Tracking Page       │
│                     │
│  1. Track submission│
│  2. Monitor payment │
│  3. Get certificate │
└─────────────────────┘
```

### **Data Flow**
1. **Agreements**: Create/store agreement → `fidusia_agreements` table
2. **Trigger**: Submit to AHU via Bulk Upload
3. **Tracking**: Record created → `registration_tracking` table
4. **Monitor**: Real-time status updates on Tracking page
5. **Complete**: Certificate received → Update agreement status
6. **Back to Agreements**: Status becomes `active`

---

## 🎯 **When to Use Each Page**

### Use **Agreements Page** when you want to:
- ✏️ Create a new fidusia agreement
- 📋 View all your agreements (portfolio)
- 🔍 Search for a specific client's agreements
- 📊 Generate reports on total loans
- 📅 Check expiry dates
- ✏️ Edit draft agreements
- 📈 Analyze business data

### Use **Registration Tracking Page** when you want to:
- 👀 Watch submissions in progress
- 💰 Get VA numbers to pay PNBP
- 📥 Download VA lists for accounting
- ⚠️ Check if submission failed
- ⏱️ See how long processing takes
- ✅ Verify certificate was issued
- 🔄 Monitor bulk upload status

---

## 📊 **Data Comparison**

| Aspect | Agreements | Tracking |
|--------|-----------|----------|
| **Scope** | All agreements (lifetime) | Active submissions only |
| **Updates** | Manual/occasional | Real-time/automatic |
| **Duration** | Years | Days/weeks |
| **Actions** | CRUD operations | View/monitor only |
| **Payment** | Shows final status | Shows live VA & payment |
| **Certificate** | Final storage | Download link |
| **Logs** | Basic history | Detailed timeline |
| **Focus** | Business data | Technical process |

---

## 🏗️ **Technical Differences**

### Agreements Page
```typescript
interface FidusiaAgreement {
  id: string
  agreementNumber: string
  clientId: string
  assetDescription: string
  assetValue: number
  loanAmount: number
  status: 'draft' | 'pending' | 'active' | 'expired' | ...
  registrationNumber?: string
  certificateUrl?: string
  createdAt: string
  expiryDate?: string
  // Business-focused fields
}
```

### Tracking Page
```typescript
interface RegistrationTracking {
  id: string
  agreementId: string  // Links to agreement
  agreementNumber: string
  status: 'queued' | 'submitting' | 'waiting_payment' | ...
  submittedAt: string
  completedAt?: string
  pnbpAmount: number
  pnbpVaNumber: string  // For payment
  pnbpPaymentStatus: 'unpaid' | 'paid'
  retryCount: number
  errorMessage?: string
  logs: ActivityLog[]  // Detailed timeline
  // Process-focused fields
}
```

---

## 🎨 **UI/UX Differences**

### Agreements Page
- 📋 **Clean table** for browsing
- ➕ **"New Agreement"** button prominent
- 🔍 **Search/filter** by client, status
- ✏️ **Edit/Delete** actions available
- 📊 **Stats**: Total agreements, active, pending, value

### Tracking Page  
- 🔄 **Auto-refresh** indicator
- 📥 **Download VA List** button
- 📋 **Copy VA** buttons per row
- ⚠️ **Error alerts** highlighted
- 📊 **Stats**: Queued, submitting, completed, failed
- 🕐 **Duration** calculations
- 📜 **Activity logs** in detail modal

---

## 💡 **Real-World Analogy**

### **Agreements Page** = Library Catalog
- All books ever owned
- Can add, edit, remove books
- Search by title, author
- See which are borrowed, available, lost

### **Tracking Page** = Package Tracking
- Only packages currently in transit
- Real-time location updates
- Payment status
- Delivery confirmation
- Error notifications

---

## ✨ **Recommendation**

For **optimal user experience**, both pages are necessary:

1. **Start** at **Agreements** to create/manage agreements
2. **Submit** via Bulk Upload (triggers tracking)
3. **Monitor** at **Tracking** for real-time progress
4. **Get VA** from Tracking to pay PNBP
5. **Verify** completion at Tracking
6. **Return** to Agreements to see final active status

This separation provides:
- ✅ Clear separation of concerns
- ✅ Better performance (tracking doesn't load all historical data)
- ✅ Focused UX for different tasks
- ✅ Real-time updates without impacting master data
