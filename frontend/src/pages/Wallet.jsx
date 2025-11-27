import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { walletAPI } from '../api/client';

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Deposit form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('credit_card');
  
  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('crypto');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [bankDetails, setBankDetails] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    routing_number: '',
  });

  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadWalletData();
  }, [isAuthenticated]);

  const loadWalletData = async () => {
    try {
      const [balanceRes, transactionsRes, withdrawalsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
        walletAPI.getWithdrawals(),
      ]);

      setBalance(balanceRes.data.balance);
      setPendingBalance(balanceRes.data.pending_balance);
      setTransactions(transactionsRes.data.transactions);
      setWithdrawals(withdrawalsRes.data.withdrawals);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await walletAPI.deposit(parseFloat(depositAmount), depositMethod, {});
      alert('Deposit successful!');
      setDepositAmount('');
      setShowDeposit(false);
      loadWalletData();
    } catch (error) {
      alert(error.response?.data?.error || 'Deposit failed');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      alert('Insufficient balance');
      return;
    }

    try {
      const details = withdrawMethod === 'crypto' 
        ? { crypto_address: cryptoAddress }
        : { bank_details: bankDetails };

      await walletAPI.withdraw(parseFloat(withdrawAmount), withdrawMethod, details);
      alert('Withdrawal request submitted!');
      setWithdrawAmount('');
      setCryptoAddress('');
      setShowWithdraw(false);
      loadWalletData();
    } catch (error) {
      alert(error.response?.data?.error || 'Withdrawal failed');
    }
  };

  const handleCancelWithdrawal = async (withdrawalId) => {
    if (!confirm('Are you sure you want to cancel this withdrawal?')) {
      return;
    }

    try {
      await walletAPI.cancelWithdrawal(withdrawalId);
      alert('Withdrawal cancelled successfully!');
      loadWalletData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel withdrawal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg">
            <h3 className="text-gray-200 mb-2">Available Balance</h3>
            <p className="text-4xl font-bold">{balance.toFixed(2)} SUI</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowDeposit(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Deposit
              </button>
              <button
                onClick={() => setShowWithdraw(true)}
                className="bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Withdraw
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 rounded-lg">
            <h3 className="text-gray-200 mb-2">Pending Balance</h3>
            <p className="text-4xl font-bold">{pendingBalance.toFixed(2)} SUI</p>
            <p className="text-sm text-gray-200 mt-2">
              Funds being processed for withdrawal
            </p>
          </div>
        </div>

        {/* Deposit Modal */}
        {showDeposit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Deposit Funds</h2>
              <form onSubmit={handleDeposit}>
                <div className="mb-4">
                  <label className="block mb-2">Amount (SUI)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Payment Method</label>
                  <select
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="crypto">Crypto Wallet</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
                  >
                    Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeposit(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdraw && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Withdraw Funds</h2>
              <form onSubmit={handleWithdraw}>
                <div className="mb-4">
                  <label className="block mb-2">Amount (SUI)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Available: {balance.toFixed(2)} SUI
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Withdrawal Method</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                  >
                    <option value="crypto">Crypto Wallet</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>

                {withdrawMethod === 'crypto' ? (
                  <div className="mb-4">
                    <label className="block mb-2">Crypto Wallet Address</label>
                    <input
                      type="text"
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                      placeholder="0x..."
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      value={bankDetails.account_name}
                      onChange={(e) => setBankDetails({...bankDetails, account_name: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                      placeholder="Account Name"
                      required
                    />
                    <input
                      type="text"
                      value={bankDetails.account_number}
                      onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                      placeholder="Account Number"
                      required
                    />
                    <input
                      type="text"
                      value={bankDetails.bank_name}
                      onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                      placeholder="Bank Name"
                      required
                    />
                    <input
                      type="text"
                      value={bankDetails.routing_number}
                      onChange={(e) => setBankDetails({...bankDetails, routing_number: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                      placeholder="Routing Number"
                      required
                    />
                  </div>
                )}

                <p className="text-sm text-yellow-400 mb-4">
                  Processing time: 1-3 business days
                </p>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
                  >
                    Withdraw
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWithdraw(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} SUI
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No transactions yet</p>
          )}
        </div>

        {/* Withdrawals */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Withdrawal History</h2>
          {withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.withdrawal_id} className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{withdrawal.amount.toFixed(2)} SUI</p>
                      <p className="text-sm text-gray-400">
                        {withdrawal.withdrawal_method === 'crypto' ? 'Crypto Wallet' : 'Bank Account'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        withdrawal.status === 'completed' ? 'bg-green-600' :
                        withdrawal.status === 'pending' ? 'bg-yellow-600' :
                        withdrawal.status === 'processing' ? 'bg-blue-600' :
                        'bg-red-600'
                      }`}>
                        {withdrawal.status}
                      </span>
                      {withdrawal.status === 'pending' && (
                        <button
                          onClick={() => handleCancelWithdrawal(withdrawal.withdrawal_id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(withdrawal.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No withdrawals yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wallet;
