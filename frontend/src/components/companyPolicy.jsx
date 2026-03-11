import React from 'react';

const CompanyPolicy = () => {
  return (
    <div className="min-h-screen">
      <div className="mx-auto bg-white p-10 md:p-20 ">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Company Policy</h1>
        
        <p className="text-lg text-gray-600 mb-6">
          At our company, we are committed to maintaining a professional and ethical business environment. Please review our company policies to understand our standards and expectations.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-700 mt-8">1. Code of Conduct</h2>
        <p className="text-lg text-gray-600 mb-6">All employees are expected to uphold honesty, integrity, and professionalism in all business dealings.</p>
        
        <h2 className="text-2xl font-semibold text-gray-700 mt-8">2. Workplace Ethics</h2>
        <p className="text-lg text-gray-600 mb-6">We maintain a respectful and inclusive work environment, free from discrimination or harassment of any kind.</p>
        
        <h2 className="text-2xl font-semibold text-gray-700 mt-8">3. Confidentiality Policy</h2>
        <p className="text-lg text-gray-600 mb-6">Employees must not disclose sensitive company information to unauthorized parties.</p>
        
        <h2 className="text-2xl font-semibold text-gray-700 mt-8">4. Compliance & Legal Obligations</h2>
        <p className="text-lg text-gray-600 mb-6">All employees must adhere to local laws and company policies to ensure compliance with regulatory requirements.</p>
        
        <h2 className="text-2xl font-semibold text-gray-700 mt-8">5. Workplace Safety</h2>
        <p className="text-lg text-gray-600 mb-6">We prioritize employee safety and require compliance with all safety procedures and guidelines.</p>
        
        <div className="mt-10 text-center">
          <p className="text-lg text-gray-600">For any questions regarding our company policies, please contact us at <span className="text-blue-600 font-medium">vjallinmarketing@gmail.com</span>.</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyPolicy;
