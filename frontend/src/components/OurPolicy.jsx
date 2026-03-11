import React from "react";
import { assets } from "../assets/assets";

const OurPolicy = () => {
  const policies = [
    {
      icon: assets.shipped,
      title: "Fast & Reliable Shipping",
      description: "We ensure quick and secure delivery to your doorstep within 3-5 business days.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: assets.payment,
      title: "Secure Payment",
      description: "100% encrypted and secure payment options with multiple payment methods.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: assets.support_img,
      title: "24/7 Customer Support",
      description: "Expert support team available round the clock to help with any queries.",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white mb-3">
          Why Choose Us
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
          We're committed to providing you with the best shopping experience with world-class service.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
        {policies.map((policy, index) => (
          <div
            key={index}
            className="group card-base overflow-hidden hover:shadow-lg-alt transition-all duration-300 border-0"
          >
            {/* Top Colored Bar */}
            <div className={`h-1 bg-gradient-to-r ${policy.color}`}></div>

            <div className="p-8 text-center">
              {/* Icon Container */}
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${policy.color} p-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <img
                  src={policy.icon}
                  className="w-full h-full object-contain brightness-0 invert"
                  alt={policy.title}
                />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                {policy.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {policy.description}
              </p>

              {/* Decorative Line */}
              <div className={`h-1 w-12 bg-gradient-to-r ${policy.color} rounded-full mx-auto mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurPolicy;
