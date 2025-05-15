import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App"; // Adjust path if needed

const Bills = ({ userData }) => {
  const [userBills, setUserBills] = useState([]);

  useEffect(() => {
    const fetchUserBills = async () => {
      if (!userData?.uid) return;
      try {
        const res = await axios.get(`${backendUrl}/api/bill/all`);
        const filtered = res.data.filter((bill) => bill.uid === userData.uid);
        setUserBills(filtered);
      } catch (err) {
        console.error("Failed to fetch bills:", err);
      }
    };

    fetchUserBills();
  }, [userData]);

  const downloadImage = async (url, filename) => {
    try {   
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download the bill image.");
    }
  };

  return (
    <div className="max-w-5xl p-6 mx-auto bg-white rounded shadow-lg">
      <h2 className="mb-4 text-2xl font-semibold">Your Bills</h2>
      {userBills.length === 0 ? (
        <p>No bills found for your UID.</p>
      ) : (
        <table className="min-w-full text-sm text-left table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 font-semibold border">#</th>
              <th className="p-2 font-semibold border">Title</th>
              <th className="p-2 font-semibold border">Image</th>
              <th className="p-2 font-semibold border">Download</th>
            </tr>
          </thead>
          <tbody>
            {userBills.map((bill, index) => (
              <tr key={bill._id} className="bg-white border-b">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{bill.title}</td>
                <td className="p-2 border">
                  <img
                    src={bill.image}
                    alt="Bill"
                    className="object-cover w-20 h-16 rounded"
                  />
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() =>
                      downloadImage(bill.image, `${bill.title}-${bill.uid}.jpg`)
                    }
                    className="px-3 py-1 text-white bg-indigo-600 rounded hover:bg-indigo-700">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Bills;
