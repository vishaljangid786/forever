import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import Loading from "./Loading";

const ListProducts = ({ token, userData }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    price: [],
    category: "",
    subCategory: "",
    sizes: [],
    color: "", // Change color to a comma-separated string
    oldPrice: [],
    cc: "",
  });

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, [token, userData]);

  const fetchProducts = async () => {
    try {
      if (!userData?._id) return;

      const response = await axios.get(
        `${backendUrl}/api/product/list/${userData._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/product/remove/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Product removed successfully");
        // Remove product from local state
        setProducts(products.filter((product) => product._id !== productId));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const openEditModal = (product) => {
    const sanitizedColors = product.color.join(", "); // Join array into a string

    setCurrentProduct(product);
    setEditData({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      category: product.category,
      subCategory: product.subCategory,
      sizes: product.sizes || [],
      color: sanitizedColors, // Set color as a string
      cc: product.cc || "",
    });

    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(",").map((item) => item.trim());
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      const sanitizedColors = editData.color
        .split(",")
        .map((color) => color.trim()); // Split color string into array

      const response = await axios.put(
        `${backendUrl}/api/product/updateproduct`,
        {
          id: currentProduct._id,
          ...editData,
          color: sanitizedColors, // Pass colors as an array
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Product updated successfully");
        // Update local state
        const updatedProducts = products.map((p) =>
          p._id === currentProduct._id ? { ...p, ...editData } : p
        );
        setProducts(updatedProducts);
        setIsEditing(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (products.length === 0) {
    return (
      <div className="p-4">
        <h2 className="mb-4 text-2xl font-bold">Your Products</h2>
        <div className="text-gray-500 text-">No products found</div>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto">
      <h2 className="mb-4 text-2xl font-bold">Your Products</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="overflow-hidden border rounded-lg shadow-md">
            {/* Product Image */}
            <img
              src={product.image[0]}
              alt={product.name}
              className="object-contain w-full h-48"
            />

            {/* Product Details */}
            <div className="p-4">
              <h3 className="mb-2 text-xl font-semibold">{product.name}</h3>
              <p className="mb-2 text-gray-600">
                {product.description.substring(0, 100)}...
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold">
                  {currency}
                  {parseInt(product.price[0])}
                </span>
                <span className="text-sm text-gray-500">
                  {product.category} - {product.subCategory}
                </span>
              </div>

              <span className="text-lg font-bold">
                {currency}
                {parseInt(product.oldPrice[0])}
              </span>
              {/* Product Variants */}
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Sizes: {product.sizes.join(", ")}
                </p>
                <p className="text-sm text-gray-600">
                  Colors:{" "}
                  {Array.isArray(product.color)
                    ? product.color.join(", ")
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-600">PP: {product.cc}🪙</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => openEditModal(product)}
                  className="px-4 py-2 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="px-4 py-2 text-white transition-colors bg-red-500 rounded hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>

            {isEditing && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="p-6 bg-white rounded shadow-lg w-[90%] max-w-lg overflow-y-auto max-h-[90vh]">
                  <h2 className="mb-4 text-xl font-bold">Edit Product</h2>

                  <label className="block mb-1 font-semibold">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Product Name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="w-full p-2 mb-2 border rounded"
                  />

                  <label className="block mb-1 font-semibold">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={editData.description}
                    onChange={handleEditChange}
                    className="w-full p-2 mb-2 border rounded"
                  />

                  <label className="block mb-1 font-semibold">Dp</label>
                  <input
                    type="text"
                    name="price"
                    placeholder="Price"
                    value={editData.price}
                    onChange={handleEditChange}
                    className="w-full p-2 mb-2 border rounded"
                  />

                  <label className="block mb-1 font-semibold">Price</label>
                  <input
                    type="text"
                    name="oldPrice"
                    placeholder="Old Price"
                    value={editData.oldPrice}
                    onChange={handleEditChange}
                    className="w-full p-2 mb-2 border rounded"
                  />

                  <label className="block mb-1 font-semibold">Category</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={editData.category}
                    onChange={handleEditChange}
                    className="w-full p-2 mb-2 border rounded"
                  />

                  <label className="block mb-1 font-semibold">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    name="subCategory"
                    placeholder="Subcategory"
                    value={editData.subCategory}
                    onChange={handleEditChange}
                    className="w-full p-2 mb-2 border rounded"
                  />

                  <label className="block mb-1 font-semibold">Sizes</label>
                  <input
                    type="text"
                    name="sizes"
                    placeholder="Sizes (comma separated, e.g., 12/256, 12/512)"
                    value={editData.sizes.join(", ")}
                    onChange={(e) => handleArrayChange(e, "sizes")}
                    className="w-full p-2 mb-2 border rounded"
                  />

                  <label className="block mb-1 font-semibold">Colors</label>
                  <input
                    type="text"
                    name="color"
                    placeholder="Colors (comma separated)"
                    value={editData.color}
                    onChange={handleEditChange}
                    className="w-full p-2 mb-2 border rounded"
                  />

                  <label className="block mb-1 font-semibold">PP (🪙)</label>
                  <input
                    type="text"
                    name="cc"
                    placeholder="PP (🪙)"
                    value={editData.cc}
                    onChange={handleEditChange}
                    className="w-full p-2 mb-4 border rounded"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProducts;
