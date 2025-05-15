import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const ReferredUsers = () => {
  const { token } = useContext(ShopContext);
  const [referredUsers, setReferredUsers] = useState([]);
  const [totalCC, setTotalCC] = useState(0);

  useEffect(() => {
    const fetchReferredUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/referred`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setReferredUsers(response.data.referredUsers);

          // Calculate total CC from referred users
          const total = response.data.referredUsers.reduce(
            (sum, user) => sum + (user.cc || 0), // Ensure cc exists
            0
          );
          setTotalCC(total);
        } else {
          console.error("Failed to fetch referred users");
        }
      } catch (error) {
        console.error("Error fetching referred users", error);
      }
    };

    fetchReferredUsers();
  }, [token]);


  return (
    <div className="max-w-lg p-6 mx-auto mt-10">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-600">
        Referred Users
      </h2>

      <div className="mb-4 text-center text-gray-700">
        <strong>Total Referred PP:</strong> {totalCC} 🪙
      </div>

      {referredUsers.length > 0 ? (
        <div className="space-y-4">
          {referredUsers.map((user) => (
            <div key={user._id} className="p-4 bg-white rounded-lg shadow-md">
              <p className="text-lg font-semibold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-700">
                  PP: <strong>{user.cc} 🪙</strong>
                </span>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    user.status
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                  {user.status ? "Active" : "InActive"}
                </span>
              </div>
              {user.option && (
                <p className="mt-2 text-sm text-blue-600">{user.option}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No referred users found.</p>
      )}
    </div>
  );
};

export default ReferredUsers;
