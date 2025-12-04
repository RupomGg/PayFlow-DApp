import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { UserPlus, Clock, Users, RefreshCw, Award, TrendingUp, Zap, CheckCircle, History, Calendar, DollarSign, AlertTriangle, ChevronDown } from 'lucide-react';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceActionModal from './AttendanceActionModal';

function ManagerDashboard({ contract, account }) {
    const [newEmpAddress, setNewEmpAddress] = useState('');
    const [newEmpName, setNewEmpName] = useState('');
    const [newEmpPhone, setNewEmpPhone] = useState('');
    const [newEmpRate, setNewEmpRate] = useState('');
    const [shiftEmp, setShiftEmp] = useState('');
    const [shiftTime, setShiftTime] = useState('32400');
    const [rateChangeEmp, setRateChangeEmp] = useState('');
    const [newRate, setNewRate] = useState('');
    const [myEmployees, setMyEmployees] = useState([]);
    const [managerData, setManagerData] = useState(null);
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [daysWorked, setDaysWorked] = useState(0);
    const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] = useState('');
    const [expandedSections, setExpandedSections] = useState({
        onboard: false,
        shift: false,
        rate: false,
    });

    const loadMyEmployees = React.useCallback(async () => {
        try {
            const emps = await contract.methods.getMyEmployees().call({ from: account });
            setMyEmployees(emps);
        } catch (err) {
            console.error("Error loading employees", err);
        }
    }, [contract, account]);

    const loadManagerData = React.useCallback(async () => {
        try {
            const data = await contract.methods.employees(account).call();
            const wage = await contract.methods.getMonthlyWage(account).call();
            const days = await contract.methods.getDaysWorkedSinceLastPay(account).call();
            const userData = await contract.methods.users(account).call();
            
            const processedData = {
                ...data,
                name: userData.name || 'Manager',
                dailyRate: Web3.utils.fromWei(data.dailyRate, 'ether'),
                currentUnpaidAmount: Web3.utils.fromWei(wage, 'ether'),
                shiftStart: Number(data.shiftStart),
                lastCheckIn: Number(data.lastCheckIn),
                lateStrikes: Number(data.lateStrikes),
                daysWorkedSinceLastPay: Number(days),
            };
            setManagerData(processedData);
            setDaysWorked(Number(days));

            const history = await contract.methods.getPayoutHistory(account).call();
            const processedHistory = history.map(record => ({
                amount: record.amount.toString(),
                timestamp: Number(record.timestamp),
                daysWorked: Number(record.daysWorked)
            }));
            setPayoutHistory(processedHistory.reverse());
        } catch (err) {
            console.error("Error loading manager data", err);
        }
    }, [contract, account]);

    useEffect(() => {
        loadMyEmployees();
        loadManagerData();
    }, [loadMyEmployees, loadManagerData]);

    const addEmployee = async () => {
        try {
            const rateWei = Web3.utils.toWei(newEmpRate, 'ether');
            await contract.methods.addEmployee(newEmpAddress, newEmpName, newEmpPhone, rateWei).send({ from: account });
            alert("✅ Employee Added!");
            setNewEmpAddress(''); setNewEmpName(''); setNewEmpPhone(''); setNewEmpRate('');
            loadMyEmployees();
        } catch (err) {
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const assignShift = async () => {
        try {
            await contract.methods.assignShift(shiftEmp, shiftTime).send({ from: account });
            alert("✅ Shift Assigned!");
            setShiftEmp('');
        } catch (err) {
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const requestRateChange = async () => {
        try {
            const rateWei = Web3.utils.toWei(newRate, 'ether');
            await contract.methods.requestRateChange(rateChangeEmp, rateWei).send({ from: account });
            alert("✅ Rate Change Requested!");
            setRateChangeEmp(''); setNewRate('');
        } catch (err) {
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const checkIn = async () => {
        try {
            await contract.methods.checkIn().send({ from: account });
            alert("✅ Check-in successful!");
            loadManagerData();
        } catch (err) {
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    if (!managerData) return (
        <div className="flex flex-col justify-center items-center py-32 gap-4 bg-black min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-100 border-t-emerald-600"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading dashboard...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-black border-b border-amber-500/30 shadow-2xl shadow-amber-900/20">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3 min-w-max">
                            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2.5 rounded-lg">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Manager Dashboard</h1>
                                <p className="text-xs text-gray-400">{managerData.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-1 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-amber-400" />
                                <div className="hidden sm:block">
                                    <p className="text-xs text-gray-400">Wallet</p>
                                    <p className="text-sm font-mono text-amber-300 font-bold">{account?.slice(0, 14)}...{account?.slice(-8)}</p>
                                </div>
                            </div>
                            <div className="border-l border-gray-600 h-8"></div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-blue-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Unpaid</p>
                                    <p className="text-sm font-bold text-blue-300">{managerData.currentUnpaidAmount} ETH</p>
                                </div>
                            </div>
                            <div className="border-l border-gray-600 h-8"></div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-emerald-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Team</p>
                                    <p className="text-sm font-bold text-emerald-300">{myEmployees.length}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={checkIn}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2 whitespace-nowrap text-sm"
                        >
                            <Zap className="h-4 w-4" />
                            Check In
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full bg-black min-h-[calc(100vh-80px)]">
                <div className="w-full px-6 py-8 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-500/30 rounded-lg p-4 hover:border-purple-500/60 transition-all">
                            <div className="flex items-start justify-between mb-2">
                                <div className="bg-purple-500/20 p-2 rounded-lg">
                                    <DollarSign className="h-4 w-4 text-purple-400" />
                                </div>
                                <button onClick={loadManagerData} className="text-purple-400 hover:text-purple-300">
                                    <RefreshCw className="h-3 w-3" />
                                </button>
                            </div>
                            <p className="text-gray-400 text-xs font-medium mb-1">Daily Rate</p>
                            <p className="text-2xl font-bold text-purple-300">{managerData.dailyRate}</p>
                            <p className="text-[10px] text-gray-500 mt-1">ETH per day</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/20 border border-blue-500/30 rounded-lg p-4 hover:border-blue-500/60 transition-all">
                            <div className="flex items-start justify-between mb-2">
                                <div className="bg-blue-500/20 p-2 rounded-lg">
                                    <Calendar className="h-4 w-4 text-blue-400" />
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs font-medium mb-1">Days Worked</p>
                            <p className="text-2xl font-bold text-blue-300">{daysWorked}/30</p>
                            <div className="mt-1 w-full bg-gray-700 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{width: `${Math.min((daysWorked / 30) * 100, 100)}%`}}></div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 hover:border-emerald-500/60 transition-all">
                            <div className="flex items-start justify-between mb-2">
                                <div className="bg-emerald-500/20 p-2 rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs font-medium mb-1">Unpaid Earnings</p>
                            <p className="text-2xl font-bold text-emerald-300">{managerData.currentUnpaidAmount}</p>
                            <p className="text-[10px] text-gray-500 mt-1">ETH pending</p>
                        </div>

                        <div className={`bg-gradient-to-br ${managerData.lateStrikes > 0 ? 'from-red-900/40 to-orange-900/20 border-red-500/30' : 'from-gray-800 to-gray-900 border-gray-700'} border rounded-lg p-4 hover:border-opacity-60 transition-all`}>
                            <div className="flex items-start justify-between mb-2">
                                <div className={`${managerData.lateStrikes > 0 ? 'bg-red-500/20' : 'bg-gray-700'} p-2 rounded-lg`}>
                                    <AlertTriangle className={`h-4 w-4 ${managerData.lateStrikes > 0 ? 'text-red-400' : 'text-gray-400'}`} />
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs font-medium mb-1">Late Strikes</p>
                            <p className={`text-2xl font-bold ${managerData.lateStrikes > 0 ? 'text-red-300' : 'text-gray-300'}`}>{managerData.lateStrikes}/4</p>
                            <p className="text-[10px] text-gray-500 mt-1">{managerData.lateStrikes > 0 ? 'Be careful!' : 'Perfect'}</p>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 hover:border-indigo-500/60 transition-all">
                            <div className="flex items-start justify-between mb-2">
                                <div className="bg-indigo-500/20 p-2 rounded-lg">
                                    <Clock className="h-4 w-4 text-indigo-400" />
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs font-medium mb-1">Shift Start</p>
                            <p className="text-2xl font-bold text-indigo-300">
                                {new Date(managerData.shiftStart * 1000).toISOString().substr(11, 5)}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">UTC Time</p>
                        </div>
                    </div>

                    {/* Operations Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Onboard Employee */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4 hover:border-emerald-500/50 transition-all">
                            <button onClick={() => toggleSection('onboard')} className="w-full flex items-center justify-between mb-3 hover:opacity-80">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <UserPlus className="h-4 w-4 text-emerald-400" />
                                    Onboard
                                </h3>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedSections.onboard ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.onboard && (
                                <div className="space-y-2">
                                    <input value={newEmpAddress} placeholder="0x..." onChange={e => setNewEmpAddress(e.target.value)} className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded focus:ring-1 focus:ring-emerald-400 outline-none text-xs font-mono text-gray-200" />
                                    <input value={newEmpName} placeholder="Name" onChange={e => setNewEmpName(e.target.value)} className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded focus:ring-1 focus:ring-emerald-400 outline-none text-xs text-gray-200" />
                                    <input value={newEmpPhone} placeholder="Phone" onChange={e => setNewEmpPhone(e.target.value)} className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded focus:ring-1 focus:ring-emerald-400 outline-none text-xs text-gray-200" />
                                    <input value={newEmpRate} placeholder="Rate (ETH)" onChange={e => setNewEmpRate(e.target.value)} className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded focus:ring-1 focus:ring-emerald-400 outline-none text-xs text-gray-200" />
                                    <button onClick={addEmployee} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 rounded text-xs transition-all">Add</button>
                                </div>
                            )}
                        </div>

                        {/* Assign Shift */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-all">
                            <button onClick={() => toggleSection('shift')} className="w-full flex items-center justify-between mb-3 hover:opacity-80">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-amber-400" />
                                    Shift
                                </h3>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedSections.shift ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.shift && (
                                <div className="space-y-2">
                                    <input value={shiftEmp} placeholder="Address" onChange={e => setShiftEmp(e.target.value)} className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded focus:ring-1 focus:ring-amber-400 outline-none text-xs font-mono text-gray-200" />
                                    <select value={shiftTime} onChange={e => setShiftTime(e.target.value)} className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded focus:ring-1 focus:ring-amber-400 outline-none text-xs text-gray-200">
                                        <option value="32400">🌅 9 AM</option>
                                        <option value="50400">☀️ 2 PM</option>
                                        <option value="79200">🌙 10 PM</option>
                                    </select>
                                    <button onClick={assignShift} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 rounded text-xs transition-all">Assign</button>
                                </div>
                            )}
                        </div>

                        {/* Request Rate Change */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-all">
                            <button onClick={() => toggleSection('rate')} className="w-full flex items-center justify-between mb-3 hover:opacity-80">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-400" />
                                    Rate
                                </h3>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedSections.rate ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.rate && (
                                <div className="space-y-2">
                                    <input value={rateChangeEmp} placeholder="Address" onChange={e => setRateChangeEmp(e.target.value)} className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded focus:ring-1 focus:ring-blue-400 outline-none text-xs font-mono text-gray-200" />
                                    <input value={newRate} placeholder="New Rate" onChange={e => setNewRate(e.target.value)} className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded focus:ring-1 focus:ring-blue-400 outline-none text-xs text-gray-200" />
                                    <button onClick={requestRateChange} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded text-xs transition-all">Request</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Calendar and Payout History Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Attendance Calendar */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4">
                            <AttendanceCalendar contract={contract} address={account} mode="view" />
                        </div>

                        {/* Payout History */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4">
                            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                <History className="h-4 w-4 text-emerald-400" />
                                Payout History
                            </h3>
                            {payoutHistory.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-gray-400 text-xs">No payouts yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {payoutHistory.map((record, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-700/50 rounded border border-gray-600">
                                            <div>
                                                <p className="font-bold text-emerald-300 text-sm">{Web3.utils.fromWei(record.amount, 'ether')} ETH</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{new Date(record.timestamp * 1000).toLocaleDateString()}</p>
                                            </div>
                                            <p className="text-[10px] font-semibold text-gray-300 bg-gray-600 px-2 py-0.5 rounded-full">{record.daysWorked}d</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Team - Separate Row */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4">
                        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-amber-400" />
                            My Team ({myEmployees.length})
                        </h3>
                        {myEmployees.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-gray-400 text-xs">No team members yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                {myEmployees.map((emp, idx) => (
                                    <div key={idx} className="bg-gray-700/50 p-2 rounded border border-gray-600">
                                        <p className="font-mono text-[10px] text-gray-400 truncate mb-1">{emp}</p>
                                        <button 
                                            onClick={() => { setSelectedEmployeeForAttendance(emp); setAttendanceModalOpen(true); }} 
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-1 rounded text-[10px] font-semibold transition-all"
                                        >
                                            <Calendar className="h-3 w-3 inline mr-1" />
                                            Manage
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Last Check-in */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="h-4 w-4 text-emerald-400" />
                            <p className="text-xs">Last Check-in: <span className="text-white font-bold">{managerData.lastCheckIn == 0 ? 'Never' : new Date(managerData.lastCheckIn * 1000).toLocaleString()}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <AttendanceActionModal
                isOpen={attendanceModalOpen}
                onClose={() => { setAttendanceModalOpen(false); setSelectedEmployeeForAttendance(''); }}
                contract={contract}
                employeeAddress={selectedEmployeeForAttendance}
                actionType="resetLate"
                onSuccess={() => { loadMyEmployees(); }}
            />
        </div>
    );
}

export default ManagerDashboard;
