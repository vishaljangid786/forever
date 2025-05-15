import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Team = ({ userData, token }) => {
  const [referredUsers, setReferredUsers] = useState([]);
  const [totalLeft, setTotalLeft] = useState(0);
  const [totalRight, setTotalRight] = useState(0);
  const [totalIndirectActive, setTotalIndirectActive] = useState(0);
  const [totalIndirectDeactive, setTotalIndirectDeactive] = useState(0);
  const [totalDirectActive, setTotalDirectActive] = useState(0);
  const [totalDirectDeactive, setTotalDirectDeactive] = useState(0);
  const navigate = useNavigate();

  const [totalCC, setTotalCC] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const userId = userData?._id;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [inDirectUsers, setInDirectUsers] = useState([]);
  const [totalIndirectLeft, setTotalIndirectLeft] = useState(0);
  const [totalIndirectRight, setTotalIndirectRight] = useState(0);
  const [totalleftcc, setTotalLeftCC] = useState(0);
  const [totalrightcc, setTotalRightCC] = useState(0);
  const [UserHierarchy, setUserHierarchy] = useState([]);

  useEffect(() => {
    if (!token) {
      console.log("No token found");
      return;
    }
    const fetchReferredUsers = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/referred`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        

        if (response.data.success) {
          const users = response.data.referredUsers;
          setReferredUsers(users);

          // Count Left & Right Users
          setTotalLeft(users.filter((user) => user.option === "left").length);
          setTotalRight(users.filter((user) => user.option === "right").length);

          setTotalDirectActive(
            users.filter((user) => user.status === true).length
          );
          setTotalDirectDeactive(
            users.filter((user) => user.status === false).length
          );
          // Total PP (cc)
          setTotalCC(users.reduce((sum, user) => sum + (user.cc || 0), 0));
        } else {
          console.error("Failed to fetch referred users");
        }
      } catch (error) {
        console.error("Error fetching referred users", error);
      }
    };

    fetchReferredUsers();
  }, [token]);

  useEffect(() => {
    if (!userId) return;
    const fetchReferrals = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/user/referrals/${userId}`
        );
        if (!response.ok) return console.error(`Error: ${response.status}`);

        const data = await response.json();
        setTotalMembers(data.count || 0);

        const leftUsers = data.users.filter((user) => user.option === "left");
        const rightUsers = data.users.filter((user) => user.option === "right");

        const leftCC = leftUsers.reduce((sum, user) => sum + (user.cc || 0), 0);

        const rightCC = rightUsers.reduce(
          (sum, user) => sum + (user.cc || 0),
          0
        );

        // Update state
        setTotalLeftCC(leftCC);
        setTotalRightCC(rightCC);

        setInDirectUsers(data.users);

        setTotalIndirectLeft(leftUsers.length);
        setTotalIndirectRight(rightUsers.length);
        setTotalIndirectActive(
          data.users.filter((user) => user.status === true).length
        );
        setTotalIndirectDeactive(
          data.users.filter((user) => user.status === false).length
        );
      } catch (error) {
        console.error("Error fetching referrals:", error.message);
      }
    };

    fetchReferrals();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchReferrals = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/user/referrals/${userId}`
        );
        if (!response.ok) return console.error(`Error: ${response.status}`);

        const data = await response.json();
        setTotalMembers(data.count || 0);

        const userMap = new Map();

        data.users.forEach((user) => {
          userMap.set(user._id, {
            ...user,
            children: [],
            level: null, // Set level as null initially
          });
        });

        /*** STEP 2: ASSIGN CHILDREN TO PARENTS ***/
        let hierarchy = [];

        data.users.forEach((user) => {
          if (!user.referredBy || !userMap.has(user.referredBy)) {
            // Root users (Level 1)
            const rootUser = userMap.get(user._id);
            if (rootUser) {
              rootUser.level = 1;
              hierarchy.push(rootUser);
            }
          } else {
            // Assign child to parent
            const parent = userMap.get(user.referredBy);
            const child = userMap.get(user._id);

            if (parent && child) {
              parent.children.push(child);
            }
          }
        });

        /*** STEP 3: ASSIGN LEVELS USING BFS ***/
        const queue = [...hierarchy]; // Start BFS from level 1 users

        while (queue.length > 0) {
          const currentUser = queue.shift(); // Get the first user

          currentUser.children.forEach((child) => {
            if (child.level === null) {
              child.level = currentUser.level + 1; // Assign correct level
              queue.push(child); // Push to queue for next processing
            }
          });
        }

        // Store final hierarchy in state
        setUserHierarchy([...userMap.values()]);
      } catch (error) {
        console.error("Error fetching referrals:", error.message);
      }
    };

    fetchReferrals();
  }, [userId]);

  return (
  <>
      <div>
        <p className="px-3 py-1 mt-2 text-red-500 bg-red-100 border border-red-500 rounded">
          Reload Page to get the Updated Data.
        </p>
        {/* {userData?.cc && ( */}
          <p className="my-2 text-xl font-semibold">
            Your PP: {userData?.cc || 0}🪙
          </p>
          <p className="my-2 text-xl font-semibold">
            Your Left: {userData?.left || 0}🪙
          </p>
          <p className="my-2 text-xl font-semibold">
            Your Right: {userData?.right || 0}🪙
          </p>
        {/* )} */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          <div className="p-5 rounded-lg shadow-md bg-gradient-to-r from-green-200 to-emerald-100">
            <h2 className="text-2xl font-bold text-emerald-700">Your Team</h2>
            <div className="mt-2 text-lg">
              Direct Team:{" "}
              <span className="font-semibold">{referredUsers.length}</span>
            </div>
            <div className="mt-2 text-lg text-green-700">
              Active: <span className="font-semibold">{totalDirectActive}</span>
            </div>
            <div className="mt-2 text-lg text-red-700">
              Inactive:{" "}
              <span className="font-semibold">{totalDirectDeactive}</span>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="p-4 bg-blue-100 rounded-lg shadow-md">
                <p className="font-semibold text-blue-700">Total Left Users</p>
                <p className="text-xl font-bold">{totalLeft}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-lg shadow-md">
                <p className="font-semibold text-green-700">
                  Total Right Users
                </p>
                <p className="text-xl font-bold">{totalRight}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-lg shadow-md bg-gradient-to-r from-purple-200 to-indigo-100">
            <h2 className="text-2xl font-bold text-purple-700">
              Indirect Team
            </h2>
            <div className="mt-2 text-lg">
              InDirect Team:{" "}
              <span className="font-semibold">{totalMembers} members</span>
            </div>
            <div className="mt-2 text-lg text-green-700">
              Active:{" "}
              <span className="font-semibold">{totalIndirectActive}</span>
            </div>
            <div className="mt-2 text-lg text-red-700">
              Inactive:{" "}
              <span className="font-semibold">{totalIndirectDeactive}</span>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="p-4 bg-purple-100 rounded-lg shadow-md">
                <p className="font-semibold text-purple-700">
                  Total Indirect Left Users
                </p>
                <p className="text-xl font-bold">{totalIndirectLeft}</p>
              </div>
              <div className="p-4 bg-orange-100 rounded-lg shadow-md">
                <p className="font-semibold text-orange-700">
                  Total Indirect Right Users
                </p>
                <p className="text-xl font-bold">{totalIndirectRight}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Users List */}
        <div className="mt-6">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full p-4 bg-gray-200 rounded-lg">
            <span className="font-semibold">View Direct Team</span>
            <span>
              {isOpen ? (
                <i className="fa-solid fa-angle-up"></i>
              ) : (
                <i className="fa-solid fa-angle-down"></i>
              )}
            </span>
          </button>

          {isOpen && (
            <div className="p-4 mt-2 space-y-4 bg-gray-100 rounded-lg">
              {referredUsers.length > 0 ? (
                referredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="p-4 bg-white rounded-lg shadow-md">
                    <p className="text-lg font-semibold text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-700">
                        PP: <strong>{user.cc} 🪙</strong>
                      </span>
                      <span className="text-sm text-gray-700">
                        Level: {user.lev || "No level"}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.status
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {user.status ? "Active" : "Deactive"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-blue-600">
                      Option: {user.option || "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No referred users found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Indirect Team */}
      <div className="mt-6">
        {/* Indirect Users List */}
        <button
          onClick={() => setIsOpen2(!isOpen2)}
          className="flex items-center justify-between w-full p-4 mt-4 bg-gray-200 rounded-lg">
          <span className="font-semibold">View InDirect Team</span>
          <span>
            {isOpen2 ? (
              <i className="fa-solid fa-angle-up"></i>
            ) : (
              <i className="fa-solid fa-angle-down"></i>
            )}
          </span>
        </button>

        {isOpen2 && (
          <div className="p-4 mt-2 space-y-4 bg-gray-100 rounded-lg">
            {inDirectUsers.length > 0 ? (
              inDirectUsers.map((user) => (
                <div
                  key={user._id}
                  className="p-4 bg-white rounded-lg shadow-md">
                  <p className="text-lg font-semibold text-gray-800">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-700">
                      PP: <strong>{user.cc} 🪙</strong>
                    </span>
                    <span className="text-sm text-gray-700">
                      Level: {user.lev || "No level"}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                      {user.status ? "Active" : "Deactive"}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold">
                    Option:
                    <span className="text-blue-600 ">
                      {" "}
                      {user.option || "N/A"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No indirect users found.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 mb-6">
        <button
          onClick={() => setIsOpen3(!isOpen3)}
          className="flex items-center justify-between w-full p-4 bg-gray-200 rounded-lg">
          <span className="font-semibold">View User Hierarchy</span>
          <span>
            {isOpen3 ? (
              <i className="fa-solid fa-angle-up"></i>
            ) : (
              <i className="fa-solid fa-angle-down"></i>
            )}
          </span>
        </button>

        {isOpen3 && (
          <div className="p-4 mt-2 bg-gray-100 rounded-lg">
            {UserHierarchy.length > 0 ? (
              UserHierarchy.map((rootUser) => (
                <UserHierarchyTree
                  key={rootUser.referralCode}
                  user={rootUser}
                />
              ))
            ) : (
              <p className="text-center text-gray-500">
                No hierarchy available.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const UserHierarchyTree = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative pl-6 ml-4 border-l-4 border-gray-300 border-dashed">
      <div
        className="relative p-4 mb-4 transition-all bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-100 hover:shadow-lg"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-800">
            {user.name}{" "}
            <span className="text-sm text-gray-500">(Level {user.level})</span>
          </p>
          <span className="text-sm font-medium text-gray-600">
            {isExpanded ? "[-] Collapse" : "[+] Expand"}
          </span>
        </div>

        <p className="text-sm text-gray-600">Email: {user.email}</p>
        <p className="text-sm text-gray-600">Phone: {user.phone}</p>
        <p className="text-sm text-gray-600">Location: {user.location}</p>

        {/* Address */}
        <p className="text-sm text-gray-600">
          Address: {user.street}, {user.city}, {user.state}, {user.country} -{" "}
          {user.zipcode}
        </p>

        {/* Additional Details */}
        <div className="mt-2 text-sm text-gray-600">
          <p>Referral Code: {user.referralCode}</p>
          <p>Referred By: {user.referredBy}</p>
          <p>User ID: {user.uid}</p>
          <p>Role: {user.role}</p>
          <p className="font-medium">
            Status:{" "}
            <span
              className={`font-bold ${
                user.status ? "text-green-600" : "text-red-600"
              }`}>
              {user.status ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
      </div>

      {/* Show children only if expanded */}
      {isExpanded && user.children.length > 0 && (
        <div className="pl-4 ml-6 border-l-2 border-gray-300">
          {user.children.map((child) => (
            <UserHierarchyTree key={child.referralCode} user={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const UserHierarchy = ({ UserHierarchy }) => {
  return (
    <div className="mt-6">
      <button className="flex items-center justify-between w-full p-4 bg-gray-200 rounded-lg">
        <span className="font-semibold">View User Hierarchy</span>
      </button>

      <div className="p-4 mt-2 bg-gray-100 rounded-lg">
        {UserHierarchy.length > 0 ? (
          UserHierarchy.map((rootUser) => (
            <UserHierarchyTree key={rootUser.referralCode} user={rootUser} />
          ))
        ) : (
          <p className="text-center text-gray-500">No hierarchy available.</p>
        )}
      </div>
    </div>
  );
};

export default Team;
