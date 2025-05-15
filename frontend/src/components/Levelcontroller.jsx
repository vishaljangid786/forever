import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import Loading from "./Loading";

const LevelController = ({ token, userData }) => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendurl = backendUrl;
  const [levelName, setLevelName] = useState("");

  // Fetch all levels from API
  const getAllLevels = async () => {
    try {
      if (!userData || userData.status === "false" || userData.status === false)
        return;

      const response = await axios.get(`${backendUrl}/api/level/getAllLevel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLevels(response.data.level);
    } catch (error) {
      console.error(
        "Error fetching levels:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const getSingleLevels = async () => {
    try {
      if (!userData || userData.status === "false" || userData.status === false)
        return;

      const response = await axios.get(
        `${backendUrl}/api/level/singlelevel/${userData?.level}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLevelName(response.data.level.levelName); // ✅ Set level name
    } catch (error) {
      console.error(
        "Error fetching levels:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Fetch levels on component mount
  useEffect(() => {
    if (token && userData) {
      getAllLevels();
      getSingleLevels();
    }
  }, [token, userData]);
  

  // Top of component before return:
  const userLevelIndex = levels.findIndex((lvl) => lvl.levelName === levelName);

  return (
    <div className="min-h-screen p-6 bg-gray-100 rounded">
      <div className="max-w-5xl p-6 mx-auto bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          Level Controller
        </h2>

        {/* Status Indicator */}
        <div className="flex items-center mb-4">
          <span
            className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
              userData?.status === true
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
            {userData?.status === true ? "Active" : "Deactive"}
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-gray-600"><Loading /></div>
        ) : levels.length > 0 ? (
          <>
            {/* ✅ Inactive user message */}
            {userData?.status === false && (
              <div className="p-4 mb-4 text-yellow-800 bg-yellow-100 border border-yellow-300 rounded">
                ⚠️ You are not an active member since you completed the minimum
                amount to be active.
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {levels.map((level, index) => {
                const isCurrentLevel = level.levelName === levelName;
                const isBeforeCurrent = index < userLevelIndex;
                const isCompleted =
                  isBeforeCurrent ||
                  (userData.left >= level.left &&
                    userData.right >= level.right);
                const isLocked = !isCompleted && !isCurrentLevel;

                return (
                  <div
                    key={level._id}
                    className={`p-4 border-l-4 rounded-lg shadow ${
                      isCurrentLevel
                        ? "border-green-500 bg-green-50"
                        : isCompleted
                        ? "border-gray-400 bg-gray-100"
                        : "border-red-400 bg-red-50"
                    }`}>
                    <h3 className="flex items-center justify-between text-lg font-bold text-gray-800">
                      {level.levelName}
                      {isCurrentLevel && (
                        <span className="text-xs font-semibold text-green-600">
                          Your Current Level
                        </span>
                      )}
                      {isCompleted && !isCurrentLevel && (
                        <span className="text-sm font-medium text-green-700">
                          ✅ Completed
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-sm text-red-500">🔒 Locked</span>
                      )}
                    </h3>

                    <p className="text-sm text-gray-700">
                      Left:{" "}
                      <span className="font-bold">
                        {isCurrentLevel
                          ? `${level.left}  PP/ ${userData.left} PP`
                          : level.left}
                      </span>
                    </p>

                    <p className="text-sm text-gray-700">
                      Right:{" "}
                      <span className="font-bold">
                        {isCurrentLevel
                          ? `${level.right} PP / ${userData.right}PP`
                          : level.right}
                      </span>
                    </p>

                    {isCurrentLevel && (
                      <div className="mt-2">
                        <div className="mb-1 text-xs text-gray-600">
                          Left Progress
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded">
                          <div
                            className="h-full bg-green-500 rounded"
                            style={{
                              width: `${Math.min(
                                (userData.left / level.left) * 100,
                                100
                              )}%`,
                            }}></div>
                        </div>

                        <div className="mt-2 mb-1 text-xs text-gray-600">
                          Right Progress
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded">
                          <div
                            className="h-full bg-blue-500 rounded"
                            style={{
                              width: `${Math.min(
                                (userData.right / level.right) * 100,
                                100
                              )}%`,
                            }}></div>
                        </div>
                      </div>
                    )}

                    <p className="mt-2 text-sm text-gray-700">
                      Reward: <span className="font-bold">₹{level.price}</span>
                    </p>

                    {level.levelType?.trim() && (
                      <p className="text-sm text-gray-600">
                        Type:{" "}
                        <span className="font-bold">{level.levelType}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-gray-500">No levels found.</p>
        )}
      </div>
    </div>
  );
};

export default LevelController;
