# 🎯 Payroll DApp - Decentralized Payroll Management System

A blockchain-based payroll management system built on Solidity smart contracts with a modern React frontend. This system enables transparent, automated, and decentralized employee payroll processing with built-in attendance tracking and role-based access control.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Smart Contract Functions](#smart-contract-functions)
- [Dashboard Screenshots](#dashboard-screenshots)

---

## 🌟 Overview

The **Payroll DApp** is a decentralized application that revolutionizes payroll management by leveraging blockchain technology. It eliminates intermediaries, ensures transparency, and provides immutable records of all payroll transactions. The system is designed with three distinct user roles: **Admin**, **Manager**, and **Employee**, each with specific permissions and responsibilities.

**Key Benefits:**
- ✅ Transparent and immutable payroll records
- ✅ Reduced administrative overhead
- ✅ Real-time attendance tracking
- ✅ Automated salary calculations
- ✅ Secure blockchain-based transactions
- ✅ Role-based access control

---

## 🚀 Features

### 1. **Employee Management**
- Register employees with name, phone number, and daily rate
- Assign employees to specific managers for supervision
- Update employee details and rates dynamically
- Maintain a comprehensive employee database on-chain

### 2. **Manager Hierarchy**
- Register managers at the admin level
- Assign employees to individual managers
- Managers oversee their employees' attendance and performance
- Request salary rate changes for employees

### 3. **Attendance Tracking**
- Daily check-in system with automatic timestamp recording
- Attendance status categories: Present, Absent, Late
- Grace period of 15 minutes for late arrivals
- Late strike system with automatic penalties
- Calendar view for attendance history

### 4. **Shift Management**
- Predefined shift times:
  - **Morning Shift:** 9:00 AM
  - **Afternoon Shift:** 2:00 PM
  - **Night Shift:** 10:00 PM
- Flexible shift assignments per employee
- Grace period for late arrivals (15 minutes)

### 5. **Salary Management**
- Configurable daily rates per employee
- Rate change request and approval workflow
- Unpaid amount calculation based on days worked
- Secure salary payout to employee wallets
- Complete payout history on blockchain

### 6. **Admin Controls**
- Register managers and employees
- Manage the entire payroll system
- Approve rate change requests
- Deposit funds into the contract
- View pending rate requests
- Reset employee late strikes
- Manual attendance marking (if needed)

### 7. **Security & Gas Optimization**
- Custom error handling for gas efficiency
- Role-based access modifiers
- Secure address-based authentication
- Optimized data structures (uint32, uint8, uint64)
- No string comparisons or redundant storage

---

## 🏗️ System Architecture

### Smart Contract Components

The `PayrollSystem.sol` contract is organized into several key sections:

**Data Structures:**
- `UserDetail`: User profile information (name, phone, role)
- `AttendanceRecord`: Attendance status with date
- `EmployeeData`: Employee-specific information (rate, manager, shifts, strikes)
- `PayoutRecord`: Historical payout information

**State Management:**
- User mappings with role-based access
- Employee-to-manager relationships
- Attendance history tracking
- Payout records for auditing
- Pending rate change requests

**Key Constants:**
- Check-in cooldown: 24 hours
- Late grace period: 15 minutes
- Late penalty threshold: 4 strikes

---

## 👥 User Roles

### 🔐 **Admin**
Full system control and management responsibilities.

**Permissions:**
- Register managers
- Register employees
- Assign shifts to employees
- Assign employees to managers
- Approve rate change requests
- Deposit contract funds
- View all system data
- Reset employee strikes

**Dashboard Features:**
- Complete employee and manager lists
- Rate change request approvals
- Contract balance overview
- Salary payment processing
- System statistics and analytics

---

### 👔 **Manager**
Middle-tier role for employee supervision and payroll oversight.

**Permissions:**
- View assigned employees
- Mark attendance for employees
- Request salary rate changes
- View employee details and attendance history
- Monitor employee performance metrics

**Dashboard Features:**
- Employee roster with attendance status
- Real-time attendance marking interface
- Salary calculation and payment preview
- Performance metrics and late strike tracking
- Attendance calendar view

---

### 💼 **Employee**
Individual contributor role with basic self-service features.

**Permissions:**
- Daily check-in/attendance marking
- View personal attendance history
- Monitor earned and unpaid amounts
- View personal payment history

**Dashboard Features:**
- Personal attendance calendar
- Current and historical salary information
- Check-in status and timing
- Payout records and earnings breakdown

---

## 💻 Technology Stack

### Frontend
- **React 19.2.0** - Modern UI framework with hooks
- **Vite 7.2** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **ethers.js 6.16** - Ethereum library for contract interaction
- **Web3 4.16** - Web3 provider and contract communication
- **Lucide React 0.555** - Beautiful SVG icons

### Blockchain
- **Solidity ^0.8.0** - Smart contract language
- **Custom Gas Optimization** - Efficient contract design
- **MetaMask Integration** - Wallet connection

### Development Tools
- **ESLint 9.39** - Code quality and style checking
- **PostCSS** - CSS transformation
- **Autoprefixer** - CSS vendor prefixing

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MetaMask browser extension
- Access to an Ethereum test network (Sepolia, Goerli, etc.)

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd payroll-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the contract connection:**
   - Update `src/contractConfig.js` with your deployed contract address and ABI
   - Ensure the ABI matches your deployed `PayrollSystem.sol` contract

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Run linting:**
   ```bash
   npm run lint
   ```

### Smart Contract Deployment

1. **Compile the contract:**
   ```bash
   solc --optimize PayrollSystem.sol
   ```

2. **Deploy to your chosen network:**
   - Use Remix IDE, Hardhat, or Truffle
   - Deploy to Sepolia or other test networks for development
   - Update contract address in `contractConfig.js` after deployment

3. **Fund the contract:**
   - Send ETH to the contract address for salary payments
   - Can be done through the Admin Dashboard

---

## 📖 Usage Guide

### Getting Started

1. **Connect Wallet:**
   - Click "Connect Wallet" button
   - Approve MetaMask connection
   - System will automatically detect your role

2. **Select Network:**
   - Ensure MetaMask is connected to the correct network
   - Switch networks if deploying to different chains

### Admin Workflow

1. **Register Managers:**
   - Navigate to Admin Dashboard
   - Enter manager wallet address, name, and phone
   - Click "Register Manager"

2. **Register Employees:**
   - Enter employee wallet, name, phone, and daily rate
   - Click "Add Employee"

3. **Assign Shifts:**
   - Select employee and shift time
   - Valid times: 9 AM, 2 PM, 10 PM
   - Confirm assignment

4. **Manage Managers:**
   - Assign employees to specific managers
   - Managers gain supervisory privileges

5. **Approve Rate Changes:**
   - Review pending rate change requests
   - Approve or decline requests

6. **Process Payments:**
   - Select employee to pay
   - Review unpaid amount
   - Confirm payment to employee wallet

### Manager Workflow

1. **View Employees:**
   - See list of assigned employees
   - Check attendance status and rates

2. **Mark Attendance:**
   - Open attendance calendar
   - Select date and mark status (Present/Absent/Late)
   - System automatically calculates late strikes

3. **Request Rate Changes:**
   - Submit rate change requests for employees
   - Wait for admin approval

4. **Monitor Performance:**
   - Track employee attendance patterns
   - Monitor late strikes and performance

### Employee Workflow

1. **Daily Check-in:**
   - Click check-in button
   - System records time and compares with shift start time
   - Automatic late detection

2. **View Attendance:**
   - See personal attendance calendar
   - Check status for each day

3. **Monitor Earnings:**
   - View total earned amount
   - Check unpaid amount
   - Review payment history

---

## 📝 Smart Contract Functions

### User Management
- `registerManager()` - Register a new manager (Admin only)
- `addEmployee()` - Add new employee (Admin/Manager)
- `assignShift()` - Assign shift to employee (Admin/Manager)
- `assignManager()` - Assign employee to manager (Admin only)

### Attendance
- `checkIn()` - Mark attendance for current day (Employee)
- `markAttendance()` - Manual attendance marking (Admin/Manager)
- `getAttendanceRange()` - Query attendance for date range

### Salary Management
- `requestRateChange()` - Request new salary rate (Manager only)
- `approveRateChange()` - Approve rate change (Admin only)
- `declineRateChange()` - Decline rate change (Admin only)
- `paySalary()` - Process salary payment (Admin only)
- `getUnpaidAmount()` - Calculate pending salary

### Data Retrieval
- `users()` - Get user information
- `employees()` - Get employee details
- `payoutHistory()` - Get payment records
- `attendanceRecords()` - Get attendance history
- `managerEmployees()` - Get employees under manager

### Admin Functions
- `resetLateStrikes()` - Reset employee strikes (Admin only)
- `receive()` - Accept ETH deposits for salary fund

---

## 🖼️ Dashboard Screenshots

### Admin Dashboard
![Admin Dashboard](../Admin%20Dashboard.png)
The Admin Dashboard provides comprehensive system control including employee registration, manager assignment, rate approvals, and salary management.

### Manager Dashboard
![Manager Dashboard](../Manager%20Dashboard.png)
The Manager Dashboard allows supervisors to manage their team's attendance, mark presences, and request salary adjustments.

### Employee Dashboard
![Employee Dashboard](../Employee%20Dashboard.png)
The Employee Dashboard shows personal attendance records, current earnings, and payment history.

### System Flow
![Payflow Diagram](../Payflow.png)
Illustrates the complete workflow and data flow through the Payroll DApp system.

---

## 🔒 Security Features

- **Custom Errors:** Gas-efficient error handling without string storage
- **Role-Based Access Control:** Modifier-based permission system
- **Immutable Records:** Blockchain ensures data integrity
- **Timestamp Verification:** Prevents double check-ins with 24-hour cooldown
- **Manager Verification:** Only assigned managers can perform employee actions

---

## 📊 Contract Statistics

- **Total Users:** Admin, Managers, and Employees tracked separately
- **Attendance Records:** Immutable on-chain history
- **Payout History:** Complete financial audit trail
- **Gas Optimized:** Uses uint32, uint64 for storage efficiency

---

## 🤝 Contributing

This is a project-specific implementation. For modifications or enhancements:
1. Test changes on a local Ethereum network (Ganache)
2. Ensure all role-based permissions are maintained
3. Update ABI in `contractConfig.js` after recompiling
4. Test frontend integration with updated contract

---

## 📄 License

SPDX-License-Identifier: MIT

---

## 📞 Support

For issues or questions:
- Check contract deployment address in `contractConfig.js`
- Verify MetaMask is connected to correct network
- Ensure wallet has sufficient gas for transactions
- Review contract event logs for transaction history

---

**Built with ❤️ on Blockchain Technology**
