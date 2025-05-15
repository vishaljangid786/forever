import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

const Transactions = ({ userId,userData }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate()
  

  useEffect(() => {
    const fetchUserTransactions = async () => {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/request/transactions`,
          { userId },
          { headers: { "Content-Type": "application/json" } }
        );

        if (data.success) {
          setTransactions(data.data);
        } else {
          setError("Failed to fetch transactions.");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserTransactions();
    }
  }, [userId]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Transaction History</h2>

      {loading ? (
        <p><Loading /></p>
        
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="w-full border border-collapse border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Details</th>
              <th className="p-2 border">Mode</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="text-center">
                <td className="p-2 border">
                  {tx.mode === "upi" ? (
                      <span className="text-blue-500">{tx.upiId || "N/A"}</span>
                    ) : (
                        <div>
                      <p>Acc: {tx.account_number || "N/A"}</p>
                      <p>IFSC: {tx.ifsc_code || "N/A"}</p>
                    </div>
                  )}
                </td>
                <td className="p-2 capitalize border">{tx.mode}</td>
                <td
                  className={`border p-2 ${
                      tx.status === "completed"
                      ? "text-green-500"
                      : tx.status === "pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                    }`}>
                  {tx.status}
                </td>
                <td className="p-2 border">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
                  <td className="p-2 border">₹{tx.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Transactions;
