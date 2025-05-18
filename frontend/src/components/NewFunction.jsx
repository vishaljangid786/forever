import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';

const ReferralNode = ({ user, level }) => {
  const [children, setChildren] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/user/get-referrals`, {
        userId: user._id,
      });
      setChildren(response.data);
    } catch (error) {
      console.error('Error fetching child users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    if (!expanded) {
      fetchChildren();
    }
    setExpanded(!expanded);
  };

  return (
    <div className="ml-4 mt-4 p-2 border border-gray-300 rounded">
      <div
        onClick={handleExpand}
        className="cursor-pointer text-blue-600 hover:underline"
      >
        <strong>{user.name}</strong> (Email: {user.email}) — Level {level}
      </div>

      <div className="text-sm text-gray-700 mt-1 ml-2">
        <p>Phone: {user.phone}</p>
        <p>Status: {user.status ? 'Active' : 'Inactive'}</p>
        <p>Shop Name: {user.shopName || 'N/A'}</p>
        <p>Left: {user.left}, Right: {user.right}</p>
        <p>Role: {user.role}</p>
        <p>CC: {user.cc}</p>
        <p>Amount: ₹{user.amount}</p>
        <p>UID: {user.uid}</p>
        <p>Location: {user.location}</p>
        <p>Referral Code: {user.referralCode}</p>
        <p>Option: {user.option || 'N/A'}</p>
        <p>Prize: {user.prize || 'N/A'}</p>
      </div>

      {expanded && (
        <div className="ml-4 mt-2 border-l border-gray-300 pl-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            children.map((child) => (
              <ReferralNode key={child._id} user={child} level={level + 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const NewFunction = ({ userData }) => {
  const [levelOneUsers, setLevelOneUsers] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchLevelOne = async () => {
      try {
        const response = await axios.post(`${backendUrl}/api/user/get-referrals`, {
          userId: userData._id,
        });
        setLevelOneUsers(response.data);
      } catch (error) {
        console.error('Error fetching level 1 users:', error);
      }
    };

    if (userData?._id) {
      fetchLevelOne();
    }
  }, [userData]);

  return (
    <div className="">
      <h2
        className="text-xl font-bold mb-4 cursor-pointer flex justify-between hover:bg-gray-200 border p-2 px-4 rounded"
        onClick={() => setOpen(!open)}
      >
        My Generation Team
        <span className="text-xl text-gray-500">
          {open ? '-' : '+'} 
        </span>
      </h2>

      {open && (
        <div>
          {levelOneUsers.length > 0 ? (
            levelOneUsers.map((user) => (
              <ReferralNode key={user._id} user={user} level={1} />
            ))
          ) : (
            <p>No direct referrals found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NewFunction;
