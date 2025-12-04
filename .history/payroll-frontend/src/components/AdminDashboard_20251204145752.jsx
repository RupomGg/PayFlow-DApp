import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { UserPlus, Users, DollarSign, TrendingUp, Award, Clock, RefreshCw, Settings, Zap, CheckCircle, Calendar, ChevronDown, X } from 'lucide-react';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceActionModal from './AttendanceActionModal';

function AdminDashboard({ contract, account }) {
    // Manager Registration
    const [managerAddress, setManagerAddress] = useState('');
    const [managerName, setManagerName] = useState('');
    const [managerPhone, setManagerPhone] = useState('');

    // Employee Registration
    const [empAddress, setEmpAddress] = useState('');
    const [empName, setEmpName] = useState('');
    const [empPhone, setEmpPhone] = useState('');
    const [empRate, setEmpRate] = useState('');

    // Assign Manager
    const [empForMgr, setEmpForMgr] = useState('');
    const [mgrForEmp, setMgrForEmp] = useState('');

    // Pay Salary
    const [payEmpAddress, setPayEmpAddress] = useState('');
    const [previewUnpaidAmount, setPreviewUnpaidAmount] = useState('');
    const [previewEmployeeName, setPreviewEmployeeName] = useState('');

    // Contract Balance & Funding
    const [contractBalance, setContractBalance] = useState('0');
    const [fundAmount, setFundAmount] = useState('');

    // Promote to Manager
    const [promoteEmpAddress, setPromoteEmpAddress] = useState('');

    // Assign Shift
    const [shiftEmpAddress, setShiftEmpAddress] = useState('');
    const [shiftTime, setShiftTime] = useState('32400');

    // Reset Strikes
    const [resetStrikesAddress, setResetStrikesAddress] = useState('');

    // Approve Rate Change
    const [approveRateEmpAddress, setApproveRateEmpAddress] = useState('');

    // Pending Rate Requests
    const [pendingRequests, setPendingRequests] = useState([]);

    // Attendance Management
    const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] = useState('');

    // Search & Edit Employee
    const [searchAddress, setSearchAddress] = useState('');
    const [searchedEmployee, setSearchedEmployee] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editRate, setEditRate] = useState('');
    const [allEmployees, setAllEmployees] = useState([]);
    const [showAllEmployees, setShowAllEmployees] = useState(false);

    // Dashboard State - Collapsed Sections
    const [expandedSections, setExpandedSections] = useState({
        addEmployee: false,
        addManager: false,
        operations: false,
        system: false,
    });

    // Stats
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalManagers, setTotalManagers] = useState(0);

    const loadContractBalance = React.useCallback(async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const balance = await web3.eth.getBalance(contract.options.address);
            setContractBalance(Web3.utils.fromWei(balance, 'ether'));
        } catch (err) {
            console.error('Error loading contract balance:', err);
        }
    }, [contract]);

    const loadStats = React.useCallback(async () => {
        try {
            const allEmps = await contract.methods.getAllEmployees().call();
            let managers = 0;
            
            for (const empAddr of allEmps) {
                const userData = await contract.methods.users(empAddr).call();
                // Role is returned as a number (0=Employee, 1=Manager, 2=Admin)
                const roleValue = Number(userData.role);
                if (roleValue === 1) { // Role.Manager = 1
                    managers++;
                }
            }
            
            setTotalEmployees(allEmps.length);
            setTotalManagers(managers);
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    }, [contract]);

    const loadPendingRequests = React.useCallback(async () => {
        try {
            const allEmps = await contract.methods.getAllEmployees().call();
            const requests = [];
            
            for (const empAddr of allEmps) {
                const pendingRate = await contract.methods.getPendingRateRequest(empAddr).call();
                if (pendingRate && BigInt(pendingRate) > 0) {
                    const empData = await contract.methods.employees(empAddr).call();
                    const userData = await contract.methods.users(empAddr).call();
                    requests.push({
                        address: empAddr,
                        name: userData.name,
                        currentRate: Web3.utils.fromWei(empData.dailyRate, 'ether'),
                        requestedRate: Web3.utils.fromWei(pendingRate.toString(), 'ether')
                    });
                }
            }
            setPendingRequests(requests);
        } catch (err) {
            console.error("Error loading pending requests", err);
        }
    }, [contract]);

    useEffect(() => {
        loadPendingRequests();
        loadContractBalance();
        loadStats();
    }, [loadPendingRequests, loadContractBalance, loadStats]);

    const registerManager = async () => {
        try {
            await contract.methods.registerManager(managerAddress, managerName, managerPhone).send({ from: account });
            alert("✅ Manager Registered!");
            setManagerAddress(''); setManagerName(''); setManagerPhone('');
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const addEmployee = async () => {
        try {
            const rateWei = Web3.utils.toWei(empRate, 'ether');
            await contract.methods.addEmployee(empAddress, empName, empPhone, rateWei).send({ from: account });
            alert("✅ Employee Added!");
            setEmpAddress(''); setEmpName(''); setEmpPhone(''); setEmpRate('');
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const assignManager = async () => {
        try {
            await contract.methods.assignManager(empForMgr, mgrForEmp).send({ from: account });
            alert("✅ Manager Assigned!");
            setEmpForMgr(''); setMgrForEmp('');
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const fundContract = async () => {
        if (!fundAmount || parseFloat(fundAmount) <= 0) {
            alert('❌ Please enter a valid amount');
            return;
        }
        
        try {
            const amountInWei = Web3.utils.toWei(fundAmount, 'ether');
            
            // Use window.ethereum.request instead of web3.eth.sendTransaction
            await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: account,
                    to: contract.options.address,
                    value: '0x' + BigInt(amountInWei).toString(16)
                }]
            });
            
            alert(`✅ Successfully funded contract with ${fundAmount} ETH`);
            setFundAmount('');
            loadContractBalance();
        } catch (err) {
            console.error('Error funding contract:', err);
            alert('❌ Failed to fund contract: ' + err.message);
        }
    };

    const previewEmployeeSalary = async (address) => {
        setPayEmpAddress(address);
        if (!address || address.length < 42) {
            setPreviewUnpaidAmount('');
            setPreviewEmployeeName('');
            return;
        }
        
        try {
            const userData = await contract.methods.users(address).call();
            
            // Check if user exists
            if (!userData.name || userData.name === '') {
                setPreviewUnpaidAmount('Employee not found');
                setPreviewEmployeeName('');
                return;
            }
            
            // Get monthly wage
            const monthlyWage = await contract.methods.getMonthlyWage(address).call();
            
            setPreviewEmployeeName(userData.name);
            setPreviewUnpaidAmount(Web3.utils.fromWei(monthlyWage, 'ether'));
        } catch (err) {
            console.error('Error previewing employee:', err);
            setPreviewUnpaidAmount('');
            setPreviewEmployeeName('');
        }
    };

    const paySalary = async () => {
        try {
            // First, validate the employee exists
            const userData = await contract.methods.users(payEmpAddress).call();
            if (!userData.name || userData.name === '') {
                alert("❌ Error: Employee not found! Please check the address.");
                return;
            }
            
            // Get monthly wage
            const monthlyWage = await contract.methods.getMonthlyWage(payEmpAddress).call();
            if (BigInt(monthlyWage) === 0n) {
                alert("❌ Error: This employee has no unpaid amount to withdraw. They need to check in first!");
                return;
            }

            // Check contract balance using Web3 from window.ethereum
            const web3Instance = new Web3(window.ethereum);
            const contractBalance = await web3Instance.eth.getBalance(contract.options.address);
            if (BigInt(contractBalance) < BigInt(monthlyWage)) {
                alert(`❌ Error: Not enough ETH in contract! Need ${Web3.utils.fromWei(monthlyWage, 'ether')} ETH but only have ${Web3.utils.fromWei(contractBalance, 'ether')} ETH. Please deposit funds first.`);
                return;
            }

            await contract.methods.paySalary(payEmpAddress).send({ from: account });
            alert("✅ Salary Paid!");
            setPayEmpAddress('');
            setPreviewUnpaidAmount('');
            setPreviewEmployeeName('');
            loadContractBalance();
        } catch (err) {
            console.error(err);
            if (err.message.includes("Insufficient contract balance") || err.message.includes("InsufficientBalance")) {
                alert("❌ Error: Not enough ETH in contract to pay salary!");
            } else if (err.message.includes("No unpaid amount") || err.message.includes("NoUnpaidAmount")) {
                alert("❌ Error: Employee has no unpaid amount. They need to check in first!");
            } else {
                alert("❌ Error: " + (err.message || "Transaction failed"));
            }
        }
    };

    const promoteToManager = async () => {
        try {
            await contract.methods.promoteToManager(promoteEmpAddress).send({ from: account });
            alert("✅ Employee Promoted to Manager!");
            setPromoteEmpAddress('');
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const assignShift = async () => {
        try {
            await contract.methods.assignShift(shiftEmpAddress, shiftTime).send({ from: account });
            alert("✅ Shift Assigned!");
            setShiftEmpAddress('');
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const resetStrikes = async () => {
        try {
            await contract.methods.resetLateStrikes(resetStrikesAddress).send({ from: account });
            alert("✅ Late Strikes Reset!");
            setResetStrikesAddress('');
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const approveRateChange = async (empAddr = null) => {
        try {
            const targetAddr = empAddr || approveRateEmpAddress;
            await contract.methods.approveRateChange(targetAddr).send({ from: account });
            alert("✅ Rate Change Approved!");
            setApproveRateEmpAddress('');
            loadPendingRequests();
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const declineRateChange = async (empAddr) => {
        try {
            await contract.methods.declineRateChange(empAddr).send({ from: account });
            alert("✅ Rate Change Declined!");
            loadPendingRequests();
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const searchEmployee = async () => {
        if (!searchAddress) {
            alert("❌ Please enter an address");
            return;
        }
        
        try {
            const userData = await contract.methods.users(searchAddress).call();
            const empData = await contract.methods.employees(searchAddress).call();
            
            // Check if user exists by checking if name is not empty
            if (!userData.name || userData.name === '') {
                alert("❌ Employee not found!");
                setSearchedEmployee(null);
                return;
            }
            
            // Get monthly wage using the new function
            const monthlyWage = await contract.methods.getMonthlyWage(searchAddress).call();
            const daysWorked = await contract.methods.getDaysWorkedSinceLastPay(searchAddress).call();
            
            setSearchedEmployee({
                address: searchAddress,
                name: userData.name,
                phone: userData.phoneNumber,
                role: Number(userData.role), // 0=Employee, 1=Manager, 2=Admin
                dailyRate: Web3.utils.fromWei(empData.dailyRate, 'ether'),
                unpaidAmount: Web3.utils.fromWei(monthlyWage, 'ether'),
                daysWorked: Number(daysWorked)
            });
            
            setEditName(userData.name);
            setEditPhone(userData.phoneNumber);
            setEditRate(Web3.utils.fromWei(empData.dailyRate, 'ether'));
        } catch (err) {
            console.error(err);
            alert("❌ Error searching employee: " + err.message);
        }
    };

    const updateEmployeeDetails = async () => {
        try {
            const rateWei = Web3.utils.toWei(editRate, 'ether');
            
            // Update name and phone
            await contract.methods.updateEmployeeDetails(searchAddress, editName, editPhone).send({ from: account });
            
            // Update rate
            await contract.methods.updateEmployeeRate(searchAddress, rateWei).send({ from: account });
            
            alert("✅ Employee details updated successfully!");
            searchEmployee(); // Refresh data
        } catch (err) {
            console.error(err);
            alert("❌ Error updating employee: " + err.message);
        }
    };

    const loadAllEmployees = async () => {
        try {
            const empAddresses = await contract.methods.getAllEmployees().call();
            const empList = [];
            
            for (const addr of empAddresses) {
                const userData = await contract.methods.users(addr).call();
                const empData = await contract.methods.employees(addr).call();
                
                // Get monthly wage and days worked using new functions
                const monthlyWage = await contract.methods.getMonthlyWage(addr).call();
                const daysWorked = await contract.methods.getDaysWorkedSinceLastPay(addr).call();
                
                empList.push({
                    address: addr,
                    name: userData.name,
                    phone: userData.phoneNumber,
                    dailyRate: Web3.utils.fromWei(empData.dailyRate, 'ether'),
                    unpaidAmount: Web3.utils.fromWei(monthlyWage, 'ether'),
                    daysWorked: Number(daysWorked)
                });
            }
            
            setAllEmployees(empList);
            setShowAllEmployees(true);
        } catch (err) {
            console.error(err);
            alert("❌ Error loading employees: " + err.message);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Modern Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-emerald-500/30 shadow-2xl shadow-emerald-900/20">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between gap-6">
                        {/* Left: Title & Logo */}
                        <div className="flex items-center gap-3 min-w-max">
                            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-lg">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">Payroll Admin</h1>
                                <p className="text-xs text-gray-400">System Control</p>
                            </div>
                        </div>

                        {/* Center: Wallet Address & Balance */}
                        <div className="flex items-center gap-6 flex-1 px-6 py-2 bg-gray-800/50 rounded-lg border border-gray-700 mx-4">
                            <div className="flex items-center gap-2 min-w-max">
                                <Users className="h-4 w-4 text-emerald-400" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Wallet</p>
                                    <p className="text-sm font-mono text-emerald-300 font-bold">{account?.slice(0, 12)}...{account?.slice(-10)}</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-2 min-w-max">
                                <DollarSign className="h-4 w-4 text-blue-400" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Balance</p>
                                    <p className="text-sm font-bold text-blue-300">{contractBalance} ETH</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Fund Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    const amount = prompt('Enter amount (ETH):');
                                    if (amount) {
                                        setFundAmount(amount);
                                        fundContract();
                                    }
                                }}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap text-sm"
                            >
                                <DollarSign className="h-4 w-4" />
                                Fund
                            </button>
                            <button
                                onClick={loadStats}
                                className="bg-gray-700 hover:bg-gray-600 text-gray-200 p-2 rounded-lg transition-all"
                                title="Refresh stats"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Full Width */}
            <div className="w-full bg-gray-900 min-h-[calc(100vh-80px)]">
                <div className="w-full px-6 py-8 space-y-6">
                    {/* Stats Grid - Full Width Modern Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Employees Block */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-purple-500/20 p-3 rounded-xl">
                                    <Users className="h-6 w-6 text-purple-400" />
                                </div>
                                <button
                                    onClick={loadStats}
                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Employees</p>
                            <p className="text-4xl font-bold text-purple-300 mb-2">{totalEmployees}</p>
                            <p className="text-xs text-gray-500">Active in system</p>
                        </div>

                        {/* Total Managers Block */}
                        <div className="bg-gradient-to-br from-amber-900/40 to-amber-900/20 border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/60 transition-all hover:shadow-lg hover:shadow-amber-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-amber-500/20 p-3 rounded-xl">
                                    <Award className="h-6 w-6 text-amber-400" />
                                </div>
                                <button
                                    onClick={loadStats}
                                    className="text-amber-400 hover:text-amber-300 transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Team Managers</p>
                            <p className="text-4xl font-bold text-amber-300 mb-2">{totalManagers}</p>
                            <p className="text-xs text-gray-500">Leadership count</p>
                        </div>

                        {/* Pending Requests Block */}
                        <div className="bg-gradient-to-br from-orange-900/40 to-orange-900/20 border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/60 transition-all hover:shadow-lg hover:shadow-orange-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-orange-500/20 p-3 rounded-xl">
                                    <TrendingUp className="h-6 w-6 text-orange-400" />
                                </div>
                                <button
                                    onClick={loadPendingRequests}
                                    className="text-orange-400 hover:text-orange-300 transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Pending Reviews</p>
                            <p className="text-4xl font-bold text-orange-300 mb-2">{pendingRequests.length}</p>
                            <p className="text-xs text-gray-500">Rate change requests</p>
                        </div>

                        {/* Contract Balance Block */}
                        <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/20 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/60 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-blue-500/20 p-3 rounded-xl">
                                    <DollarSign className="h-6 w-6 text-blue-400" />
                                </div>
                                <button
                                    onClick={loadContractBalance}
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Contract Balance</p>
                            <p className="text-4xl font-bold text-blue-300 mb-2">{contractBalance}</p>
                            <p className="text-xs text-gray-500">Available ETH</p>
                        </div>
                    </div>

            {/* Fund Contract - Compact */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-600">Amount (ETH)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 10"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600">Current Balance</label>
                        <div className="w-full px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm font-bold text-blue-600">{contractBalance} ETH</div>
                    </div>
                    <button
                        onClick={fundContract}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 self-end text-sm"
                    >
                        <DollarSign className="h-4 w-4" />
                        Fund
                    </button>
                </div>
            </div>

            {/* Search & Manage Employee - Always Visible */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Search & Manage Employee
                </h3>
                
                {/* Search Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Employee Address (0x...)"
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        className="md:col-span-2 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition-all font-mono text-xs"
                    />
                    <button
                        onClick={searchEmployee}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg text-sm"
                    >
                        Search
                    </button>
                    <button
                        onClick={loadAllEmployees}
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg text-sm"
                    >
                        View All
                    </button>
                </div>

                {/* Employee Details & Edit Form - Compact */}
                {searchedEmployee && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Current Details */}
                            <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Name:</span>
                                    <span className="font-bold text-gray-900">{searchedEmployee.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Role:</span>
                                    <span className="font-bold text-purple-600">{searchedEmployee.role === 0 ? 'Employee' : searchedEmployee.role === 1 ? 'Manager' : 'Admin'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Days Worked:</span>
                                    <span className="font-bold text-blue-600">{searchedEmployee.daysWorked}/30</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Unpaid:</span>
                                    <span className="font-bold text-emerald-600">{searchedEmployee.unpaidAmount} ETH</span>
                                </div>
                            </div>

                            {/* Edit Form */}
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Phone"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.001"
                                            placeholder="Rate (ETH)"
                                            value={editRate}
                                            onChange={(e) => setEditRate(e.target.value)}
                                            className="w-full px-3 py-2 pl-8 bg-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm"
                                        />
                                        <span className="absolute left-3 top-2 text-purple-600 font-bold text-sm">Ξ</span>
                                    </div>
                                    <button
                                        onClick={updateEmployeeDetails}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg font-semibold transition-all text-sm"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* All Employees List - Compact */}
                {showAllEmployees && allEmployees.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-900">All Employees ({allEmployees.length})</h4>
                            <button
                                onClick={() => setShowAllEmployees(false)}
                                className="text-xs text-gray-600 hover:text-gray-900 font-semibold"
                            >
                                ✕ Close
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                            {allEmployees.map((emp, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => {
                                        setSearchAddress(emp.address);
                                        setShowAllEmployees(false);
                                        searchEmployee();
                                    }}
                                    className="bg-gray-50 hover:bg-purple-50 p-3 rounded-lg border border-gray-200 hover:border-purple-300 cursor-pointer transition-all group text-sm"
                                >
                                    <h4 className="font-bold text-gray-900">{emp.name}</h4>
                                    <p className="text-xs font-mono text-gray-600 truncate">{emp.address.slice(0, 10)}...{emp.address.slice(-6)}</p>
                                    <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                                        <div><span className="text-gray-600">Rate:</span> <span className="font-bold text-purple-600">{emp.dailyRate}</span></div>
                                        <div><span className="text-gray-600">Days:</span> <span className="font-bold text-blue-600">{emp.daysWorked}</span></div>
                                        <div><span className="text-gray-600">Unpaid:</span> <span className="font-bold text-emerald-600">{emp.unpaidAmount}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Collapsible Employee & Manager Management */}
            <div className="space-y-3">
                {/* Add Employee Dropdown */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <button
                        onClick={() => toggleSection('addEmployee')}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500 p-2 rounded-lg">
                                <UserPlus className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900">Add Employee</h3>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${expandedSections.addEmployee ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedSections.addEmployee && (
                        <div className="p-4 space-y-3 border-t border-gray-200 bg-gray-50">
                            <input
                                value={empAddress}
                                placeholder="Wallet Address (0x...)"
                                onChange={(e) => setEmpAddress(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none transition-all text-sm font-mono"
                            />
                            <input
                                value={empName}
                                placeholder="Full Name"
                                onChange={(e) => setEmpName(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none transition-all text-sm"
                            />
                            <input
                                value={empPhone}
                                placeholder="Phone Number"
                                onChange={(e) => setEmpPhone(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none transition-all text-sm"
                            />
                            <div className="relative">
                                <input
                                    value={empRate}
                                    placeholder="Daily Rate (ETH)"
                                    onChange={(e) => setEmpRate(e.target.value)}
                                    className="w-full px-3 py-2 pl-8 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none transition-all text-sm"
                                />
                                <span className="absolute left-3 top-2 text-emerald-600 font-bold">Ξ</span>
                            </div>
                            <button
                                onClick={addEmployee}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                            >
                                Add Employee
                            </button>
                        </div>
                    )}
                </div>

                {/* Assign Manager Dropdown */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <button
                        onClick={() => toggleSection('addManager')}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500 p-2 rounded-lg">
                                <Award className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900">Manager Operations</h3>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${expandedSections.addManager ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedSections.addManager && (
                        <div className="p-4 space-y-3 border-t border-gray-200 bg-gray-50">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-600">Register New Manager</p>
                                <input
                                    value={managerAddress}
                                    placeholder="Wallet Address (0x...)"
                                    onChange={(e) => setManagerAddress(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm font-mono"
                                />
                                <input
                                    value={managerName}
                                    placeholder="Full Name"
                                    onChange={(e) => setManagerName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm"
                                />
                                <input
                                    value={managerPhone}
                                    placeholder="Phone Number"
                                    onChange={(e) => setManagerPhone(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm"
                                />
                                <button
                                    onClick={registerManager}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                                >
                                    Register Manager
                                </button>
                            </div>

                            <div className="border-t border-gray-300 pt-3 space-y-2">
                                <p className="text-xs font-semibold text-gray-600">Assign Manager to Employee</p>
                                <input
                                    value={empForMgr}
                                    placeholder="Employee Address (0x...)"
                                    onChange={(e) => setEmpForMgr(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm font-mono"
                                />
                                <input
                                    value={mgrForEmp}
                                    placeholder="Manager Address (0x...)"
                                    onChange={(e) => setMgrForEmp(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm font-mono"
                                />
                                <button
                                    onClick={assignManager}
                                    className="w-full bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold py-2 rounded-lg transition-all text-sm"
                                >
                                    Assign Manager
                                </button>
                            </div>

                            <div className="border-t border-gray-300 pt-3 space-y-2">
                                <p className="text-xs font-semibold text-gray-600">Promote Employee to Manager</p>
                                <input
                                    value={promoteEmpAddress}
                                    placeholder="Employee Address (0x...)"
                                    onChange={(e) => setPromoteEmpAddress(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm font-mono"
                                />
                                <button
                                    onClick={promoteToManager}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                                >
                                    Promote to Manager
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payroll Operations - Collapsible */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('operations')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900">Payroll Operations</h3>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${expandedSections.operations ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.operations && (
                    <div className="p-4 space-y-4 border-t border-gray-200 bg-gray-50">
                        {/* Pay Salary */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-600">Pay Salary</p>
                            <input
                                value={payEmpAddress}
                                placeholder="Employee Address (0x...)"
                                onChange={(e) => previewEmployeeSalary(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm font-mono"
                            />
                            {previewEmployeeName && (
                                <div className="bg-blue-50 border border-blue-300 rounded-lg p-2 text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 font-medium">Employee:</span>
                                        <span className="font-bold text-gray-900">{previewEmployeeName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 font-medium">Amount:</span>
                                        <span className="font-bold text-blue-600">{previewUnpaidAmount} ETH</span>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={paySalary}
                                disabled={!previewEmployeeName || previewUnpaidAmount === '0'}
                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                            >
                                Process Payment
                            </button>
                        </div>

                        <div className="border-t border-gray-300 pt-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-600">Approve Rate Change</p>
                            <input
                                value={approveRateEmpAddress}
                                placeholder="Employee Address (0x...)"
                                onChange={(e) => setApproveRateEmpAddress(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm font-mono"
                            />
                            <button
                                onClick={approveRateChange}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pending Rate Change Requests - Compact */}
            {pendingRequests.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-orange-200 overflow-hidden">
                    <div className="bg-orange-50 p-3 border-b border-orange-200">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                            <h3 className="font-bold text-gray-900">Pending Rate Requests ({pendingRequests.length})</h3>
                        </div>
                    </div>
                    <div className="p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
                            {pendingRequests.map((request, idx) => (
                                <div key={idx} className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-sm">
                                    <h4 className="font-bold text-gray-900 mb-1">{request.name}</h4>
                                    <p className="font-mono text-xs text-gray-600 truncate mb-2" title={request.address}>{request.address}</p>
                                    <div className="bg-white rounded p-2 mb-2 space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Current:</span>
                                            <span className="font-bold">{request.currentRate} ETH</span>
                                        </div>
                                        <div className="flex justify-between text-orange-600">
                                            <span className="font-semibold">Requested:</span>
                                            <span className="font-bold">{request.requestedRate} ETH</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => approveRateChange(request.address)}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white py-1 rounded text-xs font-semibold transition-all"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => declineRateChange(request.address)}
                                            className="bg-red-500 hover:bg-red-600 text-white py-1 rounded text-xs font-semibold transition-all"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* System Management - Collapsible */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('system')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-500 p-2 rounded-lg">
                            <Settings className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900">System Management</h3>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${expandedSections.system ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.system && (
                    <div className="p-4 space-y-4 border-t border-gray-200 bg-gray-50">
                        {/* Assign Shift */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-600">Assign Shift</p>
                            <input
                                value={shiftEmpAddress}
                                placeholder="Employee Address (0x...)"
                                onChange={(e) => setShiftEmpAddress(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm font-mono"
                            />
                            <select
                                value={shiftTime}
                                onChange={(e) => setShiftTime(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="32400">🌅 9:00 AM (Morning)</option>
                                <option value="50400">☀️ 2:00 PM (Afternoon)</option>
                                <option value="79200">🌙 10:00 PM (Night)</option>
                            </select>
                            <button
                                onClick={assignShift}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                            >
                                Assign Shift
                            </button>
                        </div>


                        <div className="border-t border-gray-300 pt-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-600">Manage Attendance</p>
                            <input
                                value={selectedEmployeeForAttendance}
                                placeholder="Employee Address (0x...)"
                                onChange={(e) => setSelectedEmployeeForAttendance(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm font-mono"
                            />
                            <button
                                onClick={() => setAttendanceModalOpen(true)}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                            >
                                Select Date Range
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Attendance Action Modal */}
        <AttendanceActionModal
            isOpen={attendanceModalOpen}
            onClose={() => {
                setAttendanceModalOpen(false);
                setSelectedEmployeeForAttendance('');
            }}
            contract={contract}
            employeeAddress={selectedEmployeeForAttendance}
            onSuccess={() => {
                loadPendingRequests();
            }}
        />
        </div>
    );
}

export default AdminDashboard;
