import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { assets } from "@/assets/images/assets";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { backendUrl } from "@/constants/constants";
import { BlurView } from "expo-blur";
import AppInput from "@/components/AppInput";
import { StatusBar } from "expo-status-bar";

export default function SignupScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme, toggleTheme } = useAppTheme();

  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [option, setOption] = useState<"left" | "right" | "">("");
  const [shopName, setShopName] = useState("");
  const [refferalapply, setRefferalapply] = useState(false);
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [addressZipcode, setAddressZipcode] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [validReferral, setValidReferral] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";

  const sendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Email is required");
      return;
    }

    try {
      setSendingOtp(true);

      const response = await axios.post(`${backendUrl}/api/user/sendOtp`, {
        email,
      });

      if (response.data.success) {
        setOtpSent(true);
        setTimer(60);
        Alert.alert("Success", "OTP sent successfully!");
      } else {
        Alert.alert("Error", response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Error sending OTP",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter OTP");
      return;
    }

    try {
      setVerifyingOtp(true);

      const response = await axios.post(`${backendUrl}/api/user/verifyOtp`, {
        email,
        otp,
      });

      if (response.data.success) {
        setOtpVerified(true);
        Alert.alert("Success", "OTP verified successfully!");
      } else {
        Alert.alert("Error", response.data.message || "Invalid OTP");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Error verifying OTP",
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpSent) {
      setOtpSent(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, otpSent]);

  const applyReferral = async () => {
    if (!referralCode) {
      Alert.alert("Error", "Referral code is required");
      return;
    }

    try {
      setCheckingReferral(true);

      const response = await axios.post(
        `${backendUrl}/api/user/check-referral`,
        { referralCode },
      );
      console.log(response);

      if (referralCode === "SELLER@SELLER") {
        setRefferalapply(true);
      } else {
        setRefferalapply(false);
      }

      if (response.data.success) {
        setValidReferral(true);
        Alert.alert("Success", "Referral applied successfully!");
      } else {
        setValidReferral(false);
        Alert.alert("Error", response.data.message || "Invalid referral");
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Error applying referral",
      );
    } finally {
      setCheckingReferral(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name) {
        Alert.alert("Error", "Name is required");
        return;
      }
      if (!email) {
        Alert.alert("Error", "Email is required");
        return;
      }
      if (!referralCode) {
        Alert.alert("Error", "Referral code is required");
        return;
      }
      if (!otpVerified) {
        Alert.alert("Error", "Please verify OTP before proceeding");
        return;
      }
    }

    if (step === 2) {
      if (!password) {
        Alert.alert("Error", "Password is required");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }
      if (!phone) {
        Alert.alert("Error", "Phone is required");
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
      setProgress(progress + 33);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setProgress(progress - 33);
    }
  };

  const onSubmit = async () => {
    if (
      !addressStreet ||
      !addressCity ||
      !addressState ||
      !addressCountry ||
      !addressZipcode
    ) {
      Alert.alert("Error", "All address fields are required");
      return;
    }

    if (!acceptedTerms) {
      Alert.alert("Error", "You must accept terms & conditions");
      return;
    }

    try {
      setSubmitting(true);
      const formData = {
        name,
        email,
        password,
        shopName: refferalapply ? shopName : "",
        phone,
        option,
        referralCode,
        address: {
          street: addressStreet,
          city: addressCity,
          state: addressState,
          country: addressCountry,
          zipcode: addressZipcode,
        },
      };

      const response = await axios.post(
        `${backendUrl}/api/user/register`,
        formData,
      );

      if (response.data.success) {
        await login(response.data.token);
        Alert.alert("Success", "Registration successful!");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", response.data.message || "Registration failed");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Registration failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const textClassBase = isDark ? "text-white" : "text-slate-900";
  const subTextClass = isDark ? "text-gray-300" : "text-slate-600";
  const inputClass = isDark
    ? "bg-white/20 text-white rounded-2xl px-4 py-4 mb-4"
    : "bg-slate-100 text-slate-900 rounded-2xl px-4 py-4 mb-4";
  const primaryBtnBg = isDark ? "bg-white" : "bg-slate-900";
  const primaryBtnText = isDark ? "text-black" : "text-white";

  const secondaryBtnBg = isDark ? "bg-white/20" : "bg-slate-200";
  const secondaryBtnText = isDark ? "text-white" : "text-slate-900";

  const linkText = isDark ? "text-gray-300" : "text-slate-600";

  return (
    <View
      className={`flex-1 px-6 pt-16 ${
        isDark ? "bg-slate-950" : "bg-slate-100"
      }`}
    >
      {/* Theme Toggle */}
      <View className="absolute top-14 right-6">
        <Pressable
          onPress={toggleTheme}
          className={`px-4 py-2 rounded-full ${
            isDark ? "bg-slate-800" : "bg-white"
          }`}
        >
          <Text className={isDark ? "text-white" : "text-slate-900"}>
            {isDark ? "☀️" : "🌙"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          <View
            className={`p-8 rounded-3xl ${
              isDark ? "bg-slate-900" : "bg-white"
            }`}
          >
            {/* Title */}
            <Text
              className={`text-2xl font-bold text-center mb-6 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Create Account
            </Text>

            {/* Progress Bar */}
            <View className="w-full h-2 bg-slate-300 rounded-full mb-6 overflow-hidden">
              <View
                className={`h-2 ${isDark ? "bg-white" : "bg-slate-900"}`}
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </View>

            {/* ---------------- STEP 1 ---------------- */}
            {step === 1 && (
              <>
                <AppInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Full Name"
                  isDark={isDark}
                />
                <View className="mt-4" />
                <AppInput
                  value={referralCode}
                  onChangeText={setReferralCode}
                  placeholder="Referral Code"
                  isDark={isDark}
                  rightElement={
                    <Pressable
                      onPress={applyReferral}
                      disabled={checkingReferral}
                      className="px-3 py-1 rounded-lg bg-slate-700"
                    >
                      {checkingReferral ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text className="text-white text-xs font-semibold">
                          Apply
                        </Text>
                      )}
                    </Pressable>
                  }
                />

                <View className="mt-4" />

                {refferalapply && (
                  <>
                    <AppInput
                      value={shopName}
                      onChangeText={setShopName}
                      placeholder="Shop Name"
                      isDark={isDark}
                    />
                    <View className="mt-4" />
                  </>
                )}

                <AppInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  isDark={isDark}
                  rightElement={
                    <Pressable
                      onPress={timer === 0 ? sendOtp : undefined}
                      disabled={sendingOtp || timer > 0}
                      className="px-3 py-1 rounded-lg bg-slate-700"
                    >
                      {sendingOtp ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text className="text-white text-xs font-semibold">
                          {timer > 0 ? `${timer}s` : "Send"}
                        </Text>
                      )}
                    </Pressable>
                  }
                />
                <View className="mt-4" />

                {otpSent && (
                  <>
                    <AppInput
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="Enter OTP"
                      isDark={isDark}
                      rightElement={
                        <Pressable
                          onPress={verifyOtp}
                          disabled={verifyingOtp}
                          className="px-3 py-1 rounded-lg bg-slate-700"
                        >
                          {verifyingOtp ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text className="text-white text-xs font-semibold">
                              Verify
                            </Text>
                          )}
                        </Pressable>
                      }
                    />

                    <View className="mt-4" />
                  </>
                )}
              </>
            )}

            {/* ---------------- STEP 2 ---------------- */}
            {step === 2 && (
              <>
                <AppInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  secureTextEntry
                  isDark={isDark}
                />
                <View className="mt-4" />

                <AppInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  secureTextEntry
                  isDark={isDark}
                />
                <View className="mt-4" />

                <AppInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone Number"
                  isDark={isDark}
                />
              </>
            )}

            {/* ---------------- STEP 3 ---------------- */}
            {step === 3 && (
              <>
                <AppInput
                  value={addressStreet}
                  onChangeText={setAddressStreet}
                  placeholder="Street"
                  isDark={isDark}
                />
                <View className="mt-4" />

                <AppInput
                  value={addressCity}
                  onChangeText={setAddressCity}
                  placeholder="City"
                  isDark={isDark}
                />
                <View className="mt-4" />

                <AppInput
                  value={addressState}
                  onChangeText={setAddressState}
                  placeholder="State"
                  isDark={isDark}
                />
                <View className="mt-4" />

                <AppInput
                  value={addressCountry}
                  onChangeText={setAddressCountry}
                  placeholder="Country"
                  isDark={isDark}
                />
                <View className="mt-4" />

                <AppInput
                  value={addressZipcode}
                  onChangeText={setAddressZipcode}
                  placeholder="Zipcode"
                  isDark={isDark}
                />
              </>
            )}

            {/* Buttons */}
            <View className="flex-row justify-between mt-8">
              {step > 1 ? (
                <Pressable
                  onPress={handleBack}
                  className="px-6 py-3 rounded-2xl bg-slate-600"
                >
                  <Text className="text-white font-semibold">Back</Text>
                </Pressable>
              ) : (
                <View />
              )}

              {step < 3 ? (
                <Pressable
                  onPress={handleNext}
                  className={`px-6 py-3 rounded-2xl ${
                    isDark ? "bg-white" : "bg-slate-900"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      isDark ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Next
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={onSubmit}
                  className={`px-6 py-3 rounded-2xl ${
                    isDark ? "bg-white" : "bg-slate-900"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      isDark ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Submit
                  </Text>
                </Pressable>
              )}
            </View>

            {/* login */}
            <View className="flex-row items-center mt-8 justify-center">
              <Text className={isDark ? "text-gray-300" : "text-slate-700"}>
                Already have an account?
              </Text>

              <Pressable onPress={() => router.push("/(auth)/login")}>
                <Text className="text-blue-600 underline ml-1">Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
