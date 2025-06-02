import React from 'react';

const AccessVerificationFailed = ({ errorMessage }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 min-h-screen bg-gray-50">
      <h1>{errorMessage === "You have already set up your account." ? "" : "Access Verification Failed"}</h1>
      <p className='text-lg'>{errorMessage}</p> {/* Show error message if token is invalid or expired */}
    </div>
  );
};

export default AccessVerificationFailed;