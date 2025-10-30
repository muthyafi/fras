# FRAS - Fidusia Registration Automation System

**Fidusia Registration Automation System** - An intelligent platform for automating validation, registration, and tracking of Fidusia agreements with Indonesia's AHU (Administrasi Hukum Umum).

## 📋 Product Scope

The system will:

1. **Validate Agreement Data**
   - Validate against the public Fidusia database at [https://ahu.go.id/pencarian/fidusia](https://ahu.go.id/pencarian/fidusia)
   - Check for existing agreements before registration
   - Verify debtor information (KTP, NPWP)
   - Validate vehicle details (chassis number, engine number)

2. **Automate Fidusia Registration**
   - Register via [https://fidusia.ahu.go.id](https://fidusia.ahu.go.id)
   - Bulk upload with 57-field Indonesian AHU format
   - Automatic PNBP payment tracking
   - Real-time submission status monitoring

3. **Manage and Track Registration Status**
   - Real-time tracking of registration workflow
   - PNBP payment status monitoring
   - Certificate issuance tracking
   - Batch submission management

4. **Store Certificates and Generate Reports**
   - Secure certificate storage
   - Automated report generation
   - Export capabilities (CSV, Excel)
   - Audit trail and activity logs

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL)
- **CSV Processing**: Papa Parse
- **Icons**: Lucide React
- **Routing**: React Router v7

## ✨ Key Features

### 📤 Bulk Upload
- Upload CSV files with 57 Indonesian AHU fields
- Semicolon-delimited format support
- Real-time validation with Indonesian-specific rules
- Preview before submission
- Automatic debtor and vehicle data extraction

### 📊 Agreement Management
- Complete CRUD operations
- Display KTP numbers and vehicle details
- Branch-based access control
- Role-based permissions
- Certificate tracking

### 🔍 Registration Tracking
- Real-time status monitoring
- PNBP payment tracking with Virtual Account
- Activity logs with detailed history
- Batch submission tracking
- Certificate download

### 👥 User & Role Management
- Custom role creation
- 8 granular permissions
- Branch assignment
- Multi-branch support
- Audit trail

### 🏢 Branch Management
- Multi-branch institutions
- Branch-level statistics
- Manager assignment
- Access control by branch

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React 19 + TypeScript + Tailwind CSS 4                    │
│  - Dashboard, Agreements, Bulk Upload, Tracking            │
│  - User Management, Role Management, Branch Management      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  - PostgreSQL Database                                       │
│  - Authentication & Authorization                            │
│  - Real-time Subscriptions                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Indonesian AHU APIs                         │
│  - Public Search: ahu.go.id/pencarian/fidusia               │
│  - Registration: fidusia.ahu.go.id                          │
│  - PNBP Payment Integration                                 │
└─────────────────────────────────────────────────────────────┐
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fras

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Application Structure

```
fras/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── RoleContext.tsx
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Agreements.tsx
│   │   ├── BulkUpload.tsx
│   │   ├── RegistrationTracking.tsx
│   │   ├── BranchManagement.tsx
│   │   ├── UserManagement.tsx
│   │   └── RoleManagement.tsx
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── lib/              # Utilities and API clients
│   │   ├── supabase.ts
│   │   └── api.ts
│   └── App.tsx           # Main application component
├── public/               # Static assets
└── docs/                 # Documentation
```

## 📖 Documentation

Comprehensive documentation available in the following files:

- **[FIDUSIA_CSV_FORMAT_UPDATE.md](./FIDUSIA_CSV_FORMAT_UPDATE.md)** - CSV format specification and bulk upload
- **[AGREEMENTS_TRACKING_UPDATE.md](./AGREEMENTS_TRACKING_UPDATE.md)** - Display enhancements and database schema
- **[COMPLETE_UPDATE_SUMMARY.md](./COMPLETE_UPDATE_SUMMARY.md)** - Overall system summary
- **[PNBP_PAYMENT_IMPLEMENTATION.md](./PNBP_PAYMENT_IMPLEMENTATION.md)** - PNBP payment workflow
- **[BRANCH_MANAGEMENT_SUMMARY.md](./BRANCH_MANAGEMENT_SUMMARY.md)** - Branch management features
- **[ROLE_MANAGEMENT.md](./ROLE_MANAGEMENT.md)** - Custom role system

## 🔐 Security & Permissions

### 8 Core Permissions
1. `canViewAllBranches` - View agreements across all branches
2. `canManageBranches` - Create, edit, delete branches
3. `canManageUsers` - User management access
4. `canEditAnyAgreement` - Edit agreements from any branch
5. `canDeleteAnyAgreement` - Delete agreements from any branch
6. `canExportData` - Export data to CSV/Excel
7. `canViewReports` - Access reporting features
8. `canManageOwnBranch` - Manage own branch only

### System Roles
- **Admin** - Full system access
- **Manager** - Branch management + user management
- **Staff** - Basic operations within assigned branch

### Custom Roles
- Create unlimited custom roles
- Mix and match permissions
- Assign to specific branches
- Full audit trail

## 🇮🇩 Indonesian AHU Integration

### CSV Format (57 Fields)
The system uses the official Indonesian AHU fidusia registration format:

**Categories:**
- Contract Information (9 fields)
- Primary Debtor (19 fields including KTP, NPWP, address)
- Spouse Information (5 fields)
- Vehicle/Object Details (10 fields including chassis, engine)
- Secondary Debtor (9 fields)
- Administrative (3 fields including multifinance code, region)

**Delimiter:** Semicolon (`;`)

### Validation Rules
- **KTP**: Must be exactly 16 digits
- **Vehicle**: Chassis and engine numbers required
- **Address**: Full Indonesian address with RT/RW
- **Dates**: Indonesian date format support
- **Currency**: Rupiah formatting

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## 📊 Database Schema

Key tables:
- `fidusia_agreements` - Main agreement records with 40+ AHU fields
- `clients` - Debtor information
- `institutions` - Multifinance companies
- `institution_branches` - Branch locations
- `users` - System users
- `custom_roles` - User-defined roles
- `registration_tracking` - Real-time tracking data

## 🚀 Deployment

The application can be deployed to:
- Vercel
- Netlify
- AWS Amplify
- Any static hosting service

Supabase handles the backend infrastructure.

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

For support and questions, please contact the development team.

---

**FRAS** - Streamlining Fidusia registration for Indonesian multifinance institutions

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
