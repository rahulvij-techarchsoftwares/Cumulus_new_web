import { NavLink } from "react-router-dom";
import Allfiles from "../../assets/Allfiles.png";
import blackallfiles from "../../assets/blackallfiles.png";
import logo from "../../assets/logo.png";
import box from "../../assets/Box.png"

const PublicSidebar = () => {
  return (
    <div className="hidden md:flex flex-col min-h-screen w-64 bg-gray-100 p-3 space-y-4 overflow-hidden">
      {/* Logo Section */}
      <div className="mb-4" style={{ width: "25vw" }}>
        <img
          src={logo}
          alt="Cumulus Logo"
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      {/* Navigation Links */}
      <NavLink
        to="/SharedFiles"
        className={({ isActive }) =>
          `flex items-center cursor-pointer p-2 rounded ${
            isActive ? "bg-blue-500 text-white" : "text-[#434A60]"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <img
              src={isActive ? Allfiles : blackallfiles}
              alt="Shared Files Icon"
              className="h-6"
            />
            <h2 className="ml-3 font-semibold">Shared Files</h2>
          </>
        )}
      </NavLink>

      <NavLink
        to="/AboutCumulus"
        className={({ isActive }) =>
          `flex items-center cursor-pointer p-2 rounded ${
            isActive ? "bg-blue-500 text-white" : "text-[#434A60]"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <img
              src={isActive ? Allfiles : blackallfiles}
              alt="Cumulus Info Icon"
              className="h-6"
            />
            <h2 className="ml-3 font-semibold">What is Cumulus</h2>
          </>
        )}
      </NavLink>

      <div className="h-96 w-56">
       <img src={box} />
      </div>

      <div>
      <button className="p-2 px-3 bg-blue-500 text-white rounded-lg">Upgrade to Share</button>
      </div>
    </div>
  );
};

export default PublicSidebar;
