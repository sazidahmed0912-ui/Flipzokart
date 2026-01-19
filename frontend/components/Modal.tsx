import React from "react";

const Modal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <button
          onClick={onClose}
          className="float-right text-gray-700 hover:text-gray-900"
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
