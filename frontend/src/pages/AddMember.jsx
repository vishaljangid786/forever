import { useContext, useEffect, useState } from "react";
import { set, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const AddMember = ({ userData }) => {
  const { token, setToken } = useContext(ShopContext);
  const [step, setStep] = useState(1);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [progress, setProgress] = useState(33);
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [refferalapply, setRefferalapply] = useState(false); // state
  const [timer, setTimer] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (userData?.referralCode) {
      setValue("referralCode", userData?.referralCode);
    }
  }, [userData, setValue]);

  // Send OTP to Email
  const handleSendOtp = async () => {
    const email = watch("email");
    if (!email) return toast.error("Email is required");

    try {
      const response = await axios.post(`${backendUrl}/api/user/sendOtp`, {
        email,
      });
      if (response.data.success) {
        setOtpSent(true);
        setTimer(60);
        toast.success("OTP sent successfully!");
        setLoading(true);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const email = watch("email");
    if (!otp) return toast.error("Please enter the OTP");

    try {
      const response = await axios.post(`${backendUrl}/api/user/verifyOtp`, {
        email,
        otp,
      });
      if (response.data.success) {
        setOtpVerified(true);
        toast.success("OTP verified successfully!");
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error verifying OTP");
    }
  };

  // Submit Form Data
  const onSubmit = async (data) => {
    if (!otpVerified) return toast.error("Please verify OTP before submitting");

    try {
      const formData = {
        name: data.name,
        email: data.email,
        password: data.password,
        shopName: data.shopName || "",
        phone: data.phone,
        option: data.option,
        referralCode: data.referralCode || "",
        address: {
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          country: data.address?.country || "",
          zipcode: data.address?.zipcode || "",
        },
      };

      const response = await axios.post(
        `${backendUrl}/api/user/register`,
        formData
      );
      if (response.data.success) {
        toast.success("Registration successful!")

        // Reset internal states
        setStep(1);
        setProgress(33);
        setOtp("");
        setOtpSent(false);
        setOtpVerified(false);
        setValid(false);
        setRefferalapply(false);
        setShowPassword(false);
        setShowConfirmPassword(false);

        // Optional: Navigate to login or somewhere else
        // navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  // Handle Next Button
  const handleNext = () => {
    if (step === 1) {
      if (!watch("name")) return toast.error("Name is required");
      if (!watch("email")) return toast.error("Email is required");
      if (!watch("referralCode"))
        return toast.error("Referral Code is required");
      if (!otpVerified)
        return toast.error("Please verify OTP before proceeding");
    }

    if (step === 2) {
      if (!watch("password")) return toast.error("Password is required");
      if (watch("password") !== watch("confirmPassword"))
        return toast.error("Passwords do not match");
    }

    setStep(step + 1);
    setProgress(progress + 33);
  };

  // Handle Back Button
  const handleBack = () => {
    setStep(step - 1);
    setProgress(progress - 33);
  };

  const handleReferralApply = async (e) => {
    e.preventDefault();
    try {
      const code = watch("referralCode");
      if (code === "SELLER@SELLER") {
        setRefferalapply(true); // This will trigger showing Shop Name
      } else {
        setRefferalapply(false); // Optional: Reset if it's not seller code
      }

      const response = await axios.post(
        `${backendUrl}/api/user/check-referral`,
        {
          referralCode: code,
        }
      );

      if (response.data.success) {
        toast.success("Referral applied successfully!");
        setValid(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error applying referral");
    }
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpSent) {
      setOtpSent(false);
    }

    return () => clearInterval(interval); // Cleanup
  }, [timer, otpSent]);

  return (
    <div className="max-w-lg p-6 mx-auto mt-10 bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Signup Form</h2>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="bg-black h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1 */}
        {step === 1 && (
          <div>
            <label className="block">Full Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full p-2 mt-1 border rounded"
              placeholder="Enter Your Full Name"
            />
            {errors.name && <p className="text-red-500">Name is required</p>}
            <label className="block mt-4">Referral Code</label>
            <div className="flex gap-2 p-2 border rounded">
              <input
                {...register("referralCode")}
                className="w-full outline-none"
                placeholder="Enter Referral Code"
                required
                readOnly={!!userData?.referralCode}
              />
              {valid === false && (
                <button
                  className="text-blue-500"
                  onClick={(e) => handleReferralApply(e)}>
                  Apply
                </button>
              )}
              {valid === true && (
                <div className="flex items-center gap-2 text-sm">
                  <button className="text-blue-500">Applied</button>
                  <p className="cursor-pointer" onClick={() => setValid(false)}>
                    ❌
                  </p>
                </div>
              )}
            </div>
            {errors.referralCode && (
              <p className="text-red-500">Refferal Code is Required</p>
            )}

            <label className="block mt-4">Option</label>
            <select
              {...register("option", { required: true })}
              className="w-full p-2 mt-1 border rounded outline-none">
              <option value="">Select an option</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
            {errors.option && (
              <p className="text-red-500">Option is required</p>
            )}

            {refferalapply && (
              <div>
                <label className="block mt-4">Shop Name</label>
                <input
                  {...register("shopName", { required: true })}
                  className="w-full p-2 mt-1 border rounded"
                  placeholder="Enter your shop name"
                />
                {errors.shopName && (
                  <p className="text-red-500">Shop Name is required</p>
                )}
              </div>
            )}

            <label className="block mt-4">Email</label>
            <div className="flex">
              <input
                {...register("email", { required: true })}
                className="w-full p-2 mt-1 border rounded"
                placeholder="Enter your email"
                type="email"
                readOnly={otpSent}
              />
              <button
                type="button"
                className={`w-full max-w-[100px] p-2 ml-2 text-white rounded ${
                  otpSent ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
                }`}
                onClick={handleSendOtp}
                disabled={otpSent}>
                {otpSent ? `Sent (${timer}s)` : "Send OTP"}
              </button>
            </div>
            {errors.email && <p className="text-red-500">Email is required</p>}
            <p className="mt-2 text-sm text-gray-500">
              Check all inboxes and spam folder also for Otp, if not found.
            </p>

            {otpSent && (
              <>
                <label className="block mt-4">Enter OTP</label>
                <div className="flex">
                  <input
                    className="w-full p-2 mt-1 border rounded"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={otpVerified}
                  />
                  <button
                    type="button"
                    className={`p-2 ml-2 text-white rounded ${
                      otpVerified
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-500"
                    }`}
                    onClick={handleVerifyOtp}
                    disabled={otpVerified}>
                    {otpVerified ? "Verified" : "Verify"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <label className="block mt-4">Password</label>
            <div className="relative">
              <input
                {...register("password", { required: true })}
                className="w-full p-2 pr-10 mt-1 border rounded"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
              />
              <button
                type="button"
                className="absolute text-gray-600 right-3 top-4"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <i className="fa-solid fa-eye-slash"></i>
                ) : (
                  <i className="fa-solid fa-eye"></i>
                )}
              </button>
            </div>

            {/* Confirm Password Field */}
            <label className="block mt-4">Confirm Password</label>
            <div className="relative">
              <input
                {...register("confirmPassword", { required: true })}
                className="w-full p-2 pr-10 mt-1 border rounded"
                placeholder="Confirm your password"
                type={showConfirmPassword ? "text" : "password"}
              />
              <button
                type="button"
                className="absolute text-gray-600 right-3 top-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <i className="fa-solid fa-eye-slash"></i>
                ) : (
                  <i className="fa-solid fa-eye"></i>
                )}
              </button>
            </div>
            <label className="block mt-4">Phone Number</label>
            <input
              {...register("phone", { required: true })}
              className="w-full p-2 mt-1 border rounded"
              placeholder="Phone Number"
              type="number"
            />
          </div>
        )}

        {/* Step 4 - Address */}
        {step === 3 && (
          <div>
            <label className="block">Street</label>
            <input
              {...register("address.street", { required: true })}
              className="w-full p-2 mt-1 border rounded"
              placeholder="Enter your street"
            />
            {errors.address?.street && (
              <p className="text-red-500">Street is required</p>
            )}

            <label className="block mt-4">City</label>
            <input
              {...register("address.city", { required: true })}
              className="w-full p-2 mt-1 border rounded"
              placeholder="Enter your city"
            />
            {errors.address?.city && (
              <p className="text-red-500">City is required</p>
            )}

            <label className="block mt-4">State</label>
            <input
              {...register("address.state", { required: true })}
              className="w-full p-2 mt-1 border rounded"
              placeholder="Enter your state"
            />
            {errors.address?.state && (
              <p className="text-red-500">State is required</p>
            )}

            <label className="block mt-4">Country</label>
            <input
              {...register("address.country", { required: true })}
              className="w-full p-2 mt-1 border rounded"
              placeholder="Enter your country"
            />
            {errors.address?.country && (
              <p className="text-red-500">Country is required</p>
            )}

            <label className="block mt-4">Zipcode</label>
            <input
              {...register("address.zipcode", { required: true })}
              className="w-full p-2 mt-1 border rounded"
              placeholder="Enter your zipcode"
              type="number"
            />
            {errors.address?.zipcode && (
              <p className="text-red-500">Zipcode is required</p>
            )}
            <div className="flex items-start mt-4">
              <input
                type="checkbox"
                {...register("terms", { required: true })}
                className="mt-1 mr-2"
              />
              <label className="text-sm">
                I agree to the{" "}
                <a href="/terms" className="text-blue-500 underline">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="text-blue-500 underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-500">
                You must accept the terms & conditions
              </p>
            )}
          </div>
        )}
        <Link to="/login" className="w-full text-sm text-right underline">
          Login Instead
        </Link>
        {/* Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-10 py-2 bg-gray-300">
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-10 py-2 text-white bg-black">
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 text-white bg-green-500 rounded">
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddMember;
