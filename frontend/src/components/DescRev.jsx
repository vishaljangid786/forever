import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const DescRev = ({ description, productId,setReviews ,reviews, setAverageRating}) => {
  const [selectedTab, setSelectedTab] = useState("description");
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  // Fetch Reviews from Backend
  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/product/getReviews/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    }
  };

  // Add a New Review
  const handleNewReviewSubmit = async () => {
    if (newReview.trim()) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/product/addReview`,
          {
            productId,
            user: "User123", // Change this to dynamic user later
            rating: newRating,
            comment: newReview,
          }
        );

        if (response.data.success) {
          fetchReviews(); // Fetch updated reviews
          setNewReview("");
          setNewRating(5);
        }
      } catch (error) {
        console.error("Error adding review:", error);
      }
    }
  };

  const openReviewModal = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReview(null);
  };

  return (
    <div className="mt-20">
      {/* Tab buttons */}
      <div className="flex">
        <b
          onClick={() => setSelectedTab("description")}
          className={`px-5 py-3 text-sm border cursor-pointer  ${
            selectedTab === "description" ? "bg-gray-200" : ""
          }`}>
          Description
        </b>
        <p
          onClick={() => setSelectedTab("reviews")}
          className={`px-5 py-3 text-sm border cursor-pointer ${
            selectedTab === "reviews" ? "bg-gray-200" : ""
          }`}>
          Reviews ({reviews.length})
        </p>
      </div>

      {/* Dynamic Content */}
      <div className="flex flex-col gap-4 px-6 py-6 text-sm text-gray-500 border">
        {selectedTab === "description" ? (
          <p className="whitespace-pre-line">{description}</p>
        ) : (
          <div className="py-4 mt-4">
            {/* Reviews List */}
            <div className="overflow-x-auto">
              <div className="flex space-x-6">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div
                      key={index}
                      className="inline-block w-64 cursor-pointer max-w-[300px] p-4 bg-gray-200 rounded-lg shadow-md"
                      onClick={() => openReviewModal(review)}>
                      <p
                        className="overflow-hidden text-sm text-gray-700 break-words text-ellipsis"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                        {review.comment}
                      </p>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < review.rating
                                ? "text-yellow-500"
                                : "text-gray-400"
                            }>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet.</p>
                )}
              </div>
            </div>

            {/* Add New Review */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Add a New Review</h3>
              <textarea
                className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                placeholder="Write your review..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
              />
              <div className="flex items-center mt-2">
                <span className="mr-3">Select Rating: </span>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`cursor-pointer ${
                      i < newRating ? "text-yellow-500" : "text-gray-400"
                    }`}
                    onClick={() => setNewRating(i + 1)}>
                    ★
                  </span>
                ))}
              </div>
              <button
                className="p-2 mt-4 text-white bg-blue-500 rounded-lg"
                onClick={handleNewReviewSubmit}>
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for displaying the full review */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative p-6 bg-white rounded-lg shadow-lg w-80">
            <h3 className="mb-4 text-lg font-semibold">Full Review</h3>
            <p className="text-sm text-gray-700">{selectedReview?.comment}</p>
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={
                    i < selectedReview?.rating
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }>
                  ★
                </span>
              ))}
            </div>
            <button
              onClick={closeModal}
              className="absolute top-0 right-0 p-2 transition border-2 cursor-pointer rounded-tr-md hover:border-red-500 hover:text-white hover:bg-red-500 rounded-bl-md">
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescRev;
