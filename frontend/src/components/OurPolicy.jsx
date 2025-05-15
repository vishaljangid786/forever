import React from "react";
import { assets } from "../assets/assets";

const OurPolicy = () => {
  return (
    <div className="flex flex-col justify-around gap-12 pt-20 text-xs text-center text-gray-700 sm:flex-row sm:gap-2 sm:text-sm md:text-base">
      {/* Fast Shipping */}
      <div>
        <img
          src={assets.shipped}
          className="w-12 m-auto mb-5"
          alt="Fast Shipping"
        />
        <p className="font-semibold">Fast & Reliable Shipping</p>
        <p className="text-gray-400">
          We ensure quick and secure delivery to your doorstep.
        </p>
      </div>

      {/* Secure Payments */}
      <div>
        <img
          src={assets.payment}
          className="w-12 m-auto mb-5"
          alt="Secure Payments"
        />
        <p className="font-semibold">Secure Payment</p>
        <p className="text-gray-400">
          100% secure payment options for safe transactions.
        </p>
      </div>

      {/* Customer Support */}
      <div>
        <img
          src={assets.support_img}
          className="w-12 m-auto mb-5"
          alt="Customer Support"
        />
        <p className="font-semibold">Best Customer Support</p>
        <p className="text-gray-400">
          We provide 24/7 customer support for all your queries.
        </p>
      </div>
    </div>
  );
};

export default OurPolicy;
