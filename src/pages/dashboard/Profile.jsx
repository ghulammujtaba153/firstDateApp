import React from 'react';
import { 
  FaUser, 
  FaRuler, 
  FaBirthdayCake, 
  FaBriefcase, 
  FaGraduationCap, 
  FaMapMarkerAlt, 
  FaInfoCircle, 
  FaHeartbeat 
} from 'react-icons/fa';


const hobbies =[
  "Traveling", "Cooking", "Reading", "Hiking", "Photography", "Music", "Dancing", "Gaming"
]

const health = [
  "Non-smoker", "No drugs", "No pets", "No kids", "Vegetarian"
]


const body= [
  "Slim", "Athletic", "Average", "Curvy", "Muscular"
]
const Profile = () => {
  return (
    <div className=" bg-white rounded-3xl shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-blue-50 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">My Profile</h1>
        <button className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
          Edit Profile
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face" 
                alt="Profile" 
                className="w-full aspect-square rounded-2xl object-cover shadow-lg"
              />
              <div className="absolute bottom-4 left-4 bg-white rounded-lg px-2 py-1 shadow-md">
                <span className="text-xs font-medium text-gray-600">255 x 256</span>
              </div>
            </div>
            
            
          </div>

          <div className="mt-6 space-y-4">
              <div className="flex items-center text-gray-600">
                <FaUser className="w-4 h-4 mr-2" />
                <span className="text-sm">Women</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaRuler className="w-4 h-4 mr-2 " />
                <span className="text-sm">5'6 ft 5 in</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaBriefcase className="w-4 h-4 mr-2" />
                <span className="text-sm">Model at Creative Mask Agency</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaGraduationCap className="w-4 h-4 mr-2" />
                <span className="text-sm">University of Arts and Design</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                <span className="text-sm">Lives in New York</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaBirthdayCake className="w-4 h-4 mr-2 " />
                <span className="text-sm">3 December, 1999</span>
              </div>
            </div>

          {/* Middle Column - About Me */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">About Me</h3>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <FaInfoCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                I'm an ambitious, career-oriented person with an impressive portfolio...
              </p>
            </div>


            {/* Body Type */}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Body Type</h3>
              <div className="flex flex-wrap gap-2">
                {body.map((item) => (
                  <span
                    key={item}
                    className="px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Health Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Health Info</h3>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <FaInfoCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {health.map((item) => (
                  <span
                    key={item}
                    className="px-4 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Hobbies */}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {hobbies.map((item) => (
                  <span
                    key={item}
                    className="px-4 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium border border-pink-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
