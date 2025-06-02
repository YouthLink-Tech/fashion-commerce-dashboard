import React, { useState } from 'react';
import { FaUserPlus } from "react-icons/fa6";
import CartDrawer from './cart/CartDrawer';

const EnrollmentForm = ({ refetch }) => {

  const [isGrantAccessOpen, setIsGrantAccessOpen] = useState(false);

  return (
    <div className='relative'>

      {/* Grant access button */}
      <li
        className="flex cursor-pointer items-center"
        onClick={() => {
          setIsGrantAccessOpen(true);
        }}
      >
        <button
          type='button'
          className="text-blue-600 font-bold flex items-center gap-2 hover:bg-blue-50 rounded-lg px-3 py-1.5 hover:text-blue-700"
        >
          Grant access <FaUserPlus size={18} />
        </button>
      </li>
      {/* Grant access drawer */}
      <CartDrawer
        isGrantAccessOpen={isGrantAccessOpen}
        setIsGrantAccessOpen={setIsGrantAccessOpen}
        refetch={refetch}
      />

    </div>
  );
};

export default EnrollmentForm;