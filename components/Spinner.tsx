
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-400"></div>
        <p className="text-teal-300 font-semibold">AI is analyzing...</p>
    </div>
  );
};

export default Spinner;
