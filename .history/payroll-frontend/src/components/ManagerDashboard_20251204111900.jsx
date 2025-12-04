import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { UserPlus, Clock, Users, RefreshCw, Award, TrendingUp, Zap, CheckCircle, History, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

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
            const processedData = {
                ...data,
                dailyRate: Web3.utils.fromWei(data.dailyRate, 'ether'),
                currentUnpaidAmount: Web3.utils.fromWei(data.currentUnpaidAmount, 'ether'),
            };
            setManagerData(processedData);
            setDaysWorked(Number(data.daysWorkedSinceLastPay));

            // Fetch payout history
            const history = await contract.methods.getPayoutHistory(account).call();
            const processedHistory = history.map(record => ({
                amount: record.amount.toString(),
                timestamp: Number(record.timestamp),
                daysWorked: Number(record.daysWorked)
            }));
            setPayoutHistory(processedHistory.reverse()); // Latest first
        } catch (err) {
            console.error("Error loading manager data", err);
        }
    }, [contract, account]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const assignShift = async () => {
        try {
            await contract.methods.assignShift(shiftEmp, shiftTime).send({ from: account });
            alert("✅ Shift Assigned!");
            setShiftEmp('');
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const requestRateChange = async () => {
        try {
            const rateWei = Web3.utils.toWei(newRate, 'ether');
            await contract.methods.requestRateChange(rateChangeEmp, rateWei).send({ from: account });
            alert("✅ Rate Change Requested! Waiting for admin approval.");
            setRateChangeEmp(''); setNewRate('');
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const resetStrikes = async (empAddr) => {
        try {
            await contract.methods.resetLateStrikes(empAddr).send({ from: account });
            alert("✅ Strikes Reset!");
            loadMyEmployees();
        } catch (err) {
            console.error(err);
            alert("❌ Error: " + (err.message || "Transaction failed"));
        }
    };

    const checkIn = async () => {
        try {
            await contract.methods.checkIn().send({ from: account });
            alert("✅ Check-in successful!");
            loadManagerData();
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
                        <Award className="h-8 w-8 text-yellow-300 animate-pulse" />
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Manager Dashboard</h1>
                    </div>
                    <p className="text-emerald-50 text-lg font-medium">Build and manage your team with ease</p>
                </div>
            </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Onboard Employee */}
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
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Onboard Employee</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Add new team members</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <input value={newEmpAddress} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="0x..." onChange={e => setNewEmpAddress(e.target.value)} />
                            <input value={newEmpName} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300" placeholder="Full Name" onChange={e => setNewEmpName(e.target.value)} />
                            <input value={newEmpPhone} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300" placeholder="Phone Number" onChange={e => setNewEmpPhone(e.target.value)} />
                            <div className="relative">
                                <input value={newEmpRate} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all pl-12 placeholder:text-gray-400 hover:border-gray-300" placeholder="Daily Rate (ETH)" onChange={e => setNewEmpRate(e.target.value)} />
                                <span className="absolute left-4 top-4 text-emerald-600 font-bold text-lg">Ξ</span>
                            </div>
                            <button onClick={addEmployee} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transform">
                                Add Employee
                            </button>
                        </div>
                    </div>
                </div>

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
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Assign Shift</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Set work schedules</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <input value={shiftEmp} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Employee Address (0x...)" onChange={e => setShiftEmp(e.target.value)} />
                            <select value={shiftTime} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all appearance-none hover:border-gray-300 cursor-pointer" onChange={e => setShiftTime(e.target.value)}>
                                <option value="32400">🌅 9:00 AM (Morning)</option>
                                <option value="50400">☀️ 2:00 PM (Afternoon)</option>
                                <option value="79200">🌙 10:00 PM (Night)</option>
                            </select>
                            <button onClick={assignShift} className="w-full bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600 font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] transform">
                                Assign Shift
                            </button>
                        </div>
                    </div>
                </div>

                {/* Request Rate Change */}
                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-7">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Request Rate Change</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Request salary adjustment</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <input value={rateChangeEmp} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-mono text-sm placeholder:text-gray-400 hover:border-gray-300" placeholder="Employee Address (0x...)" onChange={e => setRateChangeEmp(e.target.value)} />
                            <div className="relative">
                                <input value={newRate} className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all pl-12 placeholder:text-gray-400 hover:border-gray-300" placeholder="New Daily Rate (ETH)" onChange={e => setNewRate(e.target.value)} />
                                <span className="absolute left-4 top-4 text-emerald-600 font-bold text-lg">Ξ</span>
                            </div>
                            <button onClick={requestRateChange} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transform">
                                Request Rate Change
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Team */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">My Team</h2>
                            <p className="text-emerald-100 text-sm mt-0.5">{myEmployees.length} {myEmployees.length === 1 ? 'member' : 'members'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {myEmployees.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium text-lg">No team members yet</p>
                            <p className="text-gray-400 text-sm mt-1">Start by onboarding your first employee</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myEmployees.map((emp, idx) => (
                                <div key={idx} className="group relative bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-gray-400 border-2 border-gray-200 shadow-sm group-hover:border-emerald-300 transition-colors">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-mono text-xs text-gray-600 truncate" title={emp}>{emp}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    <p className="text-xs text-emerald-600 font-semibold">Active</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => resetStrikes(emp)} className="flex items-center justify-center gap-2 w-full bg-white border-2 border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                                            <RefreshCw className="h-4 w-4" />
                                            Reset Strikes
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}

export default ManagerDashboard;
