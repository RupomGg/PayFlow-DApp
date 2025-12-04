import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { UserPlus, Users, DollarSign, TrendingUp, Award, Clock, RefreshCw, Settings, Zap, CheckCircle } from 'lucide-react';

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

    // Promote to Manager
    const [promoteEmpAddress, setPromoteEmpAddress] = useState('');

    // Assign Shift
    const [shiftEmpAddress, setShiftEmpAddress] = useState('');
    const [shiftTime, setShiftTime] = useState('32400');

    // Adjust Attendance
    const [adjustEmpAddress, setAdjustEmpAddress] = useState('');
    const [unpaidDays, setUnpaidDays] = useState('');

    // Reset Strikes
    const [resetStrikesAddress, setResetStrikesAddress] = useState('');

    // Approve Rate Change
    const [approveRateEmpAddress, setApproveRateEmpAddress] = useState('');

    // Pending Rate Requests
    const [pendingRequests, setPendingRequests] = useState([]);

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
    }, [loadPendingRequests]);

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

    const paySalary = async () => {
        try {
            // First, validate the employee exists and has unpaid amount
            const empData = await contract.methods.employees(payEmpAddress).call();
            if (empData.walletAddress === '0x0000000000000000000000000000000000000000') {
                alert("❌ Error: Employee not found! Please check the address.");
                return;
            }
            
            if (BigInt(empData.currentUnpaidAmount) === 0n) {
                alert("❌ Error: This employee has no unpaid amount to withdraw. They need to check in first!");
                return;
            }

            // Check contract balance using Web3 from window.ethereum
            const web3Instance = new Web3(window.ethereum);
            const contractBalance = await web3Instance.eth.getBalance(contract.options.address);
            if (BigInt(contractBalance) < BigInt(empData.currentUnpaidAmount)) {
                alert(`❌ Error: Not enough ETH in contract! Need ${Web3.utils.fromWei(empData.currentUnpaidAmount, 'ether')} ETH but only have ${Web3.utils.fromWei(contractBalance, 'ether')} ETH. Please deposit funds first.`);
                return;
            }

            await contract.methods.paySalary(payEmpAddress).send({ from: account });
            alert("✅ Salary Paid!");
            setPayEmpAddress('');
        } catch (err) {
            console.error(err);
            if (err.message.includes("Insufficient contract balance")) {
                alert("❌ Error: Not enough ETH in contract to pay salary!");
            } else if (err.message.includes("No unpaid amount")) {
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

    const adjustAttendance = async () => {
        try {
            await contract.methods.adjustAttendance(adjustEmpAddress, unpaidDays).send({ from: account });
            alert("✅ Attendance Adjusted!");
            setAdjustEmpAddress(''); setUnpaidDays('');
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl p-8 shadow-2xl shadow-emerald-500/20">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap className="h-8 w-8 text-yellow-300 animate-pulse" />
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Admin Control Center</h1>
                    </div>
                    <p className="text-emerald-50 text-base sm:text-lg font-medium">Complete system management and control</p>
                </div>
            </div>

            {/* Employee Management Section */}
            <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-emerald-700" />
                    Employee Management
                </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Employee */}
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-7">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                        <UserPlus className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Add Employee</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Register new employee</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input value={empAddress} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="0x..." onChange={e => setEmpAddress(e.target.value)} />
                                <input value={empName} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300" placeholder="Full Name" onChange={e => setEmpName(e.target.value)} />
                                <input value={empPhone} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300" placeholder="Phone Number" onChange={e => setEmpPhone(e.target.value)} />
                                <div className="relative">
                                    <input value={empRate} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all pl-12 placeholder:text-gray-400 hover:border-gray-300" placeholder="Daily Rate (ETH)" onChange={e => setEmpRate(e.target.value)} />
                                    <span className="absolute left-4 top-4 text-emerald-600 font-bold text-lg">Ξ</span>
                                </div>
                                <button onClick={addEmployee} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transform">
                                    Add Employee
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Promote to Manager */}
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-7">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                        <Award className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Promote to Manager</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Upgrade employee role</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input value={promoteEmpAddress} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Employee Address (0x...)" onChange={e => setPromoteEmpAddress(e.target.value)} />
                                <button onClick={promoteToManager} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transform">
                                    Promote to Manager
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manager Management Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="h-6 w-6 text-emerald-700" />
                    Manager Management
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Register Manager */}
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-7">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                        <UserPlus className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Register Manager</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Add new team leader</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input value={managerAddress} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="0x..." onChange={e => setManagerAddress(e.target.value)} />
                                <input value={managerName} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300" placeholder="Full Name" onChange={e => setManagerName(e.target.value)} />
                                <input value={managerPhone} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300" placeholder="Phone Number" onChange={e => setManagerPhone(e.target.value)} />
                                <button onClick={registerManager} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transform">
                                    Register Manager
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Assign Manager */}
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-7">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Assign Manager</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Link employee to manager</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input value={empForMgr} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Employee Address (0x...)" onChange={e => setEmpForMgr(e.target.value)} />
                                <input value={mgrForEmp} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Manager Address (0x...)" onChange={e => setMgrForEmp(e.target.value)} />
                                <button onClick={assignManager} className="w-full bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600 font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] transform">
                                    Assign Manager
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payroll Operations Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-emerald-700" />
                    Payroll Operations
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pay Salary */}
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-7">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                        <DollarSign className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Pay Salary</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Process employee payment</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input value={payEmpAddress} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Employee Address (0x...)" onChange={e => setPayEmpAddress(e.target.value)} />
                                <button onClick={paySalary} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transform flex items-center justify-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Process Payment
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Approve Rate Change */}
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-7">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                                <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                        <CheckCircle className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Approve Rate Change</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Approve manager requests</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input value={approveRateEmpAddress} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Employee Address (0x...)" onChange={e => setApproveRateEmpAddress(e.target.value)} />
                                <button onClick={approveRateChange} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transform">
                                    Approve Rate Change
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Rate Change Requests */}
            {pendingRequests.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Pending Rate Change Requests</h2>
                                <p className="text-orange-100 text-sm mt-0.5">{pendingRequests.length} {pendingRequests.length === 1 ? 'request' : 'requests'} awaiting approval</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingRequests.map((request, idx) => (
                                <div key={idx} className="group relative bg-gradient-to-br from-orange-50 to-yellow-50 p-5 rounded-2xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                                    <div className="relative">
                                        <div className="mb-4">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">{request.name}</h3>
                                            <p className="font-mono text-xs text-gray-600 truncate" title={request.address}>{request.address}</p>
                                        </div>
                                        
                                        <div className="bg-white rounded-xl p-4 mb-4 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 font-medium">Current Rate:</span>
                                                <span className="text-sm font-bold text-gray-900">{request.currentRate} ETH</span>
                                            </div>
                                            <div className="h-px bg-gray-200"></div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-orange-600 font-medium">Requested Rate:</span>
                                                <span className="text-lg font-bold text-orange-600">{request.requestedRate} ETH</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => approveRateChange(request.address)} 
                                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => declineRateChange(request.address)} 
                                                className="flex items-center justify-center gap-2 bg-white border-2 border-red-400 text-red-600 hover:bg-red-50 hover:border-red-600 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* System Management Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="h-6 w-6 text-emerald-700" />
                    System Management
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assign Shift */}
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-7">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                        <Clock className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Assign Shift</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Set work schedule</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input value={shiftEmpAddress} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Employee Address (0x...)" onChange={e => setShiftEmpAddress(e.target.value)} />
                                <select value={shiftTime} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all appearance-none hover:border-gray-300 cursor-pointer" onChange={e => setShiftTime(e.target.value)}>
                                    <option value="32400">🌅 9:00 AM (Morning)</option>
                                    <option value="50400">☀️ 2:00 PM (Afternoon)</option>
                                    <option value="79200">🌙 10:00 PM (Night)</option>
                                </select>
                                <button onClick={assignShift} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transform">
                                    Assign Shift
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Adjust Attendance */}
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-7">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                        <Settings className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Adjust Attendance</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Manual attendance fix</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input value={adjustEmpAddress} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Employee Address (0x...)" onChange={e => setAdjustEmpAddress(e.target.value)} />
                                <input value={unpaidDays} type="number" className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300" placeholder="Unpaid Days" onChange={e => setUnpaidDays(e.target.value)} />
                                <button onClick={adjustAttendance} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transform">
                                    Adjust Attendance
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reset Late Strikes */}
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-7">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                        <RefreshCw className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Reset Late Strikes</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Clear late penalties</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input value={resetStrikesAddress} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Employee Address (0x...)" onChange={e => setResetStrikesAddress(e.target.value)} />
                                <button onClick={resetStrikes} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transform">
                                    Reset Strikes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default AdminDashboard;
