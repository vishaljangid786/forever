import React, { useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import emailjs from "emailjs-com";

const Contact = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const serviceID = import.meta.env.SERVICE_ID;
  const templateID = import.meta.env.TEMPLATE_ID;
  const userID = import.meta.env.USER_ID;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }

    setLoading(true);

    emailjs.send(serviceID, templateID, { user_email: email }, userID).then(
      (response) => {
        setLoading(false);
        setMessage("Thank you for subscribing! We'll keep you updated.");
        setEmail("");
      },
      (error) => {
        setLoading(false);
        setMessage("Something went wrong. Please try again.");
      }
    );
  };

  return (
    <>
      <div>
        <div className="pt-10 text-2xl text-center border-t">
          <Title text1={"CONTACT"} text2={"US"} />
        </div>

        <div className="flex flex-col justify-center gap-10 my-10 md:flex-row mb-28">
          <img
            className="w-full md:max-w-[480px]"
            src={assets.contact_img}
            alt="Contact"
          />
          <div className="flex flex-col items-start justify-center gap-6">
            <p className="text-xl font-semibold text-gray-600">Our Store</p>
            <p className="text-gray-500">
              Sai filling petrol pump ke pass, kapurawala mod,<br /> muhana sanganer
              jaipur rajasthan 302029
            </p>
            <p className="text-gray-500">
              Tel: 9462365447 <br /> Email: vjallinmarketing@gmail.com
            </p>
          </div>
          {/* Newsletter Section */}
          <div className="flex items-center justify-center gap-4">
            <form
              onSubmit={handleEmailSubmit}
              className="flex flex-col items-center gap-4">
              <p className="text-xl font-semibold text-gray-600">
                Stay Updated
              </p>
              <p className="text-gray-500">
                Enter your email to receive updates.
              </p>
              <input
                type="email"
                name="user_email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 text-sm text-white transition-all duration-500 bg-black hover:bg-gray-700"
                disabled={loading}>
                {loading ? "Submitting..." : "Subscribe Now"}
              </button>
            </form>
            {message && (
              <p
                className={`mt-4 text-sm ${
                  message.includes("Thank you")
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        <h2 className="my-4 text-2xl font-bold">Our Location</h2>
        <div className="w-full">
          <iframe
            title="Shop Location"
            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3561.7055184323926!2d75.71935227543511!3d26.78565537672312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjbCsDQ3JzA4LjQiTiA3NcKwNDMnMTguOSJF!5e0!3m2!1sen!2sin!4v1742805044104!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </>
  );
};

export default Contact;
