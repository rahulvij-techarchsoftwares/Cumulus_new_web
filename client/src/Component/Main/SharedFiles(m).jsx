import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Grid, List } from "lucide-react";
import axios from "axios";
import { API_URL } from "../utils/Apiconfig";
import shareicondesignee from "../../assets/shareicondesignee.png";
import editicon from "../../assets/edit-icon.png";
import trashicon from "../../assets/trashicon.png";
import downloadicon from "../../assets/downloadicon.png";

const SharedFiles = () => {
    const [isGridView, setIsGridView] = useState(false);
    const [showPopup, setShowPopup] = useState(true);
    const [sharedFiles, setSharedFiles] = useState(false);
    const [queryParams, setQueryParams] = useState({ email: '', otp: '' });
    const [expandedItemId, setExpandedItemId] = useState(null); // Track which item's dropdown is open
    const dropdownRef = useRef(null); // Reference for dropdown positioning
    const [isExpanded, setIsExpanded] = useState(false);
    const [share, setShare] = useState("");
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [editsMode, setEditsMode] = useState(null);
    const [newVoicesName, setNewVoicesName] = useState("");
    const [deletebutton1, setDeletebutton1] = useState(false);
    const [audioFiles, setAudioFiles] = useState([]);

    // Example data for shared files
    // const sharedFiles = [
    //     {
    //         id: 1,
    //         sharedBy: "Jie Yan Song",
    //         date: "Nov 28, 2024 6:28 pm",
    //         sharedItem: "Tax_Return_2023.pdf",
    //         additionalItems: 4,
    //         modify: "View Access",
    //     },
    //     {
    //         id: 2,
    //         sharedBy: "Hector Lee",
    //         date: "Nov 28, 2024 6:28 pm",
    //         sharedItem: "Car_Insurance_Policy.pdf",
    //         additionalItems: 4,
    //         modify: "Edit Access",
    //     },
    //     {
    //         id: 3,
    //         sharedBy: "Jie Yan Song",
    //         date: "Nov 28, 2024 6:28 pm",
    //         sharedItem: "College_Transcript.pdf",
    //         additionalItems: 4,
    //         modify: "View Access",
    //     },
    //     {
    //         id: 4,
    //         sharedBy: "Sam K Young",
    //         date: "Nov 28, 2024 6:28 pm",
    //         sharedItem: "Medical_Bills_Q1.pdf",
    //         additionalItems: 4,
    //         modify: "Edit Access",
    //     },
    //     {
    //         id: 5,
    //         sharedBy: "Jie Yan Song",
    //         date: "Nov 28, 2024 6:28 pm",
    //         sharedItem: "Lease_Agreement_2024.pdf",
    //         additionalItems: 4,
    //         modify: "Edit Access",
    //     },
    // ];

      const handleDownloadFile = async (fileId) => {
        try {
          // Find the file object from the list of files
          const file = audioFiles.find((f) => f._id === fileId);
          if (!file) {
            console.error("File not found");
            return;
          }
    
          // Make the API request to get the signed URL for download
          const response = await fetch(`${API_URL}/api/voice-memo/download-voice`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`, // Assuming you're using a token for authentication
            },
            body: JSON.stringify({ voice_id: file._id }),
          });
    
          if (!response.ok) {
            throw new Error("Failed to get download URL");
          }
    
          const data = await response.json();
          const { downloadUrl } = data;
    
          if (downloadUrl) {
            // Trigger the download by creating a link and simulating a click
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = file.voice_name || "download";  // Use the voice name as the file name
            console.log(file.voice_name);
            link.click();
          } else {
            console.error("Download URL not found in response");
          }
        } catch (error) {
          console.error("Error during download:", error);
        }
      };


    const sharedAllFiles = async (email) => {
        const token = localStorage.getItem("token");
        if(token){
            const response = await axios.post(`${API_URL}/api/designee/auth-get`, email, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSharedFiles(response.data);
        }
        else{
            const response = await axios.post(`${API_URL}/api/designee/get`, {email});
            setSharedFiles(response.data);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        const guest_token = localStorage.getItem("guest_token");
        if(token){
            setShowPopup(token?false:true);
        }
        else{
            setShowPopup(guest_token?false:true);
        }
    }, []);

    useEffect(() => {
        // Get the query string from the current URL
        const queryString = window.location.search;

        // Create a URLSearchParams object
        const params = new URLSearchParams(queryString);

        // Extract query parameters
        const email = params.get('email');
        const otp = params.get('otp');
        sharedAllFiles(email);
        setQueryParams({ email, otp });
    }, []);

    const closePopup = () => {
        setShowPopup(false);
    };

    // Handle toggling of dropdown visibility
    const toggleDropdown = (id, event) => {
        // Set the dropdown to open for the clicked item
        if (expandedItemId === id) {
            setExpandedItemId(null); // If it's already open, close it
        } else {
            setExpandedItemId(id);
        }
    };

    const handleSaveEdits = async (id) => {
        try {
          // const token = Cookies.get('token');
          const token = localStorage.getItem("token");
    
          if (!token) {
            console.log("No token found. Please log in.");
            return;
          }
          const response = await fetch(`${API_URL}/api/voice-memo/edit-voice-name`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              voice_id: id,
              new_voice_name: newVoicesName,
            }),
          });
    
          const result = await response.json();
          if (response.ok) {
            // alert("Voice name updated successfully");
            setEditsMode(null);
            // Optionally, refresh the list of files
          } else {
            alert(result.error || "Failed to update voice name");
          }
        } catch (error) {
          console.error(error);
          alert("Error updating voice name");
        }
      };

    const handleEdits = (id, currentName) => {
        setEditsMode(id);
        setNewVoicesName(currentName);
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, otp } = e.target;
        let data = {
            email: email.value,
            otp: otp.value
        }
        const response = await axios.post(`${API_URL}/api/designee/verify-email-otp`, data);
        const { success, message } = response.data;
        if(success){
            alert(message);
            localStorage.setItem("guest_token", 1);
            window.location.href="";
        }
        else{
            alert(message);
        }
    };

    const handleDropDown = () => {
        setIsExpanded(!isExpanded);
    }

    return (
        <div className="p-6">
            {/* Conditionally render the popup based on the showPopup state */}
            {showPopup && (
                <form onSubmit={handleSubmit}>
                    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black bg-opacity-40">
                        <div className="bg-white p-5 rounded-lg shadow-lg w-1/3 mx-4">
                            <div className="flex justify-between border-b-2 border-slate-300 w-full">
                                <h2 className="font-bold py-2 border-slate-500">For File Access</h2>
                                <button onClick={closePopup}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-6 h-6 text-slate-500"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <p className="text-sm font-semibold text-slate-400 mb-6 mt-4">
                                Enter your email and OTP to verify your identity.
                            </p>

                            {/* Email Input */}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email ID</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="e.g. hg119147@gmail.com"
                                    value={queryParams.email}
                                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    readonly
                                    required
                                />
                            </div>

                            {/* OTP Input */}
                            <div className="mb-6">
                                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">OTP</label>
                                <input
                                    id="otp"
                                    type="text"
                                    name="otp"
                                    placeholder="e.g. 1234"
                                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between items-center">
                                <button></button>
                                <button className="bg-blue-500 text-white px-10 py-2 rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* Shared Files Section */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl">Shared Files</h1>
                    <button
                        onClick={() => setIsGridView(!isGridView)}
                        className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 sm:hidden"
                    >
                        {isGridView ? <List size={20} /> : <Grid size={20} />}
                    </button>
                </div>

                <div className="sm:block">
                    {!isGridView ? (
                        <div>
                            <div className="flex">
                                <h1 className="text-md font-semibold text-blue-600 border-b-4 py-2 border-blue-600">List Of Files</h1>
                                <span className="h-8 w-8 bg-slate-100 text-center mt-2 ml-3 font-semibold py-1 rounded-lg">{sharedFiles && sharedFiles.length}</span>
                            </div>

                            <table className="w-full text-left text-gray-600">
                                <thead className="text-gray-700 bg-gray-100 border-b-2 border-t-2">
                                    <tr>
                                        <th className="px-4 py-4 text-slate-500">Shared By</th>
                                        <th className="px-4 py-4 text-slate-500">Date</th>
                                        <th className="px-4 py-4 text-slate-500">Shared Item</th>
                                        <th className="px-2 py-4 text-slate-500">Modify</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {sharedFiles && sharedFiles.map((file) => (
                                        <tr key={file.id} className="border-b hover:bg-gray-50">
                                            <td className="flex">
                                                <ChevronDown
                                                    size={24}
                                                    className="text-gray-500 mr-2 mt-4"
                                                    onClick={handleDropDown}
                                                />
                                                <span className="mt-3 text-sm font-semibold bg-gray-100 px-3 py-2 rounded-xl">{file.files[0].from_user_id.username}</span>
                                            </td>

                                            {isExpanded && <>
                                                <tr>
                                                    <td>edit</td>
                                                </tr>
                                            </>}
                                            <td className="px-3 py-4 text-md">{file.files[0].created_at}</td>
                                            <td className="px-3 py-4">
                                                <div className="flex items-center cursor-pointer relative">
                                                    
                                                    <div>
                                                        <p className="font-semibold mb-1">{(file.files).length}</p>
                                                        <p className="text-xs text-blue-500">+{(file.files).length} Items</p>
                                                    </div>
                                                </div>

                                                {/* Show dropdown only for the item that's clicked */}
                                                {expandedItemId === file._id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute left-[800px] mt-2 p-4 bg-white border border-gray-300 shadow-lg rounded-lg w-72"
                                                        style={{ zIndex: 10 }}
                                                    >
                                                        <h1 className="text-xl font-semibold px-2 mb-3">Shared Items</h1>
                                                        {(file.files).map((data) => (
                                                            <p className="font-semibold px-2 py-3">{data.file_id.file_name}</p>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 text-slate-400 font-semibold cursor-pointer text-md sm:text-md">
                                                {file.files[0].modify}View Access
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        // Grid View for Small Screens
                        <div className="grid grid-cols-2 gap-2">
                            {sharedFiles && sharedFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="p-4 bg-white shadow-lg rounded-lg border border-gray-200 hover:bg-gray-50"
                                >
                                    <div className="flex items-center mb-4">
                                        <img
                                            src="https://via.placeholder.com/32"
                                            alt={file.sharedBy}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                        <p className="font-medium text-sm">{file.sharedBy}</p>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">
                                        <span className="font-semibold">Date:</span> {file.date}
                                    </p>
                                    <div className="flex items-center">
                                        <div>
                                            <p className="text-xs">{file.sharedItem}</p>
                                            <p className="text-xs text-blue-500">
                                                +{file.additionalItems} Items
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-gray-500 text-sm cursor-pointer">
                                        {file.modify}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SharedFiles;
