# Agreement Status ↔ Tracking Status Mapping

## Quick Reference Table

| Agreement Status | Tracking Status | What's Happening | User Action Needed |
|-----------------|----------------|------------------|-------------------|
| **draft** | ❌ Not in tracking | Agreement being prepared | Complete agreement details |
| **pending** | ❌ Not in tracking | Ready to submit to AHU | Click "Submit to AHU" |
| **submitted** | ✅ **queued** | In submission queue | Wait for system to submit |
| **submitted** | ✅ **submitting** | Actively submitting to AHU | System is working |
| **submitted** | ✅ **submitted** | Successfully sent to AHU | Wait for payment info |
| **submitted** | ✅ **waiting_payment** | PNBP VA number received | **Pay via bank transfer** |
| **processing** | ✅ **payment_verified** | Payment confirmed | Wait for AHU processing |
| **processing** | ✅ **processing** | AHU processing registration | Wait for certificate |
| **registered** | ✅ **completed** | Certificate issued | Download certificate |
| **active** | ✅ completed | Certificate active | Normal operations |
| **expired** | ✅ completed | Certificate expired | Renew if needed |
| **rejected** | ✅ **failed** | AHU rejected submission | Review and resubmit |

---

## Detailed Flow

### 1️⃣ Draft → Pending
**Agreement Page Only**
- Agreement is being created and edited
- Not yet submitted to AHU
- Does NOT appear in Tracking page

### 2️⃣ Pending → Submitted
**Trigger:** User clicks "Submit to AHU"
- **Agreement Status:** Changes to `submitted`
- **Creates Tracking Entry:** With status `queued`
- **What happens:** Agreement enters submission queue

### 3️⃣ Submitted (Agreement) = Queued → Submitting → Submitted (Tracking)
**Automatic Process**
- **Tracking:** `queued` (waiting in queue)
- **Tracking:** `submitting` (actively calling AHU API)
- **Tracking:** `submitted` (successfully sent to AHU)
- **Agreement Status:** Still shows `submitted` during all these steps
- **What happens:** System communicates with AHU portal

### 4️⃣ Submitted → Waiting Payment
**After Successful AHU Submission**
- **Tracking:** `waiting_payment`
- **Agreement Status:** Still `submitted`
- **VA Number:** Received from AHU
- **User Action:** Must pay PNBP via bank transfer to VA number

### 5️⃣ Submitted → Processing
**After Payment Verified**
- **Tracking:** `payment_verified` → `processing`
- **Agreement Status:** Changes to `processing`
- **What happens:** AHU starts processing the certificate

### 6️⃣ Processing → Registered
**Certificate Issued**
- **Tracking:** `completed`
- **Agreement Status:** Changes to `registered`
- **Certificate:** Available for download
- **What happens:** AHU has issued the certificate

### 7️⃣ Registered → Active
**Manual Activation**
- **Tracking:** Still `completed`
- **Agreement Status:** Changes to `active`
- **What happens:** Business team marks certificate as active and operational

### 8️⃣ Active → Expired
**After Expiry Date**
- **Tracking:** Still `completed`
- **Agreement Status:** Changes to `expired`
- **What happens:** Certificate validity period has ended

---

## Key Rules

### When Agreement Shows "submitted":
- ✅ Appears in Tracking with status: **queued**, **submitting**, **submitted**, or **waiting_payment**
- ❌ NOT yet processing (payment not verified)

### When Agreement Shows "processing":
- ✅ Appears in Tracking with status: **payment_verified** or **processing**
- ✅ PNBP payment has been verified
- ⏳ Waiting for AHU to issue certificate

### When Agreement Shows "registered":
- ✅ Appears in Tracking with status: **completed**
- ✅ Certificate has been issued
- 📄 Certificate can be downloaded

### Track Button Visibility:
- Shows "Track" button only when `registrationNumber` exists
- This means agreement has been submitted to AHU and has a tracking ID

---

## Common Questions

**Q: Why does my agreement say "submitted" but tracking shows "waiting_payment"?**
A: "Submitted" is the business status meaning "sent to AHU". The tracking status shows the specific step: waiting for PNBP payment.

**Q: When will my agreement status change from "submitted" to "processing"?**
A: After you pay the PNBP fee via the VA number and the payment is verified by AHU.

**Q: My tracking says "completed" but agreement says "registered", not "active". Why?**
A: "Registered" means the certificate is issued. "Active" is a manual status set by your team when the certificate is activated for use.

**Q: Can I have multiple tracking entries for one agreement?**
A: No. Each agreement has ONE current tracking entry. If submission fails, the same tracking entry is retried.

---

## Status Update Triggers

| Trigger | Agreement Status Change | Tracking Status Change |
|---------|------------------------|----------------------|
| User clicks "Submit to AHU" | `pending` → `submitted` | Creates entry: `queued` |
| System submits to AHU API | - | `queued` → `submitting` → `submitted` |
| AHU returns VA number | - | `submitted` → `waiting_payment` |
| Payment verified by AHU | `submitted` → `processing` | `waiting_payment` → `payment_verified` → `processing` |
| AHU issues certificate | `processing` → `registered` | `processing` → `completed` |
| User activates certificate | `registered` → `active` | - |
| Expiry date passes | `active` → `expired` | - |
