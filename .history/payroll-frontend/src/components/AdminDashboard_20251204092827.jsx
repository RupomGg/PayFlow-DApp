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
            await contract.methods.paySalary(payEmpAddress).send({ from: account });
            alert("✅ Salary Paid!");
            setPayEmpAddress('');
        } catch (err) {
            console.error(err);
            if (err.message.includes("Insufficient contract balance")) {
                alert("❌ Error: Not enough ETH in contract to pay salary!");
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

    const approveRateChange = async () => {
        try {
            await contract.methods.approveRateChange(approveRateEmpAddress).send({ from: account });
            alert("✅ Rate Change Approved!");
            setApproveRateEmpAddress('');
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl p-8 shadow-2xl shadow-emerald-500/20">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap className="h-8 w-8 text-yellow-300 animate-pulse" />
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Control Center</h1>
                    </div>
                    <p className="text-emerald-50 text-lg font-medium">Complete system management and control</p>
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
                                    <div className="absolute inset-0 bg-pink-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-pink-400 to-pink-600 p-3.5 rounded-2xl shadow-lg">
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
                                <button onClick={adjustAttendance} className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 active:scale-[0.98] transform">
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
                                    <div className="absolute inset-0 bg-red-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-red-400 to-red-600 p-3.5 rounded-2xl shadow-lg">
                                        <RefreshCw className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Reset Late Strikes</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Clear late penalties</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input value={resetStrikesAddress} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Employee Address (0x...)" onChange={e => setResetStrikesAddress(e.target.value)} />
                                <button onClick={resetStrikes} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 active:scale-[0.98] transform">
                                    Reset Strikes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
