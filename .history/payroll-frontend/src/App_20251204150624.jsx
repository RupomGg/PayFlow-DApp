import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractConfig';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import { Wallet, Shield, User, Users, LogOut, Menu, X } from 'lucide-react';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      setContract(contractInstance);
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        await checkRole(accounts[0]);
      } catch (error) {
        console.error("Connection failed", error);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const checkRole = async (userAddress) => {
    if (!contract) {
      console.log("Contract not initialized");
      return;
    }
    try {
      console.log("Checking role for address:", userAddress);
      const user = await contract.methods.users(userAddress).call();
      console.log("User data from contract:", user);
      console.log("Role enum value:", user.role);
      
      // Check if user is registered by checking if name is not empty
      if (user.name && user.name !== '') {
        // Role is now an enum: 0 = Employee, 1 = Manager, 2 = Admin
        const roleEnum = Number(user.role);
        let roleName;
        
        if (roleEnum === 0) {
          roleName = 'Employee';
        } else if (roleEnum === 1) {
          roleName = 'Manager';
        } else if (roleEnum === 2) {
          roleName = 'Admin';
        } else {
          roleName = 'Guest';
        }
        
        console.log("Setting role to:", roleName);
        setRole(roleName);
      } else {
        console.log("User not registered, setting Guest");
        setRole('Guest');
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      setRole('Guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans text-gray-800 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar */}
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-xl shadow-sm shadow-emerald-200">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">PayFlow</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-4">
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{role || 'Guest'}</p>
                    <p className="text-xs text-gray-500 font-mono">{account.slice(0, 6)}...{account.slice(-4)}</p>
                  </div>
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                    {role === 'Admin' && <Shield className="h-5 w-5 text-emerald-600" />}
                    {role === 'Manager' && <Users className="h-5 w-5 text-emerald-600" />}
                    {(role === 'Employee' || !role) && <User className="h-5 w-5 text-emerald-600" />}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 shadow-lg">
            {!account ? (
              <button
                onClick={connectWallet}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Wallet className="h-5 w-5" />
                Connect Wallet
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                    {role === 'Admin' && <Shield className="h-5 w-5 text-emerald-600" />}
                    {role === 'Manager' && <Users className="h-5 w-5 text-emerald-600" />}
                    {(role === 'Employee' || !role) && <User className="h-5 w-5 text-emerald-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{role || 'Guest'}</p>
                    <p className="text-xs text-gray-500 font-mono">{account.slice(0, 6)}...{account.slice(-4)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="w-full">
        {loading && (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
            <p className="text-gray-500 font-medium animate-pulse">Connecting to Blockchain...</p>
          </div>
        )}

        {!account && !loading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <div className="bg-gray-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-700 max-w-lg w-full text-center transform transition-all hover:scale-[1.01] duration-300">
              <div className="bg-emerald-900/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Wallet className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Welcome to <span className="text-emerald-400">PayFlow</span></h2>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed">Secure, transparent, and efficient payroll management powered by the blockchain.</p>
              <button
                onClick={connectWallet}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Wallet className="h-6 w-6" />
                Connect Wallet
              </button>
            </div>
          </div>
        )}

        {account && role && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {role === 'Admin' && <AdminDashboard contract={contract} account={account} />}
            {role === 'Manager' && <ManagerDashboard contract={contract} account={account} />}
            {role === 'Employee' && <EmployeeDashboard contract={contract} account={account} />}
            {role === 'Guest' && (
              <div className="text-center py-20">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md mx-auto">
                  <LogOut className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                  <p className="text-gray-500">Your wallet address is not registered in the system.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
