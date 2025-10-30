# User Role Update & Delete Feature

## 📋 Overview

This document describes the enhancement to the User Management system that allows users to be assigned **custom roles** (in addition to system roles) and dynamically updates the UI based on role permissions.

## 🎯 Implementation Date
**October 29, 2025**

---

## ✨ What Changed

### Before
- Users could only be assigned 3 hardcoded system roles:
  - Super Admin
  - Branch Admin
  - Branch User
- Role selector had fixed 3 cards
- Branch assignment hardcoded to check `role !== 'super_admin'`

### After
- Users can be assigned **any role** (system or custom)
- Role selector dynamically displays all available roles
- Branch assignment based on role's `canViewAllBranches` permission
- Roles displayed with custom colors and descriptions
- Support for unlimited custom roles

---

## 🔧 Technical Implementation

### 1. Updated UserFormModal Props

**Added:**
```typescript
interface UserFormModalProps {
  ...existing props
  allRoles: CustomRole[]                    // All available roles
  getRoleInfo: (roleId: string) => ...      // Get role display info
}
```

### 2. Dynamic Role Selector

**Old (Hardcoded):**
```tsx
<button onClick={() => handleRoleChange('super_admin')}>
  <Shield />
  <p>Super Admin</p>
  <p>Full system access</p>
</button>
// ...2 more hardcoded buttons
```

**New (Dynamic):**
```tsx
{allRoles.map((role) => {
  const roleInfo = getRoleInfo(role.id)
  const isSelected = formData.role === role.id
  
  return (
    <button
      key={role.id}
      onClick={() => handleRoleChange(role.id)}
      className={/* dynamic colors based on role.color */}
    >
      <Shield className={/* color based on role */} />
      <p>{roleInfo.name}</p>
      <p>{role.description}</p>
      {role.isSystem && <span>System</span>}
    </button>
  )
})}
```

### 3. Smart Branch Assignment

**Old Logic:**
```typescript
// Hardcoded check
if (formData.role !== 'super_admin' && !formData.branchCode) {
  errors.branchCode = 'Required'
}
```

**New Logic:**
```typescript
// Permission-based check
const roleData = allRoles.find((r) => r.id === formData.role)
const needsBranchAssignment = roleData 
  ? !roleData.permissions.canViewAllBranches 
  : true

if (needsBranchAssignment && !formData.branchCode) {
  errors.branchCode = 'Required'
}
```

### 4. Dynamic Branch Field Display

**Old:**
```tsx
{formData.role !== 'super_admin' && (
  <select>...</select>
)}
```

**New:**
```tsx
{(() => {
  const roleData = allRoles.find((r) => r.id === formData.role)
  const needsBranchAssignment = !roleData?.permissions.canViewAllBranches
  
  return needsBranchAssignment ? <select>...</select> : null
})()}
```

---

## 🎨 Visual Design

### Role Card Colors

Each role displays with its configured color:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Super Admin    │  │  Branch Admin   │  │  Regional Mgr   │
│  Purple Border  │  │  Blue Border    │  │  Green Border   │
│  [System]       │  │  [System]       │  │  [Custom]       │
│  Full access    │  │  Own branch     │  │  Multi-branch   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Supported Colors:**
- Purple, Blue, Green, Red, Yellow, Pink, Indigo, Gray

**Dynamic Styling:**
```tsx
const colorClasses = {
  purple: { 
    border: 'border-purple-500', 
    bg: 'bg-purple-50', 
    icon: 'text-purple-600' 
  },
  blue: { 
    border: 'border-blue-500', 
    bg: 'bg-blue-50', 
    icon: 'text-blue-600' 
  },
  // ...other colors
}
```

---

## 🔄 User Workflows

### Workflow 1: Assign Custom Role to New User

1. Go to `/users`
2. Click "Add New User"
3. Fill in basic information
4. **Role Selection:**
   - See all roles (3 system + X custom)
   - Each role shows name, description, and system badge
   - Click on custom role (e.g., "Regional Manager")
5. **Branch Assignment:**
   - If role has `canViewAllBranches = true`: Field hidden
   - If role has `canViewAllBranches = false`: Field required
6. Fill remaining fields
7. Click "Create User"
8. ✅ User created with custom role

### Workflow 2: Update User's Role

1. Go to `/users`
2. Find user and click Edit
3. **Change Role:**
   - Click on different role card
   - Branch field shows/hides automatically based on new role's permissions
4. If switching to role without `canViewAllBranches`:
   - Branch dropdown appears
   - Select branch
5. Click "Save Changes"
6. ✅ User's role updated
7. ✅ User's permissions updated instantly

### Workflow 3: Delete Role Assignment

**Note:** You cannot "unassign" a role - every user must have a role. You can:
1. Change user to a different role
2. Deactivate the user
3. Delete the user (if not last super admin)

---

## 🧪 Testing Scenarios

### Scenario 1: Create User with Custom Role

**Setup:**
1. Create custom role "Data Analyst" with:
   - `canViewAllBranches: true`
   - `canExportData: true`
   - Color: Green

**Test:**
1. Click "Add New User"
2. Select "Data Analyst" role
3. ✅ Branch assignment field is hidden
4. ✅ Role card has green border
5. ✅ "System" badge not shown
6. Fill other fields
7. Create user
8. ✅ User list shows green "Data Analyst" badge

### Scenario 2: Update User from System to Custom Role

**Test:**
1. Edit user with "Branch User" role
2. Change to custom "Regional Manager" role (has `canViewAllBranches: false`)
3. ✅ Branch assignment dropdown appears
4. Select branch "JKT-01"
5. Save changes
6. ✅ User's role badge updates to custom role color
7. ✅ User sees only JKT-01 data when logged in

### Scenario 3: Update User from Custom to System Role

**Test:**
1. Edit user with custom "Regional Manager" role
2. Change to "Super Admin"
3. ✅ Branch assignment field disappears
4. ✅ Previously selected branch cleared
5. Save changes
6. ✅ User's role badge shows purple "Super Admin"
7. ✅ User can see all branches

### Scenario 4: Role Permission Validation

**Test:**
1. Create role "Auditor" with:
   - `canViewAllBranches: false` (needs branch)
   - Other permissions as needed
2. Try to create user with "Auditor" role
3. Don't select branch
4. Click "Create User"
5. ✅ Error: "Branch assignment is required for this role"
6. Select branch
7. ✅ User created successfully

### Scenario 5: Multiple Custom Roles Display

**Setup:**
1. Create 5 custom roles with different colors

**Test:**
1. Click "Add New User"
2. ✅ See 8 total roles (3 system + 5 custom)
3. ✅ Grid wraps to multiple rows if needed
4. ✅ Each role has unique color
5. ✅ System roles show "System" badge
6. ✅ Custom roles show truncated descriptions

---

## 📊 Permission-Based Logic

### Branch Assignment Rules

| Role Permission | Branch Assignment |
|----------------|-------------------|
| `canViewAllBranches: true` | Not required (hidden) |
| `canViewAllBranches: false` | Required (shown) |

**Examples:**

| Role | canViewAllBranches | Branch Field |
|------|-------------------|--------------|
| Super Admin | ✅ true | Hidden |
| Branch Admin | ❌ false | Required |
| Branch User | ❌ false | Required |
| Regional Manager (custom) | ✅ true | Hidden |
| Department Head (custom) | ❌ false | Required |

---

## 🔍 Code Changes Summary

### Modified Functions

1. **UserFormModal Component**
   - Added `allRoles` and `getRoleInfo` props
   - Dynamic role card rendering
   - Permission-based branch assignment

2. **handleRoleChange**
   ```typescript
   // Before
   branchCode: newRole === 'super_admin' ? '' : formData.branchCode
   
   // After
   const roleData = allRoles.find((r) => r.id === newRole)
   const needsBranchAssignment = !roleData?.permissions.canViewAllBranches
   branchCode: needsBranchAssignment ? formData.branchCode : ''
   ```

3. **validateForm**
   ```typescript
   // Before
   if (formData.role !== 'super_admin' && !formData.branchCode)
   
   // After
   const roleData = allRoles.find((r) => r.id === formData.role)
   const needsBranchAssignment = !roleData?.permissions.canViewAllBranches
   if (needsBranchAssignment && !formData.branchCode)
   ```

4. **Branch Assignment Render**
   ```typescript
   // Before
   {formData.role !== 'super_admin' && <select>...</select>}
   
   // After
   {(() => {
     const roleData = allRoles.find((r) => r.id === formData.role)
     return !roleData?.permissions.canViewAllBranches ? <select>...</select> : null
   })()}
   ```

### Modal Invocations

Both create and edit modals now receive:
```typescript
<UserFormModal
  mode="create" // or "edit"
  onClose={...}
  onSave={...}
  existingUsers={users}
  allRoles={allRoles}           // ← New
  getRoleInfo={getRoleInfo}     // ← New
/>
```

---

## ✅ Features Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| Dynamic role selector | ✅ | Shows all system + custom roles |
| Custom role colors | ✅ | 8 color options supported |
| System badge | ✅ | Distinguishes system from custom roles |
| Permission-based branch field | ✅ | Shows/hides based on canViewAllBranches |
| Role card descriptions | ✅ | Truncated to 1 line |
| Create user with custom role | ✅ | Full support |
| Update user role | ✅ | Change to any available role |
| Branch assignment validation | ✅ | Based on role permissions |
| Role badge display | ✅ | Dynamic colors in user list |
| No TypeScript errors | ✅ | All files compile cleanly |

---

## 🐛 Edge Cases Handled

1. **Role Deleted While Assigned**
   - Current: User retains deleted role ID
   - Future: Add validation on login to reassign default role

2. **Role Permissions Changed**
   - Current: User permissions update immediately
   - Branch assignment requirement may change

3. **No Roles Available**
   - Current: At least 3 system roles always exist
   - Future: Add validation to ensure at least one role exists

4. **User Switches from Branch-Required to All-Branches Role**
   - Branch assignment cleared automatically
   - No orphaned data

5. **User Switches from All-Branches to Branch-Required Role**
   - Branch field appears
   - Validation enforces selection

---

## 🚀 Integration Points

### 1. With Role Management Page

- Roles created in `/roles` immediately available in User Management
- Real-time updates via shared RoleContext state
- Changes persist for session duration (mock data)

### 2. With RoleContext

- `allRoles` includes system roles + custom roles
- `getRoleInfo` provides display information
- Permissions calculated based on assigned role

### 3. With Permission System

- User's effective permissions come from assigned role
- Can change instantly by changing role
- No separate permission assignment needed

---

## 📝 Best Practices

### For Administrators

1. **Create Roles Before Users**
   - Define all needed custom roles in `/roles` first
   - Then assign to users in `/users`

2. **Use Descriptive Names**
   - Clear role names help users understand access levels
   - e.g., "Regional Manager" vs "Role 1"

3. **Choose Appropriate Colors**
   - Use consistent color scheme
   - Purple/Blue for high-level roles
   - Gray for limited access

4. **Document Role Purposes**
   - Use description field to explain role's purpose
   - Helps future administrators understand system

### For Developers

1. **Always Check Permissions, Not Roles**
   ```typescript
   // ❌ Don't check role name
   if (user.role === 'super_admin')
   
   // ✅ Check permission
   if (permissions.canManageUsers)
   ```

2. **Use Permission-Based Logic**
   - Branch assignment based on `canViewAllBranches`
   - Feature access based on specific permissions
   - Extensible to new roles

3. **Validate Role Existence**
   - Check if role exists before assigning
   - Handle missing role gracefully

---

## 🔮 Future Enhancements

### Phase 1: Role Deletion Safety
- Prevent deleting roles that are assigned to active users
- Or force reassignment before deletion
- Show user count per role

### Phase 2: Bulk Role Updates
- Select multiple users
- Change all to same role
- Useful for department reorganizations

### Phase 3: Role History
- Track role changes per user
- Audit log of who changed what when
- Compliance reporting

### Phase 4: Role Approval Workflow
- Require approval for sensitive role assignments
- Email notifications
- Temporary role assignments with expiration

---

## 📖 Usage Examples

### Example 1: Assign Regional Manager Role

**Role Definition (from `/roles`):**
```typescript
{
  name: "Regional Manager",
  description: "Oversee multiple branches",
  color: "blue",
  permissions: {
    canViewAllBranches: true,    // ← No branch assignment needed
    canExportData: true,
    canViewReports: true,
    // ...other permissions
  }
}
```

**User Assignment (in `/users`):**
1. Create/Edit user
2. Select "Regional Manager" role
3. ✅ Branch field hidden (canViewAllBranches = true)
4. Save user
5. User can see all branches

### Example 2: Assign Department Head Role

**Role Definition:**
```typescript
{
  name: "Department Head",
  description: "Manage department operations",
  color: "indigo",
  permissions: {
    canViewAllBranches: false,   // ← Branch assignment required
    canManageOwnBranch: true,
    canExportData: true,
    // ...other permissions
  }
}
```

**User Assignment:**
1. Create/Edit user
2. Select "Department Head" role
3. ✅ Branch field appears (canViewAllBranches = false)
4. **Must** select branch (e.g., JKT-01)
5. Save user
6. User can only see JKT-01 data

---

## ✅ Summary

**Implementation Complete:** 100%

### What Users Can Do Now:

1. ✅ **Create users with custom roles**
   - Select from all available roles
   - See role descriptions and colors
   - System and custom roles distinguished

2. ✅ **Update user roles**
   - Change to any available role
   - Branch assignment adjusts automatically
   - Permissions update immediately

3. ✅ **Smart branch assignment**
   - Shown only when role requires it
   - Based on `canViewAllBranches` permission
   - Validated on save

4. ✅ **Visual role identification**
   - 8 custom colors supported
   - Consistent across all pages
   - System badge for predefined roles

### Technical Achievements:

- ✅ Dynamic role selector (unlimited roles)
- ✅ Permission-based UI logic
- ✅ Zero TypeScript errors
- ✅ Hot module reload working
- ✅ Fully responsive design
- ✅ Integration with existing RoleContext

### Ready For:

- Testing all role assignment scenarios
- Creating custom roles and assigning to users
- Backend integration when needed

---

**Document Version:** 1.0  
**Last Updated:** October 29, 2025  
**Implementation Status:** ✅ Complete  
**Dev Server:** Running at http://localhost:5173/
