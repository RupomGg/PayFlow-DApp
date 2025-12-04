import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { DollarSign, Clock, AlertTriangle, Calendar, CheckCircle, Zap, TrendingUp, History, Users, RefreshCw } from 'lucide-react';
import AttendanceCalendar from './AttendanceCalendar';

function EmployeeDashboard({ contract, account }) {
    const [empData, setEmpData] = useState(null);
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [daysWorked, setDaysWorked] = useState(0);
    const [monthlyWage, setMonthlyWage] = useState('0');
    const [managerInfo, setManagerInfo] = useState(null);
    const [showPayouts, setShowPayouts] = useState(false);

    const loadData = React.useCallback(async () => {
        try {
            const data = await contract.methods.employees(account).call();
            console.log("Employee data:", data);
            
            const wage = await contract.methods.getMonthlyWage(account).call();
            const days = await contract.methods.getDaysWorkedSinceLastPay(account).call();
            
            // Load manager info
            if (data.manager && data.manager !== '0x0000000000000000000000000000000000000000') {
                try {
                    const managerData = await contract.methods.users(data.manager).call();
                    setManagerInfo({
                        address: data.manager,
                        name: managerData.name || 'Manager'
                    });
                } catch (err) {
                    console.error("Error loading manager info:", err);
                }
            }
            
            const processedData = {
                ...data,
                dailyRate: data.dailyRate ? data.dailyRate.toString() : '0',
                lastCheckIn: data.lastCheckIn ? data.lastCheckIn.toString() : '0',
                totalEarned: data.totalEarned ? data.totalEarned.toString() : '0',
                shiftStart: data.shiftStart ? data.shiftStart.toString() : '0',
                lateStrikes: data.lateStrikes ? data.lateStrikes.toString() : '0',
                name: data.name || 'Employee'
            };
            setEmpData(processedData);
            setDaysWorked(Number(days || 0));
            setMonthlyWage(wage.toString());
            
            const history = await contract.methods.getPayoutHistory(account).call();
            const processedHistory = history.map(record => ({
                amount: record.amount.toString(),
                timestamp: Number(record.timestamp),
                daysWorked: Number(record.daysWorked)
            }));
            setPayoutHistory(processedHistory.reverse());
        } catch (err) {
            console.error("Error loading data", err);
        }
    }, [contract, account]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const checkIn = async () => {
        try {
            await contract.methods.checkIn().send({ from: account });
            alert("✅ Checked In!");
            loadData();
        } catch (err) {
            console.error(err);
            alert("❌ Error checking in");
        }
    };

    if (!empData) return (
        <div className="flex flex-col justify-center items-center py-32 gap-4 bg-black min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-100 border-t-emerald-600"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading your dashboard...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-black border-b border-emerald-500/30 shadow-2xl shadow-emerald-900/20">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3 min-w-max">
                            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-lg">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Employee Dashboard</h1>
                                <p className="text-xs text-gray-400">{empData.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-1 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-emerald-400" />
                                <div className="hidden sm:block">
                                    <p className="text-xs text-gray-400">Wallet</p>
                                    <p className="text-sm font-mono text-emerald-300 font-bold">{account?.slice(0, 14)}...{account?.slice(-8)}</p>
                                </div>
                            </div>
                            <div className="border-l border-gray-600 h-8"></div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-blue-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Unpaid</p>
                                    <p className="text-sm font-bold text-blue-300">{Web3.utils.fromWei(monthlyWage, 'ether')} ETH</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowPayouts(!showPayouts)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2 whitespace-nowrap text-sm"
                            >
                                <History className="h-4 w-4" />
                                Payouts
                            </button>
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
            </div>

            {/* Main Content */}
            <div className="w-full bg-black min-h-[calc(100vh-80px)]">
                <div className="w-full px-6 py-8 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Daily Rate */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-purple-500/20 p-3 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-purple-400" />
                                </div>
                                <button onClick={loadData} className="text-purple-400 hover:text-purple-300" title="Refresh">
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Daily Rate</p>
                            <p className="text-4xl font-bold text-purple-300">{Web3.utils.fromWei(empData.dailyRate, 'ether')}</p>
                            <p className="text-xs text-gray-500 mt-2">ETH per day</p>
                        </div>

                        {/* Days Worked */}
                        <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/20 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-blue-500/20 p-3 rounded-lg">
                                    <Calendar className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Days Worked</p>
                            <p className="text-4xl font-bold text-blue-300">{daysWorked}/30</p>
                            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{width: `${Math.min((daysWorked / 30) * 100, 100)}%`}}></div>
                            </div>
                        </div>

                        {/* Unpaid Earnings */}
                        <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/20 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/60 transition-all hover:shadow-lg hover:shadow-emerald-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-emerald-500/20 p-3 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Unpaid Earnings</p>
                            <p className="text-4xl font-bold text-emerald-300">{Web3.utils.fromWei(monthlyWage, 'ether')}</p>
                            <p className="text-xs text-gray-500 mt-2">ETH pending</p>
                        </div>

                        {/* Late Strikes */}
                        <div className={`bg-gradient-to-br ${Number(empData.lateStrikes) > 0 ? 'from-red-900/40 to-orange-900/20 border-red-500/30' : 'from-gray-800 to-gray-900 border-gray-700'} border rounded-xl p-6 hover:border-opacity-60 transition-all hover:shadow-lg`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${Number(empData.lateStrikes) > 0 ? 'bg-red-500/20' : 'bg-gray-700'} p-3 rounded-lg`}>
                                    <AlertTriangle className={`h-6 w-6 ${Number(empData.lateStrikes) > 0 ? 'text-red-400' : 'text-gray-400'}`} />
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Late Strikes</p>
                            <p className={`text-4xl font-bold ${Number(empData.lateStrikes) > 0 ? 'text-red-300' : 'text-gray-300'}`}>{empData.lateStrikes}/4</p>
                            <p className="text-xs text-gray-500 mt-2">{Number(empData.lateStrikes) > 0 ? 'Be careful!' : 'Perfect record'}</p>
                        </div>

                        {/* Shift Start */}
                        <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 hover:border-indigo-500/60 transition-all hover:shadow-lg hover:shadow-indigo-500/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-indigo-500/20 p-3 rounded-lg">
                                    <Clock className="h-6 w-6 text-indigo-400" />
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Shift Start</p>
                            <p className="text-4xl font-bold text-indigo-300">
                                {new Date(empData.shiftStart * 1000).toISOString().substr(11, 5)}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">UTC Time</p>
                        </div>
                    </div>

                    {/* Manager Info */}
                    {managerInfo && (
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-amber-500/30 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-amber-400" />
                                Assigned Manager
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">Name:</span>
                                    <span className="text-base font-bold text-amber-300">{managerInfo.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">Address:</span>
                                    <span className="text-sm font-mono text-gray-300">{managerInfo.address?.slice(0, 10)}...{managerInfo.address?.slice(-8)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Collapsible Payout History - Full Width */}
                    {showPayouts && (
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-blue-500/50 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <History className="h-5 w-5 text-blue-400" />
                                Payout History
                            </h3>
                            
                            {payoutHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm">No payouts yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {payoutHistory.map((record, idx) => (
                                        <div key={idx} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                            <p className="font-bold text-emerald-300 text-xl">
                                                {Web3.utils.fromWei(record.amount, 'ether')} ETH
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(record.timestamp * 1000).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs font-semibold text-gray-300 bg-gray-600 px-3 py-1 rounded-full mt-3 inline-block">
                                                {record.daysWorked} days
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Attendance Calendar */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
                        <div className="mb-3 pb-3 border-b border-gray-700">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Calendar className="h-4 w-4 text-emerald-400" />
                                <p className="text-xs">Last: <span className="text-white font-bold">{empData.lastCheckIn == 0 ? 'Never' : new Date(empData.lastCheckIn * 1000).toLocaleString()}</span></p>
                            </div>
                        </div>
                        <AttendanceCalendar contract={contract} address={account} mode="view" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;
