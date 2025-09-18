import React from "react";

const EducationSection = () => {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold mb-2">Education level 🎓</h1>
      <p className="text-gray-600 mb-6">
        Share your education details to help us personalize your experience.
      </p>
      </div>

      <div className="flex flex-col gap-4 text-left">
        <div>
          <label className="block text-sm font-bold text-black mb-1">
            Field
          </label>
          <input
            type="text"
            placeholder="e.g. Computer Science"
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1">
            Occupation
          </label>
          <input
            type="text"
            placeholder="e.g. Software Engineer"
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1">
            University
          </label>
          <input
            type="text"
            placeholder="e.g. University of California, Berkeley"
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default EducationSection;
