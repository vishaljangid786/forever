import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const DescRev = ({ description, productId, setReviews, reviews, setAverageRating }) => {
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
          toast.success("Review added successfully!");
        }
      } catch (error) {
        console.error("Error adding review:", error);
        toast.error("Failed to add review");
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
    <div className="mt-20 mb-10">
      {/* Tab buttons */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setSelectedTab("description")}
          className={`px-6 py-4 text-sm font-semibold transition-all duration-300 border-b-2 ${
            selectedTab === "description"
              ? "border-rose-500 text-rose-600 dark:text-rose-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}>
          Description
        </button>
        <button
          onClick={() => setSelectedTab("reviews")}
          className={`px-6 py-4 text-sm font-semibold transition-all duration-300 border-b-2 ${
            selectedTab === "reviews"
              ? "border-rose-500 text-rose-600 dark:text-rose-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}>
          Reviews ({reviews.length})
        </button>
      </div>

      {/* Dynamic Content */}
      <div className="flex flex-col gap-4 px-6 py-8 min-h-96 bg-white dark:bg-slate-800 rounded-b-lg border-l border-r border-b border-slate-200 dark:border-slate-700">
        {selectedTab === "description" ? (
          <div>
            <p className="text-base text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {description}
            </p>
          </div>
        ) : (
          <div className="py-4">
            {/* Reviews List */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Customer Reviews
              </h3>
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4">
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <div
                        key={index}
                        onClick={() => openReviewModal(review)}
                        className="flex-shrink-0 w-72 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-200 dark:border-slate-600 hover:border-rose-400 dark:hover:border-rose-500">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < review.rating
                                    ? "text-yellow-400 text-lg"
                                    : "text-slate-300 dark:text-slate-500 text-lg"
                                }>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          {review.comment}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                          By {review.user}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-8 text-center">
                      <p className="text-slate-500 dark:text-slate-400 text-base">
                        No reviews yet. Be the first to review!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Add New Review */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Write Your Review
              </h3>
              <textarea
                className="w-full p-4 mb-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 transition-all duration-300"
                placeholder="Share your experience with this product..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                rows="4"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Rating:
                  </span>
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewRating(i + 1)}
                        className={`text-2xl transition-all duration-200 transform hover:scale-110 ${
                          i < newRating
                            ? "text-yellow-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}>
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {newRating} of 5
                  </span>
                </div>
              </div>

              <button
                onClick={handleNewReviewSubmit}
                disabled={!newReview.trim()}
                className={`w-full sm:w-auto px-8 py-3 font-semibold rounded-lg transition-all duration-300 transform ${
                  newReview.trim()
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 text-white hover:shadow-lg hover:scale-105 active:scale-95"
                    : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                }`}>
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for displaying the full review */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
          <div className="relative w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-4 pr-8">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Review by {selectedReview?.user}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < selectedReview?.rating
                        ? "text-yellow-400 text-lg"
                        : "text-slate-300 dark:text-slate-600 text-lg"
                    }>
                    ★
                  </span>
                ))}
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                  {new Date(selectedReview?.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Review Text */}
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              {selectedReview?.comment}
            </p>

            {/* Footer */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescRev;
