# Admin Dashboard - Quick Start Guide

## 🚀 Getting Started

The new Admin Dashboard is redesigned for **maximum efficiency**. Everything you need is organized into collapsible sections!

---

## 📊 Dashboard Overview (Top Section)

When you first load the dashboard, you'll see **4 quick stat cards**:

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 💰 Balance   │ │ 👥 Employees │ │ 🎖️  Managers │ │ ⏳ Pending   │
│              │ │              │ │              │ │              │
│ 1000.5 ETH   │ │ 24           │ │ 5            │ │ 3 requests  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
    🔄 Refresh    🔄 Refresh      🔄 Refresh       🔄 Auto-Update
```

**Each card has a refresh button (🔄) to update the data on demand.**

---

## 💳 Fund Contract (2nd Section)

```
┌─────────────────────────────────────────────────┐
│ [Enter Amount] | [Current Balance] | [Fund]    │
└─────────────────────────────────────────────────┘
```

- Enter amount in ETH (e.g., 10)
- See current balance inline
- Click Fund to send transaction

---

## 🔍 Search & Manage Employee (3rd Section - MAIN WORKFLOW)

This is your **primary working area**. Always visible and ready!

### Step 1: Find an Employee
```
[0x123...] [Search] [View All]
```
- Paste employee address and click **Search**
- OR click **View All** to see list of all employees

### Step 2: View Employee Details
```
┌─────────────────────────┐
│ Current Details:        │
│ Name: John Doe          │
│ Role: Employee          │
│ Days Worked: 20/30      │
│ Unpaid: 5 ETH           │
└─────────────────────────┘
```

### Step 3: Edit Details (Optional)
```
┌─────────────────────────┐
│ [Update Name]           │
│ [Update Phone]          │
│ [Rate] [Update Button]  │
└─────────────────────────┘
```

### Step 4: View All Employees (Grid)
```
Click "View All" to see scrollable grid:
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Employee 1  │ │ Employee 2  │ │ Employee 3  │
│ Details...  │ │ Details...  │ │ Details...  │
└─────────────┘ └─────────────┘ └─────────────┘

Click any employee card to load their details ↑
```

---

## ➕ Add Employee (DROPDOWN - Section 4)

**Status**: 🔴 Collapsed by default | Click to expand ↓

```
[➕ Add Employee ▼] ← Click here to expand

When expanded:
┌───────────────────────────┐
│ [Wallet Address 0x...]    │
│ [Full Name]               │
│ [Phone Number]            │
│ [Daily Rate ETH] Ξ        │
│ [Add Employee Button]     │
└───────────────────────────┘
```

### How to Use:
1. Click "➕ Add Employee" to expand
2. Fill in all 4 fields
3. Click "Add Employee" button
4. Transaction completes
5. Section collapses automatically
6. Employee now in system!

---

## 🎖️ Manager Operations (DROPDOWN - Section 5)

**Status**: 🔴 Collapsed by default | Click to expand ↓

```
[🎖️ Manager Operations ▼] ← Click here to expand

When expanded, shows 3 subsections:
├─ Register New Manager
│  [Address] [Name] [Phone] [Register]
├─ Assign Manager to Employee
│  [Employee Address] [Manager Address] [Assign]
└─ Promote Employee to Manager
   [Employee Address] [Promote]
```

### How to Use:

**Register a Manager:**
1. Expand "Manager Operations"
2. Fill in Address, Name, Phone
3. Click "Register Manager"

**Assign Manager to Employee:**
1. Scroll down in expanded section
2. Enter employee address and manager address
3. Click "Assign Manager"

**Promote Employee to Manager:**
1. Scroll down in expanded section
2. Enter employee address
3. Click "Promote to Manager"

---

## 💵 Payroll Operations (DROPDOWN - Section 6)

**Status**: 🔴 Collapsed by default | Click to expand ↓

```
[💵 Payroll Operations ▼] ← Click here to expand

When expanded, shows 2 subsections:
├─ Pay Salary
│  [Employee Address]
│  [Preview Box Shows: Name + Amount]
│  [Process Payment Button]
└─ Approve Rate Change
   [Employee Address]
   [Approve Button]
```

### How to Use:

**Pay Salary to Employee:**
1. Expand "Payroll Operations"
2. Enter employee address
3. Preview appears showing employee name and amount
4. Click "Process Payment"
5. ✅ Salary sent!

**Approve Rate Change Request:**
1. Scroll down in expanded section
2. Enter employee address
3. Click "Approve"
4. Request removed from pending list

---

## ⏳ Pending Rate Change Requests (Auto-Shows if Any)

```
If someone requested a rate change, you'll see:

[⏳ Pending Rate Requests (3)]
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ John Doe       │ │ Jane Smith     │ │ Bob Johnson    │
│ Current: 5 ETH │ │ Current: 3 ETH │ │ Current: 7 ETH │
│ Requested: 6   │ │ Requested: 5   │ │ Requested: 8   │
│ [Approve][Dec] │ │ [Approve][Dec] │ │ [Approve][Dec] │
└────────────────┘ └────────────────┘ └────────────────┘
```

### How to Use:
- **Approve**: Click green "Approve" button → Rate updated
- **Decline**: Click red "Decline" button → Request removed

---

## ⚙️ System Management (DROPDOWN - Section 7)

**Status**: 🔴 Collapsed by default | Click to expand ↓

```
[⚙️ System Management ▼] ← Click here to expand

When expanded, shows 3 subsections:
├─ Assign Shift
│  [Employee Address]
│  [Select Shift: Morning/Afternoon/Night]
│  [Assign Shift]
├─ Reset Late Strikes
│  [Employee Address]
│  [Reset Strikes]
└─ Manage Attendance
   [Employee Address]
   [Select Date Range Button] → Opens Calendar Modal
```

### How to Use:

**Assign Shift:**
1. Expand "System Management"
2. Enter employee address
3. Select shift: 🌅 9AM | ☀️ 2PM | 🌙 10PM
4. Click "Assign Shift"

**Reset Late Strikes:**
1. Scroll down in expanded section
2. Enter employee address
3. Click "Reset Strikes" (clears all late marks)

**Manage Attendance:**
1. Scroll down in expanded section
2. Enter employee address
3. Click "Select Date Range"
4. Calendar opens - pick dates for adjustment
5. Choose action (Mark Present/Absent/Late)

---

## 🎯 Common Workflows

### Workflow 1: Add New Employee
```
1. Expand [➕ Add Employee]
2. Fill: Address, Name, Phone, Daily Rate
3. Click [Add Employee]
✅ Done!
```

### Workflow 2: Pay Salary
```
1. Go to [🔍 Search & Manage Employee]
2. Search or View All
3. Find employee (verify unpaid amount)
4. Expand [💵 Payroll Operations]
5. Enter same address
6. Click [Process Payment]
✅ Salary sent!
```

### Workflow 3: Handle Rate Request
```
1. Look at [⏳ Pending Rate Requests]
2. Review current vs requested rate
3. Click [Approve] or [Decline]
✅ Done!
```

### Workflow 4: Register Manager
```
1. Expand [🎖️ Manager Operations]
2. Fill: Address, Name, Phone
3. Click [Register Manager]
4. Find employee to assign to manager
5. Enter both addresses
6. Click [Assign Manager]
✅ Done!
```

### Workflow 5: Fix Attendance Issue
```
1. Expand [⚙️ System Management]
2. Scroll to Manage Attendance
3. Enter employee address
4. Click [Select Date Range]
5. Pick dates and action
✅ Fixed!
```

---

## 💡 Tips & Tricks

### ⚡ Speed Tips:
- **Use "View All"** to find employees quickly instead of searching each one
- **Refresh the stat cards** to see live updates of balances and counts
- **Collapse sections** you don't need to save screen space

### 📋 Best Practices:
- **Always check balance** before paying salaries (see top stat card)
- **Review pending requests** regularly (auto-shows when present)
- **Verify employee details** before editing
- **Use address search** when you know the address

### ⚠️ Common Issues:
- **"Employee not found"** → Check address spelling/format
- **"Insufficient contract balance"** → Fund the contract first!
- **No pending requests shown** → All approved/declined already

---

## 🎨 Color Guide

```
🟢 Emerald   = Employee Management (Add, Search, Manage)
🟡 Amber     = Manager Operations (Register, Assign, Promote)
🔵 Blue      = Payroll Operations (Pay, Approve Rates)
🟣 Purple    = System Management (Shifts, Strikes, Attendance)
🟠 Orange    = Pending Actions (Requires attention)
```

---

## 🔐 Important Reminders

- ✅ Always double-check employee address before paying
- ✅ Verify amount in preview before confirming payment
- ✅ Fund contract if balance is low
- ✅ Use "View All" to verify employee exists before actions
- ✅ Check pending requests regularly
- ✅ Remember rate changes must be approved by admin

---

## ❓ FAQ

**Q: Can I collapse a section to save space?**
A: Yes! Click the chevron (▼) to toggle any dropdown section.

**Q: How do I see all employees?**
A: Go to Search & Manage Employee → Click "View All" button

**Q: Where are employee counts?**
A: Top stat cards show total employees and managers with refresh buttons.

**Q: How do I find pending rate requests?**
A: They auto-appear below System Management section if any exist.

**Q: Can I edit employee after adding?**
A: Yes! Search for employee, then use inline edit form next to details.

**Q: What if I make a mistake?**
A: Contact admin or use Manage Attendance to fix issues.

---

## 🚀 You're Ready!

The new dashboard is **much more efficient** than before. All functions are organized logically, and the main workflow (employee search/manage) is always visible.

**Enjoy your improved admin experience!** ✨
