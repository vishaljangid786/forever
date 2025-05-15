import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../components/Loading";

const DeleteRequest = () => {
  const [data, setData] = useState([]); // Ensure the initial state is an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/delete/getdeleterequests`
        );

        // Ensure the response is always an array
        if (response.data && Array.isArray(response.data.data)) {
          setData(response.data.data);
        } else {
          setData([]); // Fallback if API response is not an array
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete request function
  const handleDelete = async (uid) => {
    try {
      await axios.post(
        `${backendUrl}/api/delete/deletedeleterequests/${uid}`
      );
      // Remove the deleted request from the state
      setData((prevData) => prevData.filter((item) => item.uid !== uid));
    } catch (err) {
      console.error("Error deleting request:", err);
      alert("Failed to delete request. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h2 className="mb-6 text-2xl font-bold text-gray-700">Delete Requests</h2>

      {loading ? (
        <Loading />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
          {data.length === 0 ? (
            <p className="text-gray-600">No delete requests found.</p>
          ) : (
            <table className="w-full border border-collapse border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 border border-gray-300">UID</th>
                  <th className="p-3 border border-gray-300">Email</th>
                  <th className="p-3 border border-gray-300">Password</th>
                  <th className="p-3 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.uid} className="text-center">
                    <td className="p-3 border border-gray-300">{item.uid}</td>
                    <td className="p-3 border border-gray-300">{item.email}</td>
                    <td className="p-3 border border-gray-300">
                      {item.password}
                    </td>
                    <td className="p-3 border border-gray-300">
                      <button
                        onClick={() => handleDelete(item.uid)}
                        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default DeleteRequest;
