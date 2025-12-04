import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { DollarSign, Clock, AlertTriangle, Calendar, CheckCircle, Zap, TrendingUp } from 'lucide-react';

function EmployeeDashboard({ contract, account }) {
    const [empData, setEmpData] = useState(null);
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [daysWorked, setDaysWorked] = useState(0);

    const loadData = React.useCallback(async () => {
        try {
            const data = await contract.methods.employees(account).call();
            console.log("Employee data:", data);
            // Convert BigInt values to strings to avoid React rendering issues
            const processedData = {
                ...data,
                dailyRate: data.dailyRate ? data.dailyRate.toString() : '0',
                unpaidDays: data.unpaidDays ? data.unpaidDays.toString() : '0',
                lastCheckIn: data.lastCheckIn ? data.lastCheckIn.toString() : '0',
                totalEarned: data.totalEarned ? data.totalEarned.toString() : '0',
                shiftStart: data.shiftStart ? data.shiftStart.toString() : '0',
                lateStrikes: data.lateStrikes ? data.lateStrikes.toString() : '0',
                currentUnpaidAmount: data.currentUnpaidAmount ? data.currentUnpaidAmount.toString() : '0',
                daysWorkedSinceLastPay: data.daysWorkedSinceLastPay ? data.daysWorkedSinceLastPay.toString() : '0'
            };
            setEmpData(processedData);
            setDaysWorked(Number(data.daysWorkedSinceLastPay || 0));
            
            // Fetch payout history
            const history = await contract.methods.getPayoutHistory(account).call();
            const processedHistory = history.map(record => ({
                amount: record.amount.toString(),
                timestamp: Number(record.timestamp),
                daysWorked: Number(record.daysWorked)
            }));
            setPayoutHistory(processedHistory.reverse()); // Latest first
        } catch (err) {
            console.error("Error loading data", err);
        }
    }, [contract, account]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        loadData();
    }, [loadData]);

    const checkIn = async () => {
        try {
            await contract.methods.checkIn().send({ from: account });
            alert("Checked In!");
            loadData();
        } catch (err) {
            console.error(err);
            alert("Error checking in (Too early or transaction failed)");
        }
    };

    if (!empData) return (
        <div className="flex flex-col justify-center items-center py-32 gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-100 border-t-emerald-600"></div>
            <p className="text-gray-500 font-medium animate-pulse">Loading your dashboard...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 rounded-3xl p-8 shadow-2xl shadow-emerald-500/20">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome back, {empData.name}!</h2>
                            <p className="text-emerald-100 text-lg font-medium">Here's your payroll overview for today</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 shadow-lg">
                            <p className="text-white font-bold text-sm flex items-center gap-2">
                                <span className="h-2.5 w-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
                                Active Employee
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {/* Daily Rate */}
                <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3 text-emerald-700">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold">Daily Rate</span>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900">{Web3.utils.fromWei(empData.dailyRate, 'ether')}</p>
                        <p className="text-sm text-gray-500 mt-1 font-medium">ETH per day</p>
                    </div>
                </div>

                {/* Days Worked Counter */}
                <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3 text-blue-700">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold">Days Worked</span>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900">{daysWorked}<span className="text-lg text-gray-500">/30</span></p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{width: `${Math.min((daysWorked / 30) * 100, 100)}%`}}></div>
                        </div>
                    </div>
                </div>

                {/* Unpaid Earnings */}
                <div className="group relative bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3 text-white">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold">Unpaid Earnings</span>
                        </div>
                        <p className="text-3xl font-extrabold text-white">{Web3.utils.fromWei(empData.currentUnpaidAmount, 'ether')}</p>
                        <p className="text-sm text-emerald-100 mt-1 font-medium">ETH pending</p>
                    </div>
                </div>

                {/* Late Strikes */}
                <div className={`group relative rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden ${empData.lateStrikes > 0 ? 'bg-gradient-to-br from-red-500 to-orange-600' : 'bg-white border border-gray-100'}`}>
                    <div className={`absolute inset-0 ${empData.lateStrikes > 0 ? 'bg-white/10' : 'bg-gradient-to-br from-gray-50/50 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className="relative">
                        <div className={`flex items-center gap-2 mb-3 ${empData.lateStrikes > 0 ? 'text-white' : 'text-gray-600'}`}>
                            <div className={`${empData.lateStrikes > 0 ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'} p-2 rounded-lg`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold">Late Strikes</span>
                        </div>
                        <p className={`text-3xl font-extrabold ${empData.lateStrikes > 0 ? 'text-white' : 'text-gray-900'}`}>{empData.lateStrikes} <span className="text-xl opacity-70">/ 4</span></p>
                        <p className={`text-sm mt-1 font-medium ${empData.lateStrikes > 0 ? 'text-red-100' : 'text-gray-500'}`}>{empData.lateStrikes > 0 ? 'Be careful!' : 'Perfect record'}</p>
                    </div>
                </div>

                {/* Shift Start */}
                <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3 text-emerald-700">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Clock className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold">Shift Start</span>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900">
                            {new Date(empData.shiftStart * 1000).toISOString().substr(11, 5)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 font-medium">UTC Time</p>
                    </div>
                </div>
            </div>

            {/* Payout History Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                        <History className="h-6 w-6 text-emerald-600" />
                    </div>
                    Payout History
                </h2>
                
                {payoutHistory.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No payouts yet</p>
                        <p className="text-gray-400 text-sm mt-2">Your payout history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payoutHistory.map((record, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-emerald-600">
                                        {Web3.utils.fromWei(record.amount, 'ether')} ETH
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {new Date(record.timestamp * 1000).toLocaleDateString()} at {new Date(record.timestamp * 1000).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-gray-700 bg-white px-3 py-1 rounded-full">
                                        {record.daysWorked} days
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Check In Button */}
                <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <button
                    onClick={checkIn}
                    className="relative w-full btn-brand py-6 rounded-2xl text-xl font-bold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group active:scale-[0.98] transform"
                >
                    <Zap className="h-7 w-7 group-hover:scale-110 transition-transform" />
                    Check In Now
                    <CheckCircle className="h-7 w-7 group-hover:rotate-12 transition-transform" />
                </button>
            </div>

            {/* Last Check-in Info */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <p className="font-medium">
                        Last Check-in: <span className="text-gray-900 font-bold">{empData.lastCheckIn == 0 ? 'Never' : new Date(empData.lastCheckIn * 1000).toLocaleString()}</span>
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;
