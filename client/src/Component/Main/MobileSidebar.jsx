import { useState, useEffect } from "react";
import {
  Folder,
  Plus,
  Check,
  Mic,
  CircleArrowUp,
  Users,
  CircleAlertIcon,
  User,
  Camera,
  EllipsisVertical,
  Menu,
  X,
  LogOut,
} from "lucide-react";
// import logo from "../../assets/logo.png";
import DesignerPopup from "../Main/Designeepopup";
import usePopupStore from "../../store/DesigneeStore";
import mobilelogo from "../../assets/mobilelogo.png"
import Allfiles from "../../assets/Allfiles.png"
import blackallfiles from "../../assets/blackallfiles.png"
import Cookies from 'js-cookie';
import FolderNotch from "../../assets/FolderNotch.png"
import WhiteFolderNotch from "../../assets/WhiteFolderNotch.png"
import Microphone from "../../assets/Microphone.png"
import aftertlife from "../../assets/affterlife.png"
import whiteemic from "../../assets/whitemic.png"
import axios from "axios";

import {
  Link,
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { API_URL } from "../utils/Apiconfig";
import fetchUserData from "./fetchUserData";
const MobileSidebar = ({ onFolderSelect }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [folders, setFolders] = useState([]);
  const location = useLocation(); // Access current URL for routing
  const [deletebutton, setDeletebutton] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(null); // Added for feedback messages
  // const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [viewAllFolders, setViewAllFolders] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // For handling errors
  const openPopup = usePopupStore((state) => state.openPopup);
  const [showDesignerPopup, setShowDesignerPopup] = useState(false);
  const [designeeName, setDesigneeName] = useState("");
  const [designeePhone, setDesigneePhone] = useState("");
  const [designeeEmail, setDesigneeEmail] = useState("");
  const [newDesigner, setNewDesigner] = useState("");
  const [showDesignerInput, setShowDesignerInput] = useState(false);
  // const [viewAllDesigners, setViewAllDesigners] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [viewAllDesigners, setViewAllDesigners] = useState(false); // Toggles "View All" and "View Less"
  const [designers, setDesigners] = useState([]); // List of designees
  // const [showDesignerPopup, setShowDesignerPopup] = useState(false); // Toggles the popup visibility
  // const [designeeName, setDesigneeName] = useState(""); // Holds the input for designee name
  // const [designeePhone, setDesigneePhone] = useState(""); // Holds the input for designee phone number
  // const [designeeEmail, setDesigneeEmail] = useState(""); // Holds the input for designee email
  const [deletebutton2, setDeletebutton2] = useState(false);
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(() => {
    try {
      const storedValue = localStorage.getItem("openMenuId");
      return storedValue ? JSON.parse(storedValue) : null;
    } catch (error) {
      console.error("Failed to parse openMenuId from localStorage:", error);
      return null;
    }
  });

  const toggleEllipses = (folderId) => {
    const newOpenMenuId = openMenuId === folderId ? null : folderId;
    setOpenMenuId(newOpenMenuId);
    localStorage.setItem("openMenuId", JSON.stringify(newOpenMenuId));
  };
  const [userData, setUserData] = useState(null);
  const [isMembershipActive, setIsMembershipActive] = useState(false);
  const [membershipDetail, setMembershipDetail] = useState(null);
  const [deletebutton1, setDeletebutton1] = useState(false);

  const handleClickhelp = () => {
    setIsOpen(false); // Close the menu or modal
    navigate('/help'); // Navigate to the desired route
  };

  const [editFolderName, setEditFolderName] = useState(""); // State for folder name being edited
  const [editingFolderId, setEditingFolderId] = useState(null); // State to track which folder is being edited
  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchUserData();
        if (!data?.user) {
          throw new Error("Invalid response structure");
        }

        setUserData(data);
        console.log("data", data);
        console.log("data user", data.user);
        setIsMembershipActive(data.user.activeMembership);
        setMembershipDetail(data.user.memberships);
        console.log("details", data.user.membershipDetail);
        console.log("membership", data.user.isMembershipActive);
      } catch (err) {
        setError(err.message || "Failed to fetch user data");
      }
    };
    getUserData();
  }, []);
  // const toggleEllipses = () => {
  //     setIsEllipsesOpen(!isEllipsesOpen);

  // };
  async function logout() {
    try {
      // Retrieve token from local storage
      // const token = Cookies.get("token");
      const token = localStorage.getItem("token");

      // Check if token exists
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      // API endpoint for logout
      const apiUrl = `${API_URL}/api/auth/signout`;

      // Set up the headers with Bearer token
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Make the API call
      const response = await fetch(apiUrl, { method: "POST", headers });

      // Check if logout was successful
      if (!response.ok) {
        throw new Error("Failed to log out. Please try again.");
      }

      // Optionally, clear the token from local storage
      // Cookies.remove("token");
      localStorage.removeItem("token");

      navigate("/Login"); // Redirect to Dashboard
      console.log("Logged out successfully.");
    } catch (error) {
      console.error(error);
    }
  }


  const handleEditFolder = async () => {
    if (!editFolderName) {
      setError("New folder name is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const response = await axios.post(
        `${API_URL}/api/edit-folder-name`,
        {
          folder_id: editingFolderId,
          new_folder_name: editFolderName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message); // Show success message
      setEditingFolderId(null); // Close edit mode
      setEditFolderName(""); // Clear input
      fetchFolders(); // Refresh folder list
    } catch (err) {
      setError("Error updating folder name.");
      console.error(err);
    }
  };
  // Fetch folders from API
  const fetchFolders = async () => {
    setLoading(true);
    try {
      // const token = Cookies.get("token");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
        setDeletebutton1(true);
      }

      const response = await axios.get(`${API_URL}/api/get-folders`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
      });

      // Extract folder names and _id from the response
      const foldersData = response.data.map((folder) => ({
        id: folder._id, // Get _id for folder selection
        name: folder.folder_name,
      }));

      setFolders(foldersData); // Set fetched folders
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching folders.");
      setDeletebutton1(true);
    } finally {
      setLoading(false);
    }
  };

  // Run on component mount
  useEffect(() => {
    fetchFolders();
  }, []);

  // Handle folder selection
  const handleFolderSelect = (folder) => {
    // setSelectedFolder(folder.id); // Set the selected folder's ID
    // console.log(setSelectedFolder);
    if (onFolderSelect) {
      onFolderSelect(folder.id); // Pass the _id of the folder to the parent
    }
  };
  const deleteFile = async (folder) => {
    // const token = Cookies.get("token");
    const token = localStorage.getItem("token");
    const selectedFolder = folder; // Ensure folderId is set correctly

    console.log("Token:", token);
    console.log("Selected Folder ID:", selectedFolder);

    if (!token) {
      setMessage("No token found. Please log in.");
      console.error("Missing token");
      return;
    }

    if (!selectedFolder) {
      setMessage("No folder selected.");
      console.error("Missing folderId");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/delete-folder`,
        { folder_id: selectedFolder },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        fetchFolders();
        setMessage(response.data.message || "Folder deleted successfully.");
      } else {
        setMessage(response.data.message || "Failed to delete the folder.");
        setErrorMessage(
          response.data.message || "Failed to delete the folder."
        );
        setOverlayVisible(true);
      }
      setDeletebutton(false);
    } catch (error) {
      console.error("Error deleting folder:", error?.response?.data || error);
      setErrorMessage(
        error.response?.data?.message ||
        "An error occurred while deleting the folder."
      );
      setOverlayVisible(true);
    }
  };
  const closeOverlay = () => {
    setOverlayVisible(false);
    setErrorMessage("");
  };
  // Add folder
  const handleAddFolder = async () => {
    if (newFolder.trim()) {
      setLoading(true);
      try {
        // const token = Cookies.get("token");
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        const response = await axios.post(
          `${API_URL}/api/create-folder`,
          { folder_name: newFolder },
          {
            headers: {
              Authorization: ` Bearer ${token}`,
            },
          }
        );

        const newFolderData = response.data.folder;
        setFolders([
          ...folders,
          { id: newFolderData._id, name: newFolderData.folder_name },
        ]);
        setNewFolder("");
        setShowFolderInput(false);
      } catch (error) {
        setError(error.response?.data?.message || "Error creating folder.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddDesignee = async () => {
    if (designeeName && designeePhone && designeeEmail) {
      setDesigners([...designers, designeeName]); // Add the new designer to the list
      //setShowDesignerPopup(false); // Close the popup
      console.log("designeeName",designeeName);
      console.log("designeePhone",designeePhone);
      console.log("designeeEmail",designeeEmail);
      setDesigneeName(""); // Reset the input fields
      setDesigneePhone("");
      setDesigneeEmail("");
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/api/designee/add`, {designeeName, designeePhone, designeeEmail},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      alert("Designee added successfully!");
      
      setShowDesignerPopup(false);
    } else {
      alert("Please fill out all fields before inviting a designee.");
    }
  };
  useEffect(() => {
    console.log("Current path:", location.pathname); // Debugging
    if (location.pathname === "/folder/1") {
      console.log("Fetching files for folder 1");
      onFolderSelect(1); // Trigger the function to fetch files for folder 1
    }
  }, [location, onFolderSelect]);




  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if clicked outside sidebar, ellipsis button, and toggle button
      if (
        isOpen &&
        !event.target.closest(".ellipsis") && // Prevent closing when ellipsis is clicked
        !event.target.closest(".toggle-button") // Prevent closing when toggle button is clicked
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);


  return (
    <>
      {/* Menu Icon to Open Sidebar */}
      <div className="md:hidden z-30 ml-2 flex items-center toggle-button">
        <button onClick={() => setIsOpen(true)}>
          <Menu size={32} className="text-gray-700" />
        </button>
      </div>
      {/* <div className="md:hidden z-30 ml-2 flex items-center">
        <button onClick={() => setIsOpen(true)}>
          <Menu size={32} className="text-gray-700" />
        </button>
      </div> */}

      {/* Sidebar */}
      <div
        className={`sidebar z-30 fixed top-0 left-0 w-64 h-full bg-gray-200 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300`}
      >
        {/* <div
        className={`absolute inset-0 z-40 transform transition-all duration-300  ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      > */}
        <div className="flex flex-col w-64 bg-gray-100 p-2 space-y-1 min-h-screen">
          {/* Close Icon */}
          <div className="flex justify-between p-2">

            <div>
              <img
                src={mobilelogo}
                alt="Cumulus Logo"
                className="h-10 w-28"

              // style={{ width: "100vw", height: "30px" }}
              />
            </div>
            <button className="border  w-10 h-9 rounded-lg" onClick={() => setIsOpen(false)}>
              <X size={32} className="ml-1" />
            </button>
          </div>

          {/* Files Section */}
          <div>
            {/* <NavLink
              to="/folder/1"
              className={({ isActive }) =>
                `flex mb-2 cursor-pointer p-2 rounded ${
                  isActive ? "bg-blue-500 text-white" : "text-gray-700"
                }`
              }
              onClick={() => {
                console.log("What is Cumulus clicked, sending folderId = 1");
                onFolderSelect(1);
                setIsOpen(false);
              }}
            >
              <h2 className="ml-3 font-bold">What is Cumulus</h2>
            </NavLink> */}
            {/* <NavLink
              to="/folder/1"
              className={({ isActive }) =>
                `flex mb-2 cursor-pointer border  p-2 rounded ${isActive ? "bg-blue-500 text-white" : "text-[#434A60]"
                }`
              }
              onClick={() => {
                console.log("What is Cumulus clicked, sending folderId = 1");
                onFolderSelect(1);
                setIsOpen(false);

              }}
            >
              <h2 className="ml-3 font-semibold text-sm">What is Cumulus</h2>
            </NavLink> */}
            {/* <NavLink
              to="/folder/0"
              className={({ isActive }) =>
                `flex mb-2 cursor-pointer p-2 rounded ${isActive ? "bg-blue-500 text-white" : "text-gray-700"
                }`
              }
              onClick={() => {
                console.log("All Files clicked, sending folderId = 0");
                onFolderSelect(0);
                setIsOpen(false);
              }}
            >
              <h2 className="ml-3">All Files</h2>
            </NavLink> */}
            <h1 className="font-semibold text-[#667085] mt-2 text-sm">Home</h1>
            <NavLink
              to="/folder/0"
              className={({ isActive }) =>
                `flex  cursor-pointer p-2 rounded ${isActive ? "bg-blue-500 text-white" : "text-[#434A60]"}`
              }
              onClick={() => {
                console.log("All Files clicked, sending folderId = 0");
                onFolderSelect(0);
                setIsOpen(false);
                setOpenMenuId(null);
              }}
            >
              {({ isActive }) => (
                <span className="flex items-center h-6">

                  <img
                    src={isActive ? Allfiles : blackallfiles}
                    alt="All Files"
                    className="h-full"
                  />
                  <h2 className="ml-3 text-sm">All Files</h2>
                </span>
              )}
            </NavLink>

            <h2 className="font-semibold text-[#667085] text-sm mt-2">
              {folders.length} Folders
              {folders.length > 3 && (
                <button
                  onClick={(e) => {
                    setViewAllFolders(!viewAllFolders);
                    setOpenMenuId(null);
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                  }}

                  className="text-blue-500 text-xs px-2 float-right"
                >
                  {viewAllFolders ? "View Less" : "View All"}
                </button>
              )}
            </h2>

            <ul>
              <NavLink
                to="/folder/1"
                className={({ isActive }) =>
                  `py-1 px-2 flex items-center rounded cursor-pointer ${isActive ? "bg-blue-500 text-white" : "text-[#434A60]"}`
                }
                onClick={(e) => {
                  console.log("What is Cumulus clicked, sending folderId = 1");
                  onFolderSelect(1);
                  setOpenMenuId(null);

                }}
              >
                {({ isActive }) => (
                  <span className="flex gap-2">
                    <img
                      src={isActive ? WhiteFolderNotch : FolderNotch} // Use active/inactive images
                      alt="Folder"
                      className="h-6 font-bold"
                    />
                    <h2>Cumulus</h2>
                  </span>
                )}
              </NavLink>

              {(viewAllFolders ? folders : folders.slice(0, 3)).map((folder) => (
                // <NavLink
                //   key={folder.id}
                //   to={`/folder/${folder.id}`}
                //   onClick={(e) => {
                //     if (openMenuId === folder.id) {
                //       e.preventDefault();
                //     } else {
                //       handleFolderSelect(folder);
                //     }
                //   }}
                //   className={({ isActive }) =>
                //     `py-1 px-2 flex items-center rounded cursor-pointer ${isActive && !editingFolderId && openMenuId !== folder.id
                //       ? "bg-blue-500 text-white"
                //       : "text-[#434A60]"
                //     }`
                //   }
                // >
                //   <div className="flex justify-between w-full relative items-center">
                //     {editingFolderId === folder.id ? (
                //       <>
                //         <input
                //           type="text"
                //           value={editFolderName}
                //           onChange={(e) => setEditFolderName(e.target.value)}
                //           placeholder="Enter new folder name"
                //           className="border p-2 rounded w-full mr-2 text-black"
                //         />
                //         <button
                //           className="text-green-500 ml-2"
                //           onClick={(e) => {

                //             handleEditFolder(); // Save action
                //             setEditingFolderId(null); // Exit editing mode
                //             e.preventDefault();
                //             e.stopPropagation();
                //             setIsOpen(true);
                //           }}
                //         >
                //           <Check />
                //         </button>
                //         <button
                //           className="text-red-500 ml-2"
                //           onClick={(e) => {

                //             setEditingFolderId(null); // Cancel editing
                //             setEditFolderName(""); // Reset folder name
                //             e.preventDefault();
                //             e.stopPropagation();
                //             setIsOpen(true);
                //           }}
                //         >
                //           <X />
                //         </button>
                //       </>
                //     ) : (
                //       <>
                //         <span className="flex gap-2 items-center truncate-text">
                //           <img
                //             src={
                //               isActive && !editingFolderId
                //                 ? WhiteFolderNotch
                //                 : FolderNotch
                //             }
                //             alt="Folder"
                //             className="h-6 font-bold"
                //           />
                //           {folder.name}
                //         </span>
                //         <button
                //           onClick={(e) => {
                //             // e.preventDefault();
                //             toggleEllipses(folder.id);
                //             e.preventDefault();
                //             e.stopPropagation();
                //             setIsOpen(true);
                //           }}
                //         >
                //           <EllipsisVertical className="font-thin h-5" />
                //         </button>
                //       </>
                //     )}

                //     {/* Menu Options */}
                //     {openMenuId === folder.id && !editingFolderId && (
                //       <div className="absolute top-full right-0 mt-2 w-32 bg-white shadow-lg rounded-lg text-black z-20">
                //         <button
                //           className="w-full px-4 py-2 text-left hover:bg-gray-100"
                //           onClick={(e) => {
                //             setEditingFolderId(folder.id); // Enter editing mode
                //             setEditFolderName(folder.name);
                //             e.preventDefault();
                //             e.stopPropagation();
                //             setIsOpen(true);
                //           }}
                //         >
                //           Edit
                //         </button>
                //         <button
                //           className="w-full px-4 py-2 text-left hover:bg-gray-100"
                //           onClick={(e) => {
                //             setDeletebutton(true); // Open Delete Confirmation Modal
                //             setSelectedFolder(folder.id); // Set Selected Folder
                //             e.preventDefault();
                //             e.stopPropagation();
                //             setIsOpen(true);
                //           }}
                //         >
                //           Delete
                //         </button>
                //       </div>
                //     )}
                //   </div>
                // </NavLink>
                <NavLink
                  to={`/folder/${folder.id}`}
                  className={({ isActive }) =>
                    `py-1 px-2 flex items-center rounded cursor-pointer ${isActive && !editingFolderId ? "bg-blue-500 text-white" : "text-[#434A60]"
                    }`
                  }
                  onClick={(e) => {
                    if (openMenuId === folder.id) {
                      e.preventDefault();
                    } else {
                      handleFolderSelect(folder);
                    }
                  }}
                >
                  {({ isActive }) => (
                    <div className="flex justify-between w-full relative items-center">
                      {editingFolderId === folder.id ? (
                        <>
                          <input
                            type="text"
                            value={editFolderName}
                            onChange={(e) => setEditFolderName(e.target.value)}
                            placeholder="Enter new folder name"
                            className="border p-2 rounded w-full mr-2 text-black"
                          />
                          <button
                            className="text-green-500 ml-2"
                            onClick={(e) => {

                              handleEditFolder(); // Save action
                              setEditingFolderId(null); // Exit editing mode
                              e.preventDefault();
                              e.stopPropagation();
                              setIsOpen(true);
                            }}
                          >
                            <Check />
                          </button>
                          <button
                            className="text-red-500 ml-2"
                            onClick={(e) => {
                      
                              e.preventDefault();
                              e.stopPropagation();
                              setIsOpen(true);
                              setEditingFolderId(null); // Cancel editing
                              setEditFolderName(""); // Reset folder name
                            }}
                          >
                            <X />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex gap-2 items-center truncate-text">
                            <img
                              src={
                                isActive && !editingFolderId
                                  ? WhiteFolderNotch
                                  : FolderNotch
                              }
                              alt="Folder"
                              className="h-6 font-bold"
                            />
                            {folder.name}
                          </span>
                          <button
                            onClick={(e) => {
                        
                              e.preventDefault();
                              e.stopPropagation();
                              setIsOpen(true);
                              toggleEllipses(folder.id);
                            }}
                          >
                            <EllipsisVertical className="font-thin h-5" />
                          </button>
                        </>
                      )}

                      {/* Menu Options */}
                      {openMenuId === folder.id && !editingFolderId && (
                        <div className="absolute top-full right-0 mt-2 w-32 bg-white shadow-lg rounded-lg text-black z-20">
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                            onClick={(e) => {
                              setEditingFolderId(folder.id); // Enter editing mode
                              setEditFolderName(folder.name);
                              e.preventDefault();
                              e.stopPropagation();
                              setIsOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                            onClick={() => {
                              setDeletebutton(true); // Open Delete Confirmation Modal
                              setSelectedFolder(folder.id); // Set Selected Folder
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </NavLink>

              ))}
            </ul>

            {!showFolderInput && (
              <button
                onClick={(e) => {
                  if (isMembershipActive) {
                    setShowFolderInput(true);
                    setOpenMenuId(null);
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                  } else {
                    setDeletebutton2(true);
                    setOpenMenuId(null);
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                  }
                }}
                className="flex items-center w-full bg-gray-200 py-1 text-black rounded-md mt-1 justify-center border"
              >
                <Plus className="mr-2" />
                Add Folder
              </button>
            )}
            {showFolderInput && (
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  placeholder="New Folder Name"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  className="border p-2 rounded w-full mr-2"
                />
                <button onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(true);
                  handleAddFolder();
                }} className="text-green-500">
                  <Check />
                </button>
                <button
                  onClick={(e) => {
                    setShowFolderInput(false); // Close the input box
                    setNewFolder(""); // Optionally reset the input
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                  }}
                  className="text-red-500"
                >
                  <X />
                </button>
              </div>
            )}
          </div>

          {/* Add other sections here */}

          {/* Designees Section */}
          {/* <div className="">
            <h2 className="font-semibold text-[#667085] text-xs mt-2">
              {designers.length} Designees
              {designers.length > 3 && (
                <button
                  onClick={() => {
                    setViewAllDesigners(!viewAllDesigners);
                    setOpenMenuId(null);

                  }}
                  className="text-blue-500 text-xs float-right"
                >
                  {viewAllDesigners ? "View Less" : "View All"}
                </button>
              )}
            </h2>
            <ul>
              {(viewAllDesigners ? designers : designers.slice(0, 3)).map(
                (designer, index) => (
                  <li
                    key={index}
                    className="text-gray-700 py-1 hover:text-blue-500 flex items-center cursor-pointer"
                  >
                    <User className="mr-2" />
                    {designer}
                  </li>
                )
              )}
            </ul>
            {/* Add Designer Button */}
          {/* <button
              onClick={() => {
                if (isMembershipActive) {
                  setShowDesignerPopup(true);
                  setOpenMenuId(null);
                } else {
                  setDeletebutton2(true);
                  setIsOpen(false);
                  setOpenMenuId(null);
                }
              }}
              className="flex items-center w-full bg-gray-200 p-1 text-black mt-2 rounded-md justify-center border"
            >
              <Plus className="mr-2" />
              Add Designer
            </button>  */}

          {/* Popup for Adding Designee */}
          {/* {showDesignerPopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-lg font-semibold">Add Designee</h3>
                    <button
                      onClick={() => setShowDesignerPopup(false)}
                      className="text-gray-500"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-24 h-24 rounded-full border-dashed border-2 flex items-center justify-center text-gray-500">
                        <Camera className="h-6 w-6" />
                      </div>
                    </div>
                    <label className="block mb-2 text-sm font-medium">
                      Enter Designee Name
                    </label>
                    <input
                      type="text"
                      placeholder="Designee Name"
                      value={designeeName}
                      onChange={(e) => setDesigneeName(e.target.value)}
                      className="border p-2 rounded w-full mb-3"
                    />
                    <label className="block mb-2 text-sm font-medium">
                      Enter Designee Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="Designee Phone Number"
                      value={designeePhone}
                      onChange={(e) => setDesigneePhone(e.target.value)}
                      className="border p-2 rounded w-full mb-3"
                    />
                    <label className="block mb-2 text-sm font-medium">
                      Enter Designee Email
                    </label>
                    <input
                      type="email"
                      placeholder="Designee Email"
                      value={designeeEmail}
                      onChange={(e) => setDesigneeEmail(e.target.value)}
                      className="border p-2 rounded w-full mb-4"
                    />
                  </div>
                  <button
                    // onClick={handleAddDesignee}
                    onClick={() => setShowDesignerPopup(false)}
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                  >
                    Invite to Cumulus
                  </button>
                </div> */}
          {/* </div> */}
          {/* )} */}
          {/* </div> */}


          <h2 className="font-semibold text-[#667085] text-xs mt-2">
          {designers.length} Designees
          {designers.length > 3 && (
            <button
              onClick={() => {
                setViewAllDesigners(!viewAllDesigners);
                setOpenMenuId(null);
              }}
              className="text-blue-500 text-xs float-right"
            >
              {viewAllDesigners ? "View Less" : "View All"}
            </button>
          )}
        </h2>
        <ul>
          {(viewAllDesigners ? designers : designers.slice(0, 3)).map(
            (designer, index) => (
              <li
                key={index}
                className="text-gray-700 py-1 hover:text-blue-500 flex items-center cursor-pointer"
              >
                <User className="mr-2" />
                {designer}
              </li>
            )
          )}
        </ul>
    <>
        <button
          onClick={() => {
            if (isMembershipActive) {
              setOpenMenuId(null);
              setShowDesignerPopup(true)
              openPopup();
            } else {
              setOpenMenuId(null);
              setDeletebutton2(true);
              
            }
          }}
          className="flex items-center w-full bg-gray-200 p-1 text-black mt-2 rounded-md justify-center border"
        >
          <Plus className="mr-2" />
          Add Designer
        </button> 

        {/* <DesignerPopup
        isVisible={showDesignerPopup}
        onClose={() => setShowDesignerPopup(false)}
        designeeName={designeeName}
        setDesigneeName={setDesigneeName}
        designeePhone={designeePhone}
        setDesigneePhone={setDesigneePhone}
        designeeEmail={designeeEmail}
        setDesigneeEmail={setDesigneeEmail}
        handleAddDesignee={handleAddDesignee}
      /> */}
        </>
        {/* {showDesignerPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-semibold">Add Designee</h3>
                <button
                  onClick={() => setShowDesignerPopup(false)}
                  className="text-gray-500"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-24 h-24 rounded-full border-dashed border-2 flex items-center justify-center text-gray-500">
                    <Camera className="h-6 w-6" />
                  </div>
                </div>
                <label className="block mb-2 text-sm font-medium">
                  Enter Designee Name
                </label>
                <input
                  type="text"
                  placeholder="Designee Name"
                  value={designeeName}
                  onChange={(e) => setDesigneeName(e.target.value)}
                  className="border p-2 rounded w-full mb-3"
                />
                <label className="block mb-2 text-sm font-medium">
                  Enter Designee Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Designee Phone Number"
                  value={designeePhone}
                  onChange={(e) => setDesigneePhone(e.target.value)}
                  className="border p-2 rounded w-full mb-3"
                />
                <label className="block mb-2 text-sm font-medium">
                  Enter Designee Email
                </label>
                <input
                  type="email"
                  placeholder="Designee Email"
                  value={designeeEmail}
                  onChange={(e) => setDesigneeEmail(e.target.value)}
                  className="border p-2 rounded w-full mb-4"
                />
              </div>
              <button
                onClick={handleAddDesignee}
                //onClick={() => setShowDesignerPopup(false)}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Invite to Cumulus
              </button>

              
            </div>
            
          </div>
        )} */}

          {/* Voice memo */}
          <div className="">
            <h2 className="font-semibold text-[#667085] text-sm mt-2">Voice memo</h2>
            <NavLink
              to="/voicememo"
              onClick={() => setOpenMenuId(null)}
              className={({ isActive }) =>
                `flex mb-2 cursor-pointer p-2 rounded ${isActive ? "bg-blue-500 text-white" : "text-[#434A60]"}`
              }
            >
              {({ isActive }) => (
                <span className="flex items-center h-6">
                  <img
                    src={isActive ? whiteemic : Microphone} // Dynamically change image based on isActive
                    alt="Microphone Icon"
                    className="h-6 w-6" // Adjust image size
                  />
                  <h2 className="ml-3">Create A Voicememo</h2>
                </span>
              )}
            </NavLink>
          </div>

          {/* Transfer */}
          <div>
            <h2 className="font-semibold mt-1 text-sm text-[#667085]">Transfer</h2>
            <div className="text-[#434A60] py-1 pl-2 hover:text-blue-500 cursor-pointer flex"
              onClick={() => {
                setIsOpen(false);
                setOpenMenuId(null);
              }
              }
            >
              <img src={aftertlife} alt="" className="h-6" />
              <span className="ml-3">Sharing After Death</span>
            </div>
          </div>

          {/* Shared Files */}

          <div className="">
            <h2 className="font-semibold text-[#667085] text-sm mt-2">Shared file</h2>
            <NavLink
              to="/SharedFiles"
              className={({ isActive }) =>
                `flex mb-2 cursor-pointer p-2 rounded  ${isActive ? "bg-blue-500 text-white" : "text-[#434A60]"
                }`
              }
            >
              <span className="flex "
                onClick={() => {
                  setIsOpen(false);
                  setOpenMenuId(null);
                }}
              >
                <Users className="" />
                <h2 className="ml-3">Shared With Me</h2>
              </span>

            </NavLink>
          </div>

          <div className="flex-grow"></div>
          <div className="mt-auto ">
            <button className="flex w-full  p-2 text-[#667085]  rounded-md "
              onClick={handleClickhelp}
            >
              <span className="flex gap-2">
                <CircleAlertIcon />
                Help and Support</span>
            </button>
          </div>


        </div>
        {deletebutton && (
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="deleteModalLabel"
            aria-describedby="deleteModalDescription"
          >
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
              <div className="flex justify-between items-center mb-4">
                <h2 id="deleteModalLabel" className="text-lg font-semibold">
                  Are you sure to delete this folder?
                </h2>
              </div>
              <div
                id="deleteModalDescription"
                className="text-sm text-gray-600 mb-4"
              >
                This action cannot be undone. Please confirm if you'd like to
                proceed.
              </div>
              <div className="flex justify-end gap-2 my-2">
                <button
                  onClick={() => setDeletebutton(false)}
                  className="border-2 border-blue-500 text-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteFile(selectedFolder); // Pass Selected Folder ID
                    setDeletebutton(false);
                  }}
                  className="bg-blue-500 text-white px-6 py-2 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
        {overlayVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-11/12 max-w-md rounded-lg shadow-lg p-6 relative">
              {/* Close Button */}
              <button
                onClick={closeOverlay}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Error Message */}
              <p className="text-gray-800 text-center">{errorMessage}</p>

              {/* Close Button (Optional) */}
              <button
                onClick={closeOverlay}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {deletebutton1 && (
          <div
            className="fixed inset-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="deleteModalLabel"
            aria-describedby="deleteModalDescription"
          >
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
              <div className="flex justify-between items-center mb-4">
                <h2 id="deleteModalLabel" className="text-lg font-semibold">
                  Session Expired
                </h2>
              </div>

              <div
                id="deleteModalDescription"
                className="text-sm text-gray-600 mb-4"
              >
                Your session has been expired please re-login to
              </div>

              <div className="flex justify-end gap-2 my-2">
                <NavLink to="/Login">
                  <button
                    className="bg-blue-500 text-white px-6 py-2 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setDeletebutton1(false)}
                  >
                    Login
                  </button>
                </NavLink>
              </div>
            </div>
          </div>
        )}

        {deletebutton2 && (
          <div
            className="fixed inset-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="deleteModalLabel"
            aria-describedby="deleteModalDescription"
          >
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
              <div className="flex justify-between items-center mb-4">
                <h2 id="deleteModalLabel" className="text-lg font-semibold">
                  You have no active membership
                </h2>
              </div>

              <div
                id="deleteModalDescription"
                className="text-sm text-gray-600 mb-4"
              >
                Take a membership to access this feature.
              </div>

              <div className="flex justify-end gap-2 my-2">
                <button
                  onClick={() => setDeletebutton2(false)}
                  className="border-2 border-blue-500 text-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <NavLink to="/Subscription">
                  <button
                    className="bg-blue-500 text-white px-6 py-2 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setDeletebutton2(false)}
                  >
                    Take Membership
                  </button>
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileSidebar;
