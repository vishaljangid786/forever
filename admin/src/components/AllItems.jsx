import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const AllItems = ({ token, userData }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!userData?._id) return;

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/list/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [userData?._id, token]);

  const handleRemove = async (productId) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/product/remove/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setProducts(products.filter((product) => product._id !== productId));
        toast.success("Successfully removed");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Filter products by search
  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatch = product.category
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return nameMatch || categoryMatch;
  });

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold">All Items</h2>

      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search by name or category..."
        className="w-full p-2 mb-6 border rounded outline-none sm:w-96 focus:ring"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredProducts.length === 0 ? (
        <p className="text-gray-600">No products found</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <div key={product._id} className="p-4 border rounded-lg shadow-md">
              <img
                src={product.image[0]}
                alt={product.name}
                className="object-contain w-full h-40 rounded"
              />
              <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">
                Category: {product.category}
              </p>
              <button
                onClick={() => handleRemove(product._id)}
                className="px-3 py-1 mt-3 text-white bg-red-500 rounded hover:bg-red-600">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllItems;
