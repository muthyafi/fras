# FRAS Product Scope Documentation

## Product Name
**FRAS - Fidusia Registration Automation System**

## Version
1.0.0

## Last Updated
October 30, 2025

---

## 1. Executive Summary

FRAS (Fidusia Registration Automation System) is an intelligent web-based platform designed to streamline and automate the end-to-end process of Fidusia guarantee registration in Indonesia. The system integrates with Indonesia's AHU (Administrasi Hukum Umum) portal to validate, register, and track Fidusia agreements for multifinance institutions.

---

## 2. Product Vision

To become the leading automation platform for Fidusia registration in Indonesia, reducing manual processing time by 90%, eliminating registration errors, and providing real-time visibility into the registration workflow from submission to certificate issuance.

---

## 3. Product Scope

### 3.1 In Scope

#### 3.1.1 Validate Agreement Data Against Public Fidusia Database
**Source:** [https://ahu.go.id/pencarian/fidusia](https://ahu.go.id/pencarian/fidusia)

**Functionality:**
- Pre-registration validation against existing Fidusia records
- Duplicate detection before submission
- Search by:
  - Debtor KTP number (16-digit national ID)
  - Vehicle chassis number (NOMOR_RANGKA)
  - Contract number (NOMOR_KONTRAK)
  - Multifinance company code

**Validation Checks:**
- Check if agreement already registered
- Verify debtor identity (KTP format validation)
- Confirm vehicle ownership history
- Validate against blacklisted entities
- Check for existing active agreements

**User Benefits:**
- Prevent duplicate registrations (saves PNBP fees)
- Reduce rejection rates from AHU
- Ensure data accuracy before submission
- Real-time feedback on validation status

**Implementation:**
- API integration with AHU public search
- Client-side validation rules
- Server-side verification
- Validation result caching
- Batch validation for bulk uploads

---

#### 3.1.2 Automate Fidusia Registration
**Target Portal:** [https://fidusia.ahu.go.id](https://fidusia.ahu.go.id)

**Functionality:**

**A. Single Agreement Registration**
- Web form with 57 Indonesian AHU fields
- Auto-fill from client database
- Real-time field validation
- Document upload (BPKB, KTP, contracts)
- Preview before submission

**B. Bulk Registration**
- CSV upload with 57-field format
- Semicolon-delimited support
- Batch processing (up to 1000 agreements per upload)
- Row-by-row validation
- Preview with error highlighting
- Selective submission (exclude errors)

**C. Data Fields (57 Total)**

**Contract Information (9 fields):**
1. JENIS_KATEGORI_FIDUSA - Category type
2. JENIS_PENGGUNA - User type
3. TGL_SURAT_KUASA - Power of attorney date
4. BERDASARKAN_PERJANJIAN - Agreement basis
5. NOMOR_KONTRAK - Contract number
6. TGL_AWAL_PERJANJIAN - Start date
7. TGL_AKHIR_PERJANJIAN - End date
8. NILAI_PENJAMINAN - Guarantee amount
9. NILAI_PENJAMINAN_FIDUSIA - Fidusia guarantee amount

**Primary Debtor (19 fields):**
10. NAMA_DEBITUR - Full name (UPPERCASE)
11. NO_KTP_DEBITUR - KTP number (16 digits)
12. NPWP - Tax ID
13. TEMPAT_LAHIR_FIDUSIA - Birth place
14. TANGGAL_LAHIR_DEBITUR - Birth date
15. PEKERJAAN_DEBITUR - Occupation
16. ALAMAT_DEBITUR - Street address
17. KABKOTA_DEBITUR - City/Regency
18. KECAMATAN_DEBITUR - District
19. KELURAHAN_DEBITUR - Sub-district
20. RT_DEBITUR - Neighborhood (RT)
21. RW_DEBITUR - Community (RW)
22. KODE_POS - Postal code
23. NO_TELEPON - Phone number
24. PANGGILAN_DEBITUR - Title (Mr./Mrs.)
25. KEWARGANEGARAAN_DEBITUR - Citizenship
26. NO_SK - Decree number
27. NO_PASPOR - Passport number
28. NEGARA_PASPOR - Passport country

**Spouse Information (5 fields):**
29. NAMA_PASANGAN - Spouse name
30. TEMPAT_LAHIR_PASANGAN - Spouse birth place
31. TANGGAL_LAHIR_PASANGAN - Spouse birth date
32. PEKERJAAN_PASANGAN - Spouse occupation
33. NO_KTP_PASANGAN - Spouse KTP

**Vehicle/Object (10 fields):**
34. MERK - Brand (TOYOTA, HONDA, etc.)
35. TYPE - Type (AVANZA, CIVIC, etc.)
36. MODEL - Model (G, RS, etc.)
37. TAHUN_PEMBUATAN - Manufacturing year
38. NOMOR_RANGKA - Chassis number (unique ID)
39. NOMOR_MESIN - Engine number
40. JUMLAH_RODA - Number of wheels
41. JENIS_BUKTI_OBJEK - Proof document type (BPKB)
42. NO_BUKTI_OBJEK - Proof document number
43. NILAI_OBJEK - Object value

**Secondary Debtor (9 fields):**
44. PANGGILAN_DEBITUR_SEC - Secondary title
45. NAMA_DEBITUR_SEC - Secondary name
46. TEMPAT_LAHIR_DEBITUR_SEC - Secondary birth place
47. TANGGAL_LAHIR_DEBITUR_SEC - Secondary birth date
48. PEKERJAAN_DEBITUR_SEC - Secondary occupation
49. ALAMAT_DEBITUR_SEC - Secondary address
50. KELURAHAN_DEBITUR_SEC - Secondary sub-district
51. RT_DEBITUR_SEC - Secondary RT
52. RW_DEBITUR_SEC - Secondary RW
53. NO_KTP_DEBITUR_SEC - Secondary KTP
54. KODE_POS_SEC - Secondary postal code

**Administrative (3 fields):**
55. KODE_MULTIFINANCE - Multifinance code
56. SERTIFIKAT - Certificate number
57. WILAYAH - Region/Province
58. REGIONAL - Regional office

**D. Submission Process**
1. Data validation (pre-submission)
2. API call to fidusia.ahu.go.id
3. Receive AHU reference number
4. Generate PNBP Virtual Account
5. Track submission status
6. Store submission logs

**User Benefits:**
- 90% time reduction vs manual entry
- Eliminate data entry errors
- Process hundreds of agreements simultaneously
- Automatic retry on transient failures
- Complete audit trail

---

#### 3.1.3 Manage and Track Registration Status

**Real-Time Tracking Dashboard**

**A. Registration Workflow Stages**
```
Queued → Submitting → Submitted → Waiting Payment → 
Payment Verified → Processing → Completed/Failed
```

**B. Status Monitoring**
- **Queued**: Pending submission to AHU
- **Submitting**: Currently sending to AHU API
- **Submitted**: Received by AHU, awaiting PNBP
- **Waiting Payment**: PNBP Virtual Account active
- **Payment Verified**: Payment confirmed by bank
- **Processing**: AHU processing registration
- **Completed**: Certificate issued
- **Failed**: Submission rejected (with reason)

**C. PNBP Payment Tracking**

**Payment Information:**
- PNBP amount (typically Rp 50,000 per agreement)
- Virtual Account number (88xx format)
- Payment deadline (2 days from submission)
- Payment status (unpaid/pending/paid)
- Payment proof upload

**Payment Integration:**
- Generate unique VA per agreement
- Real-time payment verification
- Automatic status update on payment
- Payment reminder notifications
- Bulk payment list download

**D. Batch Submission Management**
- Group agreements by batch
- Batch-level statistics
- Filter by batch ID
- Bulk operations (retry, cancel)
- Batch progress tracking

**E. Activity Logs**
- Timestamp for each status change
- User who performed action
- Detailed error messages
- Retry attempts tracking
- AHU response codes

**F. Notifications**
- Email notifications on status change
- Payment reminder emails
- Certificate ready notifications
- Failure alerts with resolution steps

**User Benefits:**
- Complete visibility into registration pipeline
- Proactive payment management
- Quick identification of issues
- Batch performance analytics
- Automated escalation for delays

---

#### 3.1.4 Store Certificates and Generate Reports

**A. Certificate Management**

**Storage:**
- Secure document storage (Supabase Storage)
- Certificate metadata in database
- Version control for amendments
- Automatic backup
- Encrypted at rest

**Certificate Information:**
- Certificate number (W7.xxxxxxxx format)
- Issuance date
- Validity period
- PDF document
- QR code for verification

**Certificate Operations:**
- Download individual certificates
- Bulk download by batch
- Print-ready formatting
- Email to stakeholders
- Share via secure link

**B. Report Generation**

**1. Operational Reports**

**Daily Submission Report:**
- Total submissions
- Success rate
- Pending PNBP payments
- Rejected submissions
- Average processing time

**Weekly Performance Report:**
- Branch-wise statistics
- User productivity
- Error analysis
- Payment collection rate
- Certificate issuance trend

**Monthly Management Report:**
- Executive summary
- Financial metrics (PNBP spend)
- Operational efficiency
- Compliance status
- Year-over-year comparison

**2. Compliance Reports**

**Audit Trail Report:**
- All user actions
- Data modifications
- System access logs
- Failed login attempts
- Export activities

**Certificate Inventory:**
- All issued certificates
- Expiring certificates
- Pending renewals
- Certificate status distribution

**3. Financial Reports**

**PNBP Payment Report:**
- Total PNBP paid
- Outstanding payments
- Payment aging analysis
- Bank reconciliation
- Cost per agreement

**4. Custom Reports**

**Query Builder:**
- Custom date ranges
- Filter by branch/user/status
- Multiple export formats
- Scheduled reports
- Email distribution

**C. Export Capabilities**

**Supported Formats:**
- CSV (raw data)
- Excel (.xlsx) with formatting
- PDF (formatted reports)
- JSON (API integration)

**Export Features:**
- Column selection
- Data filtering
- Custom sorting
- Include/exclude summaries
- Scheduled exports

**D. Analytics Dashboard**

**Key Metrics:**
- Total agreements registered
- Success rate (%)
- Average processing time
- PNBP payment completion rate
- Certificate issuance rate
- User productivity metrics

**Visual Charts:**
- Registration trend line
- Status distribution pie chart
- Branch comparison bar chart
- Payment status funnel
- Error category breakdown

**User Benefits:**
- Secure certificate storage with instant retrieval
- Comprehensive reporting for all stakeholders
- Data-driven decision making
- Regulatory compliance documentation
- Performance monitoring and optimization

---

### 3.2 Out of Scope (Phase 1)

The following features are planned for future releases but not included in Phase 1:

1. **Mobile Application**
   - Native iOS/Android apps
   - Mobile-optimized workflows
   - Push notifications

2. **OCR Document Processing**
   - Automatic data extraction from BPKB
   - KTP image recognition
   - Contract parsing

3. **E-Signature Integration**
   - Digital signature for agreements
   - Paperless workflow
   - Blockchain verification

4. **Client Portal**
   - Customer self-service
   - Agreement status lookup
   - Certificate download by clients

5. **Advanced Analytics**
   - Predictive analytics
   - Machine learning for error prevention
   - Risk scoring

6. **Multi-Language Support**
   - English interface
   - Regional language support
   - Localization

7. **Integration with Core Banking Systems**
   - Direct API to banking platforms
   - Automated data sync
   - Real-time balance updates

---

## 4. User Roles and Permissions

### 4.1 System Roles

**Admin**
- Full system access
- All 8 permissions enabled
- User and role management
- System configuration

**Manager**
- Branch management
- User management within branch
- View all branch agreements
- Generate reports

**Staff**
- Create/edit agreements in own branch
- View own branch data
- Submit to AHU
- Track registrations

### 4.2 Custom Roles
- Create unlimited custom roles
- Mix and match permissions
- Branch-specific roles
- Granular access control

### 4.3 Permissions

1. `canViewAllBranches` - Cross-branch visibility
2. `canManageBranches` - Branch CRUD
3. `canManageUsers` - User administration
4. `canEditAnyAgreement` - Edit across branches
5. `canDeleteAnyAgreement` - Delete across branches
6. `canExportData` - Data export
7. `canViewReports` - Reporting access
8. `canManageOwnBranch` - Own branch management

---

## 5. Technical Requirements

### 5.1 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 5.2 Screen Resolution
- Minimum: 1280x720
- Recommended: 1920x1080
- Mobile-responsive (future)

### 5.3 Internet Connection
- Minimum: 2 Mbps
- Recommended: 10 Mbps
- Latency: <200ms to servers

### 5.4 File Size Limits
- CSV upload: Max 10 MB
- Certificate storage: Max 5 MB per file
- Total storage per institution: 50 GB

---

## 6. Integration Points

### 6.1 External Systems

**AHU Public Search API**
- Endpoint: ahu.go.id/pencarian/fidusia
- Protocol: HTTPS
- Authentication: API Key
- Rate limit: 100 requests/minute

**AHU Registration API**
- Endpoint: fidusia.ahu.go.id
- Protocol: HTTPS/SOAP
- Authentication: Certificate-based
- Timeout: 30 seconds

**PNBP Payment Gateway**
- Virtual Account generation
- Real-time payment callback
- Payment verification API

### 6.2 Internal Systems

**Supabase Backend**
- PostgreSQL database
- Authentication service
- Storage service
- Real-time subscriptions

---

## 7. Success Metrics

### 7.1 Operational Metrics
- **Registration Success Rate**: >95%
- **Average Processing Time**: <2 hours
- **PNBP Payment Collection**: >90% within deadline
- **System Uptime**: 99.9%

### 7.2 User Adoption Metrics
- **Active Users**: 100+ within 3 months
- **Agreements Processed**: 10,000+ per month
- **User Satisfaction**: 4.5/5 rating
- **Training Completion**: 100% of users

### 7.3 Business Metrics
- **Time Savings**: 90% vs manual process
- **Error Reduction**: 80% fewer rejections
- **Cost Reduction**: 50% lower processing cost
- **ROI**: Positive within 6 months

---

## 8. Constraints and Assumptions

### 8.1 Constraints
- Must comply with Indonesian data protection laws
- AHU API rate limits and availability
- PNBP payment processing times
- Certificate issuance dependent on AHU processing

### 8.2 Assumptions
- AHU APIs remain stable and available
- Users have reliable internet connectivity
- Institutions provide accurate data
- Payment gateway integration functions correctly

---

## 9. Risk Mitigation

### 9.1 Technical Risks
- **AHU API Downtime**: Implement retry logic, queue management
- **Data Loss**: Automated backups, redundancy
- **Security Breach**: Encryption, regular audits, access controls

### 9.2 Operational Risks
- **User Training**: Comprehensive documentation, video tutorials
- **Data Quality**: Validation rules, error prevention
- **Adoption Resistance**: Change management, phased rollout

---

## 10. Future Enhancements (Roadmap)

### Phase 2 (Q2 2026)
- Mobile application
- OCR document processing
- E-signature integration

### Phase 3 (Q3 2026)
- Client portal
- Advanced analytics
- Predictive error prevention

### Phase 4 (Q4 2026)
- Multi-language support
- Core banking integration
- API marketplace

---

## 11. Compliance and Legal

### 11.1 Regulatory Compliance
- Indonesian Financial Services Authority (OJK) regulations
- Ministry of Law and Human Rights regulations
- Data protection and privacy laws
- AHU registration requirements

### 11.2 Data Retention
- Agreement data: 10 years
- Certificates: Permanent
- User logs: 3 years
- System logs: 1 year

### 11.3 Audit Requirements
- Complete audit trail
- Tamper-proof logs
- User action tracking
- Regular compliance reports

---

## 12. Support and Maintenance

### 12.1 Support Levels
- **Level 1**: Email support (24h response)
- **Level 2**: Priority support (4h response)
- **Level 3**: Emergency support (1h response)

### 12.2 Maintenance Windows
- Scheduled: Weekly, Sunday 2-4 AM WIB
- Emergency: As needed with 1h notice
- Uptime target: 99.9%

### 12.3 Updates
- Minor updates: Monthly
- Major updates: Quarterly
- Security patches: As needed (immediate)

---

## 13. Training and Documentation

### 13.1 User Training
- Video tutorials (15 modules)
- Interactive guides
- Live webinars
- User manual (PDF)

### 13.2 Administrator Training
- System configuration
- User management
- Troubleshooting
- Report generation

### 13.3 Technical Documentation
- API documentation
- Database schema
- Deployment guide
- Architecture overview

---

## 14. Glossary

- **AHU**: Administrasi Hukum Umum (Directorate General of General Legal Administration)
- **Fidusia**: Security interest in movable objects
- **PNBP**: Penerimaan Negara Bukan Pajak (Non-tax State Revenue)
- **KTP**: Kartu Tanda Penduduk (Indonesian National Identity Card)
- **NPWP**: Nomor Pokok Wajib Pajak (Taxpayer Identification Number)
- **BPKB**: Buku Pemilik Kendaraan Bermotor (Vehicle Ownership Document)
- **RT/RW**: Rukun Tetangga/Rukun Warga (Neighborhood/Community Unit)

---

**Document Status**: Final
**Approved By**: Product Management
**Date**: October 30, 2025
**Version**: 1.0.0
