import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SellerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/sellerTransaction`
      );
      if (res.data.success) {
        setTransactions(res.data.data);
      } else {
        toast.error("Failed to fetch transactions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching transactions");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/sellerTransaction/${id}`,
        { status: newStatus }
      );
      if (res.data.success) {
        toast.success("Status updated!");
        fetchTransactions();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/sellerTransaction/${id}`
      );
      if (res.data.success) {
        toast.success("Transaction deleted");
        setTransactions(transactions.filter((tx) => tx._id !== id));
      } else {
        toast.error("Failed to delete transaction");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting transaction");
    }
  };

  const pendingTx = transactions.filter((tx) => tx.status === "pending");
  const historyTx = transactions.filter(
    (tx) =>
      tx.status?.toLowerCase() === "success" ||
      tx.status?.toLowerCase() === "failed"
  );

  const filteredHistory = historyTx.filter((tx) =>
    [tx.shopName, tx.transactionId]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-center text-indigo-700">
        Seller Transactions
      </h1>

      {/* Pending Transactions */}
      {pendingTx.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold text-red-600">
            ⏳ Pending Transactions
          </h2>
          <div className="overflow-auto border rounded-lg shadow">
            <table className="min-w-full text-sm text-left text-gray-800">
              <thead className="text-white bg-indigo-600">
                <tr>
                  <th className="px-4 py-3">Shop Name</th>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Update</th>
                  <th className="px-4 py-3">Screenshot</th>
                  <th className="px-4 py-3">Delete</th>
                </tr>
              </thead>
              <tbody>
                {pendingTx.map((tx) => (
                  <tr key={tx._id} className="border-b">
                    <td className="px-4 py-2">{tx.shopName}</td>
                    <td className="px-4 py-2">{tx.transactionId}</td>
                    <td className="px-4 py-2">Rs.{tx.amount}</td>
                    <td className="px-4 py-2">{tx.status}</td>
                    <td className="px-4 py-2">
                      <select
                        value={tx.status}
                        onChange={(e) =>
                          handleStatusChange(tx._id, e.target.value)
                        }
                        className="p-1 border rounded">
                        <option value="Pending">Pending</option>
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <a
                        href={tx.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline">
                        View
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(tx._id)}
                        className="px-2 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Section */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-green-600">
          📜 History
        </h2>

        <input
          type="text"
          placeholder="Search by shop or transaction ID..."
          className="w-full max-w-sm p-2 mb-4 border border-gray-300 rounded shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="overflow-auto border rounded-lg shadow">
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="text-white bg-gray-800">
              <tr>
                <th className="px-4 py-3">Shop Name</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Screenshot</th>
                <th className="px-4 py-3">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((tx) => (
                <tr key={tx._id} className="border-b">
                  <td className="px-4 py-2">{tx.shopName}</td>
                  <td className="px-4 py-2">{tx.transactionId}</td>
                  <td className="px-4 py-2">Rs.{tx.amount}</td>
                  <td className="px-4 py-2">{tx.status}</td>
                  <td className="px-4 py-2">
                    <a
                      href={tx.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline">
                      View
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(tx._id)}
                      className="px-2 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerTransactions;
