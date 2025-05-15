import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Scanner = ({ userData }) => {
  const adminNumber = "9462365447";
  const [copied, setCopied] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [image, setImage] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [transactions, setTransactions] = useState([]); // Store transactions
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [inputShopName, setInputShopName] = useState("");


  // Fetch transactions from the backend
  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/sellerTransaction`
      );
      if (res.data.success) {
        const userTransactions = res.data.data.filter(
          (transaction) => transaction.uid === userData?.uid
        );
        setTransactions(userTransactions);
      } else {
        toast.error("❌ Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("❌ Error fetching transactions");
    }
  };

  useEffect(() => {
    if (userData?.uid) {
      fetchTransactions();
    }
  }, [userData?.uid]);
 // Re-fetch when userData changes

  const handleCopy = () => {
    navigator.clipboard.writeText(adminNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !userData?.uid ||
      !image ||
      !amount ||
      !transactionId ||
      !( userData?.shopName || inputShopName )
    ) {
      return setStatusMsg("All fields are required");
    }

    setLoading(true); // Start loading

    const formData = new FormData();
    formData.append("image", image);
    formData.append("uid", userData.uid);
    formData.append("shopName", userData.shopName || inputShopName);
    formData.append("amount", amount);
    formData.append("transactionId", transactionId);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/sellerTransaction`,
        formData
      );

      if (!res.data.success) {
        return setStatusMsg(res.data.message || "Transaction failed");
      }

      toast.success("✅ Transaction submitted successfully!");
      setStatusMsg("");
      setAmount("");
      setTransactionId("");
      setImage(null);
      setFormVisible(false);

      // Re-fetch the transactions after a successful submission
      fetchTransactions();
    } catch (error) {
      console.error("Transaction Error:", error);
      toast.error("❌ Failed to submit transaction");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      transaction.transactionId
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.shopName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <div className="flex flex-col items-center justify-center h-auto gap-8 px-6 py-8 md:flex-row md:px-10 bg-gray-50">
        {/* Scanner Image */}
        <div className="flex items-center justify-center w-full p-4 border border-gray-200 rounded-lg shadow-md md:w-1/2">
          <img
            src={assets.scanne}
            alt="Scanner"
            className="w-full max-w-xs rounded-md shadow-lg md:max-w-sm"
          />
        </div>

        {/* Instructions + Form */}
        <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow-xl md:w-1/2">
          <h2 className="mb-4 text-2xl font-bold text-center text-indigo-600">
            📌 Instructions
          </h2>
          <hr className="mb-4" />
          <ul className="pl-5 space-y-3 text-sm text-gray-700 list-none md:text-base">
            <li className="flex items-center gap-2">
              ✅ Scan and pay the <b>due amount</b>.
            </li>
            <li className="flex items-center gap-2">
              📸 Take a <b>screenshot</b> of the payment.
            </li>
            <li className="flex items-center gap-2">
              📲 Send to:
              <span className="font-bold text-blue-600">{adminNumber}</span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-white transition-all duration-300 bg-blue-600 rounded-md hover:bg-blue-700">
                Copy
              </button>
            </li>
            {copied && <span className="text-green-600">Copied!</span>}
            <li className="flex items-center gap-2">
              🛒 Inform admin to continue <b>online selling</b>.
            </li>
            <li className="flex items-center gap-2">
              🚫 If blocked & amount is due, <b>contact admin</b>.
            </li>
          </ul>

          {/* Toggle Button */}
          <button
            onClick={() => setFormVisible(!formVisible)}
            className="w-full px-4 py-2 mt-6 text-white transition-all duration-300 bg-green-600 rounded hover:bg-green-700">
            ➕ {formVisible ? "Close" : "Add Transaction"}
          </button>

          {/* Form */}
          {formVisible && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                value={userData?.shopName || inputShopName}
                onChange={(e) => setInputShopName(e.target.value)}
                disabled={!!userData?.shopName} // disable only if shopName already exists
                placeholder="Enter your shop name"
                className="w-full p-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg"
              />

              <input
                type="text"
                value={userData?.uid}
                disabled
                className="w-full p-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (e.target.value === "" || numValue >= 1) {
                    setAmount(e.target.value);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
                min="1"
                step="any"
              />

              <input
                type="text"
                placeholder="Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
              <button
                type="submit"
                className="w-full p-2 font-semibold text-white transition-all duration-300 bg-blue-600 rounded-lg hover:bg-blue-700"
                disabled={loading}>
                {loading ? "Submitting..." : "Submit Transaction"}
              </button>
            </form>
          )}
          {statusMsg && (
            <p className="mt-2 text-sm text-center text-blue-700">
              {statusMsg}
            </p>
          )}
        </div>
      </div>

      {/* Search Field */}
      <div className="px-4 mt-6 sm:px-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transactions by ID or Shop Name"
          className="p-2 mb-4 text-gray-700 border border-gray-300 rounded-lg "
        />
      </div>

      {/* Display Transactions */}
      <div className="px-4 mt-8 sm:px-8">
        <h3 className="mb-10 text-4xl font-bold text-center text-gray-800">
          Your Transactions
        </h3>

        {/* Search Input */}
        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="🔎 Search by Transaction ID or Shop Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md p-3 text-base border border-gray-300 shadow rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {/* Transaction Table View */}
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border rounded-lg shadow">
              <thead className="text-white bg-indigo-600">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Transaction ID</th>
                  <th className="px-4 py-2">Shop Name</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Created At</th>
                  <th className="px-4 py-2">Updated At</th>
                  <th className="px-4 py-2">Screenshot</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction._id} className="hover:bg-gray-100">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{transaction.transactionId}</td>
                    <td className="px-4 py-2">{transaction.shopName}</td>
                    <td className="px-4 py-2">₹{transaction.amount}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === "Success"
                            ? "bg-green-500 text-white"
                            : transaction.status === "Failed"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-400 text-black"
                        }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(transaction.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        href={transaction.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-10 text-xl text-center text-gray-500">
            No Transactions Found 🔍
          </p>
        )}
      </div>
    </>
  );
};

export default Scanner;
