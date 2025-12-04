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

    // Dashboard State
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
                const roleValue = Number(userData.role);
                if (roleValue === 1) {
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
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const assignManager = async () => {
        try {
            await contract.methods.assignManager(empForMgr, mgrForEmp).send({ from: account });
            alert("✅ Manager Assigned!");
            setEmpForMgr(''); setMgrForEmp('');
        } catch (err) {
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
            if (!userData.name || userData.name === '') {
                setPreviewUnpaidAmount('Employee not found');
                setPreviewEmployeeName('');
                return;
            }
            
            const monthlyWage = await contract.methods.getMonthlyWage(address).call();
            setPreviewEmployeeName(userData.name);
            setPreviewUnpaidAmount(Web3.utils.fromWei(monthlyWage, 'ether'));
        } catch (err) {
            setPreviewUnpaidAmount('');
            setPreviewEmployeeName('');
        }
    };

    const paySalary = async () => {
        try {
            const userData = await contract.methods.users(payEmpAddress).call();
            if (!userData.name || userData.name === '') {
                alert("❌ Error: Employee not found! Please check the address.");
                return;
            }
            
            const monthlyWage = await contract.methods.getMonthlyWage(payEmpAddress).call();
            if (BigInt(monthlyWage) === 0n) {
                alert("❌ Error: This employee has no unpaid amount!");
                return;
            }

            const web3Instance = new Web3(window.ethereum);
            const contractBal = await web3Instance.eth.getBalance(contract.options.address);
            if (BigInt(contractBal) < BigInt(monthlyWage)) {
                alert(`❌ Error: Not enough ETH in contract!`);
                return;
            }

            await contract.methods.paySalary(payEmpAddress).send({ from: account });
            alert("✅ Salary Paid!");
            setPayEmpAddress('');
            setPreviewUnpaidAmount('');
            setPreviewEmployeeName('');
            loadContractBalance();
        } catch (err) {
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const promoteToManager = async () => {
        try {
            await contract.methods.promoteToManager(promoteEmpAddress).send({ from: account });
            alert("✅ Employee Promoted to Manager!");
            setPromoteEmpAddress('');
        } catch (err) {
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const assignShift = async () => {
        try {
            await contract.methods.assignShift(shiftEmpAddress, shiftTime).send({ from: account });
            alert("✅ Shift Assigned!");
            setShiftEmpAddress('');
        } catch (err) {
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const resetStrikes = async () => {
        try {
            await contract.methods.resetLateStrikes(resetStrikesAddress).send({ from: account });
            alert("✅ Late Strikes Reset!");
            setResetStrikesAddress('');
        } catch (err) {
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
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const declineRateChange = async (empAddr) => {
        try {
            await contract.methods.declineRateChange(empAddr).send({ from: account });
            alert("✅ Rate Change Declined!");
            loadPendingRequests();
        } catch (err) {
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
            
            if (!userData.name || userData.name === '') {
                alert("❌ Employee not found!");
                setSearchedEmployee(null);
                return;
            }
            
            const monthlyWage = await contract.methods.getMonthlyWage(searchAddress).call();
            const daysWorked = await contract.methods.getDaysWorkedSinceLastPay(searchAddress).call();
            
            setSearchedEmployee({
                address: searchAddress,
                name: userData.name,
                phone: userData.phoneNumber,
                role: Number(userData.role),
                dailyRate: Web3.utils.fromWei(empData.dailyRate, 'ether'),
                unpaidAmount: Web3.utils.fromWei(monthlyWage, 'ether'),
                daysWorked: Number(daysWorked)
            });
            
            setEditName(userData.name);
            setEditPhone(userData.phoneNumber);
            setEditRate(Web3.utils.fromWei(empData.dailyRate, 'ether'));
        } catch (err) {
            alert("❌ Error searching employee: " + err.message);
        }
    };

    const updateEmployeeDetails = async () => {
        try {
            const rateWei = Web3.utils.toWei(editRate, 'ether');
            await contract.methods.updateEmployeeDetails(searchAddress, editName, editPhone).send({ from: account });
            await contract.methods.updateEmployeeRate(searchAddress, rateWei).send({ from: account });
            alert("✅ Employee details updated successfully!");
            searchEmployee();
        } catch (err) {
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
                        {/* Left: Title */}
                        <div className="flex items-center gap-3 min-w-max">
                            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-lg">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Payroll Admin</h1>
                                <p className="text-xs text-gray-400">System Control</p>
                            </div>
                        </div>

                        {/* Center: Wallet & Balance */}
                        <div className="flex items-center gap-4 flex-1 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-emerald-400" />
                                <div className="hidden sm:block">
                                    <p className="text-xs text-gray-400">Admin Wallet</p>
                                    <p className="text-sm font-mono text-emerald-300 font-bold">{account?.slice(0, 14)}...{account?.slice(-8)}</p>
                                </div>
                            </div>
                            <div className="border-l border-gray-600 h-8"></div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-blue-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Balance</p>
                                    <p className="text-sm font-bold text-blue-300">{contractBalance} ETH</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Fund Button */}
                        <button
                            onClick={() => {
                                const amount = prompt('Enter amount (ETH):');
                                if (amount) {
                                    setFundAmount(amount);
                                    fundContract();
                                }
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2 whitespace-nowrap text-sm"
                        >
                            <DollarSign className="h-4 w-4" />
                            Fund
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content - Full Width */}
            <div className="w-full bg-gray-900 min-h-[calc(100vh-80px)]">
                <div className="w-full px-6 py-8 space-y-6">
                    {/* Stats Grid - Modern Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Employees */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-purple-500/20 p-3 rounded-lg">
                                    <Users className="h-6 w-6 text-purple-400" />
                                </div>
                                <button onClick={loadStats} className="text-purple-400 hover:text-purple-300" title="Refresh">
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Employees</p>
                            <p className="text-4xl font-bold text-purple-300">{totalEmployees}</p>
                            <p className="text-xs text-gray-500 mt-2">Active in system</p>
                        </div>

                        {/* Total Managers */}
                        <div className="bg-gradient-to-br from-amber-900/40 to-amber-900/20 border border-amber-500/30 rounded-xl p-6 hover:border-amber-500/60 transition-all hover:shadow-lg hover:shadow-amber-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-amber-500/20 p-3 rounded-lg">
                                    <Award className="h-6 w-6 text-amber-400" />
                                </div>
                                <button onClick={loadStats} className="text-amber-400 hover:text-amber-300" title="Refresh">
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Team Managers</p>
                            <p className="text-4xl font-bold text-amber-300">{totalManagers}</p>
                            <p className="text-xs text-gray-500 mt-2">Leadership count</p>
                        </div>

                        {/* Pending Requests */}
                        <div className="bg-gradient-to-br from-orange-900/40 to-orange-900/20 border border-orange-500/30 rounded-xl p-6 hover:border-orange-500/60 transition-all hover:shadow-lg hover:shadow-orange-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-orange-500/20 p-3 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-orange-400" />
                                </div>
                                <button onClick={loadPendingRequests} className="text-orange-400 hover:text-orange-300" title="Refresh">
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Pending Reviews</p>
                            <p className="text-4xl font-bold text-orange-300">{pendingRequests.length}</p>
                            <p className="text-xs text-gray-500 mt-2">Rate change requests</p>
                        </div>

                        {/* Contract Balance */}
                        <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/20 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-blue-500/20 p-3 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-blue-400" />
                                </div>
                                <button onClick={loadContractBalance} className="text-blue-400 hover:text-blue-300" title="Refresh">
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Contract Balance</p>
                            <p className="text-4xl font-bold text-blue-300">{contractBalance}</p>
                            <p className="text-xs text-gray-500 mt-2">Available ETH</p>
                        </div>
                    </div>

                    {/* Main Content Grid - 2 Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Search Employee Block */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-purple-400" />
                                    Search & Manage
                                </h3>
                                
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Employee Address (0x...)"
                                        value={searchAddress}
                                        onChange={(e) => setSearchAddress(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm font-mono text-gray-200"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={searchEmployee}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                                        >
                                            Search
                                        </button>
                                        <button
                                            onClick={loadAllEmployees}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                                        >
                                            View All
                                        </button>
                                    </div>

                                    {searchedEmployee && (
                                        <div className="bg-gray-700/50 border border-purple-500/50 rounded-lg p-4 space-y-3 mt-4">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-1">Name</p>
                                                    <p className="text-white font-semibold">{searchedEmployee.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-1">Days Worked</p>
                                                    <p className="text-blue-300 font-semibold">{searchedEmployee.daysWorked}/30</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-1">Role</p>
                                                    <p className="text-purple-300 font-semibold">{searchedEmployee.role === 0 ? 'Employee' : 'Manager'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-1">Unpaid</p>
                                                    <p className="text-emerald-300 font-semibold">{searchedEmployee.unpaidAmount} ETH</p>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t border-gray-600 pt-3 space-y-3">
                                                <p className="text-xs font-semibold text-gray-300">Update Details</p>
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm text-white"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Phone"
                                                    value={editPhone}
                                                    onChange={(e) => setEditPhone(e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm text-white"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.001"
                                                            placeholder="Rate (ETH)"
                                                            value={editRate}
                                                            onChange={(e) => setEditRate(e.target.value)}
                                                            className="w-full px-3 py-2 pl-7 bg-gray-600/50 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm text-white"
                                                        />
                                                        <span className="absolute left-3 top-2 text-purple-400 font-bold">Ξ</span>
                                                    </div>
                                                    <button
                                                        onClick={updateEmployeeDetails}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-sm transition-all"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add Employee Block */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all">
                                <button
                                    onClick={() => toggleSection('addEmployee')}
                                    className="w-full flex items-center justify-between mb-4 hover:opacity-80"
                                >
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-emerald-400" />
                                        Add Employee
                                    </h3>
                                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.addEmployee ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedSections.addEmployee && (
                                    <div className="space-y-3">
                                        <input value={empAddress} placeholder="Wallet Address" onChange={(e) => setEmpAddress(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm font-mono text-gray-200" />
                                        <input value={empName} placeholder="Full Name" onChange={(e) => setEmpName(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-gray-200" />
                                        <input value={empPhone} placeholder="Phone Number" onChange={(e) => setEmpPhone(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-gray-200" />
                                        <div className="relative">
                                            <input value={empRate} placeholder="Daily Rate (ETH)" onChange={(e) => setEmpRate(e.target.value)} className="w-full px-3 py-2 pl-7 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-gray-200" />
                                            <span className="absolute left-3 top-2 text-emerald-400 font-bold">Ξ</span>
                                        </div>
                                        <button onClick={addEmployee} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-sm transition-all">Add Employee</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Manager Operations */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:border-amber-500/50 transition-all">
                                <button
                                    onClick={() => toggleSection('addManager')}
                                    className="w-full flex items-center justify-between mb-4 hover:opacity-80"
                                >
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Award className="h-5 w-5 text-amber-400" />
                                        Manager Ops
                                    </h3>
                                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.addManager ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedSections.addManager && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-300">Register Manager</p>
                                            <input value={managerAddress} placeholder="Wallet Address" onChange={(e) => setManagerAddress(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm font-mono text-gray-200" />
                                            <input value={managerName} placeholder="Full Name" onChange={(e) => setManagerName(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm text-gray-200" />
                                            <input value={managerPhone} placeholder="Phone Number" onChange={(e) => setManagerPhone(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm text-gray-200" />
                                            <button onClick={registerManager} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg text-sm transition-all">Register</button>
                                        </div>

                                        <div className="border-t border-gray-600 pt-3 space-y-2">
                                            <p className="text-xs font-semibold text-gray-300">Assign Manager</p>
                                            <input value={empForMgr} placeholder="Employee Address" onChange={(e) => setEmpForMgr(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm font-mono text-gray-200" />
                                            <input value={mgrForEmp} placeholder="Manager Address" onChange={(e) => setMgrForEmp(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm font-mono text-gray-200" />
                                            <button onClick={assignManager} className="w-full bg-white/20 border border-amber-400 text-amber-300 hover:bg-white/10 font-semibold py-2 rounded-lg text-sm transition-all">Assign</button>
                                        </div>

                                        <div className="border-t border-gray-600 pt-3 space-y-2">
                                            <p className="text-xs font-semibold text-gray-300">Promote to Manager</p>
                                            <input value={promoteEmpAddress} placeholder="Employee Address" onChange={(e) => setPromoteEmpAddress(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm font-mono text-gray-200" />
                                            <button onClick={promoteToManager} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg text-sm transition-all">Promote</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payroll Operations */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                                <button
                                    onClick={() => toggleSection('operations')}
                                    className="w-full flex items-center justify-between mb-4 hover:opacity-80"
                                >
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-blue-400" />
                                        Payroll Ops
                                    </h3>
                                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.operations ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedSections.operations && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-300">Pay Salary</p>
                                            <input value={payEmpAddress} placeholder="Employee Address" onChange={(e) => previewEmployeeSalary(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm font-mono text-gray-200" />
                                            {previewEmployeeName && (
                                                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 text-sm space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Employee:</span>
                                                        <span className="text-white font-semibold">{previewEmployeeName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Amount:</span>
                                                        <span className="text-blue-300 font-bold">{previewUnpaidAmount} ETH</span>
                                                    </div>
                                                </div>
                                            )}
                                            <button onClick={paySalary} disabled={!previewEmployeeName || previewUnpaidAmount === '0'} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded-lg text-sm transition-all">Process</button>
                                        </div>

                                        <div className="border-t border-gray-600 pt-3 space-y-2">
                                            <p className="text-xs font-semibold text-gray-300">Approve Rate Change</p>
                                            <input value={approveRateEmpAddress} placeholder="Employee Address" onChange={(e) => setApproveRateEmpAddress(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm font-mono text-gray-200" />
                                            <button onClick={approveRateChange} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-sm transition-all">Approve</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pending Requests */}
                        {pendingRequests.length > 0 && (
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-orange-500/30 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-orange-400" />
                                    Pending ({pendingRequests.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                                    {pendingRequests.map((request, idx) => (
                                        <div key={idx} className="bg-orange-900/20 border border-orange-500/50 p-3 rounded-lg text-sm">
                                            <p className="font-bold text-white">{request.name}</p>
                                            <p className="font-mono text-xs text-gray-400 truncate">{request.address}</p>
                                            <div className="bg-gray-700/50 rounded p-2 my-2 space-y-1 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Current:</span>
                                                    <span className="text-white font-semibold">{request.currentRate}</span>
                                                </div>
                                                <div className="flex justify-between text-orange-300">
                                                    <span>Requested:</span>
                                                    <span className="font-bold">{request.requestedRate}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={() => approveRateChange(request.address)} className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 rounded text-xs font-semibold transition-all">Approve</button>
                                                <button onClick={() => declineRateChange(request.address)} className="bg-red-600 hover:bg-red-700 text-white py-1 rounded text-xs font-semibold transition-all">Decline</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* System Management */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                            <button
                                onClick={() => toggleSection('system')}
                                className="w-full flex items-center justify-between mb-4 hover:opacity-80"
                            >
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-purple-400" />
                                    System Mgmt
                                </h3>
                                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.system ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.system && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-300">Assign Shift</p>
                                        <input value={shiftEmpAddress} placeholder="Employee Address" onChange={(e) => setShiftEmpAddress(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm font-mono text-gray-200" />
                                        <select value={shiftTime} onChange={(e) => setShiftTime(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm text-gray-200">
                                            <option value="32400">🌅 9:00 AM</option>
                                            <option value="50400">☀️ 2:00 PM</option>
                                            <option value="79200">🌙 10:00 PM</option>
                                        </select>
                                        <button onClick={assignShift} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm transition-all">Assign</button>
                                    </div>

                                    <div className="border-t border-gray-600 pt-3 space-y-2">
                                        <p className="text-xs font-semibold text-gray-300">Reset Strikes</p>
                                        <input value={resetStrikesAddress} placeholder="Employee Address" onChange={(e) => setResetStrikesAddress(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm font-mono text-gray-200" />
                                        <button onClick={resetStrikes} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm transition-all">Reset</button>
                                    </div>

                                    <div className="border-t border-gray-600 pt-3 space-y-2">
                                        <p className="text-xs font-semibold text-gray-300">Manage Attendance</p>
                                        <input value={selectedEmployeeForAttendance} placeholder="Employee Address" onChange={(e) => setSelectedEmployeeForAttendance(e.target.value)} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm font-mono text-gray-200" />
                                        <button onClick={() => setAttendanceModalOpen(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm transition-all">Select</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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
