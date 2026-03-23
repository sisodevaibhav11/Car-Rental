import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"></div>
    </div>
  );
};

export default Loader;
