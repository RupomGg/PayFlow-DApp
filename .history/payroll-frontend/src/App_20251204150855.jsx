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
    <div className="min-h-screen bg-black font-sans text-gray-800">
      <main className="w-full">
        {loading && (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
            <p className="text-gray-500 font-medium animate-pulse">Connecting to Blockchain...</p>
          </div>
        )}

        {!account && !loading && (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-gray-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-700 max-w-lg mx-auto text-center">
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
              <div className="flex items-center justify-center min-h-screen">
                <div className="bg-gray-900 p-8 rounded-2xl shadow-sm border border-red-900/50 max-w-md mx-auto text-center">
                  <LogOut className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                  <p className="text-gray-400">Your wallet address is not registered in the system.</p>
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
