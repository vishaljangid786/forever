import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";

const Requests = ({userData}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upi");
  const [activeTab2, setActiveTab2] = useState("upi");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [updatedAmount, setUpdatedAmount] = useState(userData?.amount);
  const [formData, setFormData] = useState({
    userId:  "",
    mode: "upi",
    amount: "",
    upiId: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
  });

  
  useEffect(() => {
    if (userData?._id) {
      setFormData((prev) => ({
        ...prev,
        userId: userData._id,
      }));
    }
  }, [userData?._id]);
   useEffect(() => {
     // Watch for changes in userData.amount and update the state accordingly
     if (userData?.amount !== updatedAmount) {
       setUpdatedAmount(userData?.amount);
     }
   }, [userData?.amount, updatedAmount]);


  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${backendUrl}/api/request/createrequest`,
        formData
      );
      setMessage({
        type: "success",
        text:
          res.data.message +
          `. Remaining Balance: ₹${res.data.remainingBalance}`,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Request failed",
      });
    }
  };

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized: No token found.");
          setLoading(false);
          return;
        }

        const { data } = await axios.get(
          `${backendUrl}/api/request/getrequests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) {
          setRequests(data.data);
        } else {
          setError("Failed to fetch requests.");
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [backendUrl]);

  // Update Status Function
  const updateStatus = async (requestId, newStatus, amount, sellerId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized: No token found.");
        return;
      }

      if (newStatus === "failed") {
        // Send refund API request
        const refundResponse = await axios.post(
          `${backendUrl}/api/request/failrequest`, // API to handle failed requests
          { requestId, amount, sellerId }, // Send requestId, amount, and sellerId
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!refundResponse.data.success) {
          alert("Failed to process refund.");
          return;
        }
      }

      // Update request status
      const { data } = await axios.post(
        `${backendUrl}/api/request/updatestatus`,
        { requestId, status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req._id === requestId ? { ...req, status: newStatus } : req
          )
        );
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status. Try again later.");
    }
  };

  // Filter requests
  const upiRequests = requests.filter((req) => req.upiId);
  const accountRequests = requests.filter((req) => req.account_number);

  const filteredUPIRequests = upiRequests.filter((req) => {
    const search = searchTerm.toLowerCase();
    return (
      req.userId?.name?.toLowerCase().includes(search) ||
      req.userId?.email?.toLowerCase().includes(search) ||
      req.upiId?.toLowerCase().includes(search) ||
      req.status?.toLowerCase().includes(search) ||
      req.amount?.toString().includes(search) || // Search by amount
      new Date(req.createdAt)
        .toLocaleDateString("en-GB") // Format date as DD/MM/YYYY
        .toLowerCase()
        .includes(search)
    );
  });

  const filteredAccountRequests = accountRequests.filter((req) => {
    const search = searchTerm.toLowerCase();
    return (
      req.userId?.name?.toLowerCase().includes(search) ||
      req.userId?.email?.toLowerCase().includes(search) ||
      req.account_number?.toString().includes(search) ||
      req.ifsc_code?.toLowerCase().includes(search) ||
      req.status?.toLowerCase().includes(search) ||
      req.amount?.toString().includes(search) || // Search by amount
      new Date(req.createdAt)
        .toLocaleDateString("en-GB") // Format date as DD/MM/YYYY
        .toLowerCase()
        .includes(search)
    );
  });

  return (
    <>
      <div className="max-w-6xl p-6 mx-auto bg-white rounded-lg shadow-md">
        <div
          onClick={() => setShowForm(true)}
          className="fixed flex items-center justify-center w-12 h-12 text-2xl text-white bg-red-500 rounded-full cursor-pointer bottom-5 right-5">
          <i className="fa-solid fa-plus"></i>
        </div>

        <h2 className="mb-4 text-xl font-semibold">Payment Requests</h2>
        <p>Your Amount: {updatedAmount}</p>

        {showForm && (
          <div className="absolute max-w-md p-6 mx-auto -translate-x-1/2 -translate-y-1/2 bg-white rounded shadow-2xl top-1/2 left-1/2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="mb-4 text-xl font-bold">
                Create Withdrawal Request
              </h2>
              <i className="cursor-pointer fa-solid fa-x" onClick={()=>setShowForm(false)}></i>
            </div>
            {message && (
              <p
                className={`mb-4 text-sm ${
                  message.type === "success" ? "text-green-600" : "text-red-600"
                }`}>
                {message.text}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="userId"
                placeholder="User ID"
                value={formData.userId}
                onChange={handleChange}
                disabled={userData?._id ? true : false}
                className="w-full p-2 border rounded"
                required
              />

              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />

              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full p-2 border rounded">
                <option value="upi">UPI</option>
                <option value="account">Bank Account</option>
              </select>

              {formData.mode === "upi" && (
                <input
                  type="text"
                  name="upiId"
                  placeholder="UPI ID"
                  value={formData.upiId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              )}

              {formData.mode === "account" && (
                <>
                  <input
                    type="text"
                    name="account_number"
                    placeholder="Account Number"
                    value={formData.account_number}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    name="ifsc_code"
                    placeholder="IFSC Code"
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    name="account_holder_name"
                    placeholder="Account Holder Name"
                    value={formData.account_holder_name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </>
              )}

              <button
                type="submit"
                className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
                Submit Request
              </button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-4">
          <button
            className={`px-4 py-2 border rounded-l ${
              activeTab === "upi" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("upi")}>
            UPI Requests
          </button>
          <button
            className={`px-4 py-2 border rounded-r ${
              activeTab === "account" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("account")}>
            Account Requests
          </button>
        </div>

        {loading && (
          <div>
            <Loading />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}

        {/* Requests Table */}
        {activeTab === "upi" && (
          <>
            {upiRequests.length > 0 ? (
              <RequestTable
                requests={upiRequests}
                updateStatus={updateStatus}
                type="UPI"
              />
            ) : (
              <p>No UPI requests found.</p>
            )}
          </>
        )}

        {activeTab === "account" && (
          <>
            {accountRequests.length > 0 ? (
              <RequestTable
                requests={accountRequests}
                updateStatus={updateStatus}
                type="Account"
              />
            ) : (
              <p>No account transfer requests found.</p>
            )}
          </>
        )}
      </div>

      <div className="max-w-6xl p-6 mx-auto mt-2 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Total Requests</h2>

        <div className="flex justify-between">
          {/* Tabs */}
          <div className="flex mb-4">
            <button
              className={`px-4 py-2 border rounded-l ${
                activeTab2 === "upi" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setActiveTab2("upi")}>
              UPI Requests
            </button>
            <button
              className={`px-4 py-2 border rounded-r ${
                activeTab2 === "account"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setActiveTab2("account")}>
              Account Requests
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="h-10 px-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div>
            <Loading />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}

        {/* Requests Table */}
        {activeTab2 === "upi" && (
          <>
            {upiRequests.length > 0 ? (
              <RequestTable2
                requests={filteredUPIRequests}
                updateStatus={updateStatus}
                type="UPI"
              />
            ) : (
              <p>No UPI requests found.</p>
            )}
          </>
        )}

        {activeTab2 === "account" && (
          <>
            {accountRequests.length > 0 ? (
              <RequestTable2
                requests={filteredAccountRequests}
                updateStatus={updateStatus}
                type="Account"
              />
            ) : (
              <p>No account transfer requests found.</p>
            )}
          </>
        )}
      </div>
    </>
  );
};

// Reusable Table Component
const RequestTable = ({ requests, updateStatus, type }) => {
  return (
    <table className="w-full border border-gray-300">
      <thead>
        <tr className="text-left bg-gray-200">
          <th className="p-2 border">User Name</th>
          <th className="p-2 border">Email</th>
          {type === "UPI" ? (
            <th className="p-2 border">UPI ID</th>
          ) : (
            <th className="p-2 border">Account No.</th>
          )}
          {type === "Account" && <th className="p-2 border">IFSC Code</th>}
          <th className="p-2 border">Amount</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Action</th>
        </tr>
      </thead>
      <tbody>
        {requests
          .filter(
            (req) => req?.status !== "completed" && req?.status !== "failed"
          )
          .map((req) => (
            <tr key={req._id} className="text-center">
              <td className="p-2 border">{req.userId?.name || "N/A"}</td>
              <td className="p-2 border">{req.userId?.email || "N/A"}</td>
              {type === "UPI" ? (
                <td className="p-2 border">{req.upiId}</td>
              ) : (
                <td className="p-2 border">{req.account_number}</td>
              )}
              {type === "Account" && (
                <td className="p-2 border">{req.ifsc_code}</td>
              )}
              <td className="p-2 border">₹{req.amount}</td>
              <td className="p-2 capitalize border">{req.status}</td>
              <td className="p-2 border">
                <button
                  onClick={() =>
                    updateStatus(
                      req._id,
                      "completed",
                      req.amount,
                      req.userId?._id
                    )
                  }
                  className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded">
                  Complete
                </button>
                <button
                  onClick={() =>
                    updateStatus(req._id, "failed", req.amount, req.userId?._id)
                  }
                  className="px-2 py-1 text-sm text-white bg-red-500 rounded">
                  Fail
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

const RequestTable2 = ({ requests, updateStatus, type }) => {
  return (
    <table className="w-full border border-gray-300">
      <thead>
        <tr className="text-left bg-gray-200">
          <th className="p-2 border">User Name</th>
          <th>id</th>
          <th className="p-2 border">Email</th>
          {type === "UPI" ? (
            <th className="p-2 border">UPI ID</th>
          ) : (
            <th className="p-2 border">Account No.</th>
          )}
          {type === "Account" && <th className="p-2 border">IFSC Code</th>}
          <th className="p-2 border">Amount</th>
          <th className="p-2 border">Date</th>
          <th className="p-2 border">Status</th>
          
        </tr>
      </thead>
      <tbody>
        {requests
          .filter((req) => req?.status !== "pending")
          .map((req) => (
            <tr key={req._id} className="text-center">
              <td className="p-2 border">{req.userId?.name || "N/A"}</td>
              <td className="p-2 border">{req._id}</td>
              <td className="p-2 border">{req.userId?.email || "N/A"}</td>
              {type === "UPI" ? (
                <td className="p-2 border">{req.upiId}</td>
              ) : (
                <td className="p-2 border">{req.account_number}</td>
              )}
              {type === "Account" && (
                <td className="p-2 border">{req.ifsc_code || "N/A"}</td>
              )}
              <td className="p-2 border">₹{req.amount}</td>
              <td className="p-2 border">
                {new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(req.createdAt))}
              </td>

              <td
                className={`p-2 border font-bold ${
                  req.status === "pending"
                    ? "text-yellow-500"
                    : req.status === "completed"
                    ? "text-green-500"
                    : "text-red-500"
                }`}>
                {req.status}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default Requests;
