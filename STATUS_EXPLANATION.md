# Status Fields Explanation

## Two Different Status Systems

The FRAS system uses **two different status fields** for different purposes:

### 1. **Agreement Status** (Agreements Page)
**Purpose:** Tracks the **lifecycle of the Fidusia Agreement** from creation to expiry.

**Field:** `FidusiaAgreement.status`

**Values:**
- `draft` - Agreement being prepared, not yet finalized
- `pending` - Agreement finalized, ready to submit to AHU
- `submitted` - Agreement has been submitted to AHU
- `processing` - AHU is processing the registration
- `registered` - Certificate issued by AHU
- `active` - Certificate is valid and active
- `expired` - Certificate has expired
- `rejected` - AHU rejected the submission
- `cancelled` - Agreement was cancelled

**Use Case:** Portfolio management, agreement lifecycle tracking, business reporting

---

### 2. **Registration Tracking Status** (Tracking Page)
**Purpose:** Tracks the **real-time process** of submitting to AHU and getting the certificate.

**Field:** `RegistrationTracking.status`

**Values:**
- `queued` - In queue, waiting to be submitted
- `submitting` - Currently submitting to AHU portal
- `submitted` - Successfully submitted to AHU
- `waiting_payment` - Waiting for PNBP payment
- `payment_verified` - Payment confirmed, processing continues
- `processing` - AHU is processing the registration
- `completed` - Certificate issued successfully
- `failed` - Submission or processing failed

**Use Case:** Real-time monitoring, troubleshooting submission issues, immediate action tracking

---

## How They Work Together

```
AGREEMENTS PAGE (Business View)          TRACKING PAGE (Technical View)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. draft                                 (not in tracking yet)
   ↓
2. pending                               (not in tracking yet)
   ↓
3. submitted ─────────────────────────→  queued → submitting → submitted
   (Agreement sent to                    (Starts real-time tracking)
   AHU submission queue)                 
                                         ↓
                                         waiting_payment
                                         ↓
                                         payment_verified
                                         ↓
4. processing ←──────────────────────    processing
   (Agreement status updates             (AHU processing registration)
   when payment verified)
                                         ↓
5. registered ←──────────────────────    completed
   (Agreement status updates             (Certificate issued)
   when certificate issued)

6. active 
   (Certificate is active and valid)

7. expired 
   (After expiry date passes)
```

### Status Synchronization Rules:

1. **Agreement: "submitted"** 
   - ✅ Creates entry in Tracking with status: **"queued"**
   - Tracking then progresses: queued → submitting → submitted → waiting_payment

2. **Agreement: "processing"**
   - ✅ Syncs when Tracking status: **"payment_verified"** or **"processing"**
   - Means PNBP paid, AHU is now processing

3. **Agreement: "registered"**
   - ✅ Syncs when Tracking status: **"completed"**
   - Certificate has been issued

4. **Agreement: "active"**
   - Manual status update after certificate is received and activated
   - No automatic sync from Tracking

---

## Key Differences

| Aspect | Agreement Status | Tracking Status |
|--------|-----------------|----------------|
| **Scope** | Entire agreement lifecycle | Single AHU submission process |
| **Duration** | Months to years | Minutes to days |
| **Updates** | Changes at major milestones | Changes in real-time during submission |
| **Purpose** | Business management | Technical monitoring |
| **User** | Portfolio managers, reports | Operations team, troubleshooting |
| **Page** | Agreements (master data) | Tracking (active processes) |

---

## Recommendation

To reduce confusion:

1. **Agreements Page** should show:
   - **Agreement Status** (lifecycle)
   - **Last Activity** (e.g., "Submitted 2 hours ago")
   - Link to tracking page for active submissions

2. **Tracking Page** should show:
   - **Tracking Status** (real-time process)
   - **Agreement Number** with link back to agreement
   - Progress timeline

3. **Labels:**
   - Agreements page: "Agreement Status"
   - Tracking page: "Submission Status" or "Process Status"
