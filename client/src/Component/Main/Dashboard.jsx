import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import AsyncSelect from "react-select/async";
import fetchUserData from "./fetchUserData";
import { API_URL } from "../utils/Apiconfig";
import shareicon from "../../assets/ShareIcon.png";
import fileupload from "../../assets/fileupload.png";
import editicon from "../../assets/editicon.png";
import shareicondesignee from "../../assets/shareicondesignee.png";
import foldericon from "../../assets/foldericon.png";
import eyeicon from "../../assets/eyeicon.png";
import trashicon from "../../assets/trashicon.png";
import downloadicon from "../../assets/downloadicon.png";
import usePopupStore from "../../store/DesigneeStore";
import DesignerPopup from "../Main/Designeepopup";

import {
  ArrowRight,
  Trash2,
  UploadCloud,
  X,
  Eye,
  Edit,
  Folder,
  Users,
  ChevronDown,
  Camera,
  Download,
  Loader2,
  EllipsisVertical,
  Grid,
  Menu,
  LayoutGrid,
  Share2Icon,
  Search,
  Check,
} from "lucide-react";

import upload from "../../assets/upload.png";

import axios from "axios";

import mammoth from "mammoth";

import { useParams, NavLink } from "react-router-dom";

import useLoadingStore from "../../store/UseLoadingStore";

const Dashboard = ({ folderId = 1, onFolderSelect, searchQuery }) => {
  const [collabs, setCollabs] = useState("");
  const [fileId, setFileId] = useState("");
  const [permission, setPermission] = useState(false);
  const [shareFolderModal, setShareFolderModal] = useState(false);
  const { id: routeFolderId } = useParams();

  const { isLoading, showLoading, hideLoading } = useLoadingStore();

  const activeFolderId = folderId || routeFolderId;

  const [isUploading, setIsUploading] = useState(false);
  const {
    // showDesignerPopup,
    closePopup,
    designeeName,
    setDesigneeName,
    designeePhone,
    setDesigneePhone,
    designeeEmail,
    setDesigneeEmail,
  } = usePopupStore();
  const [openMenuId, setOpenMenuId] = useState(() => {
    try {
      const storedValue = localStorage.getItem("openMenuId");
      return storedValue ? JSON.parse(storedValue) : null;
    } catch (error) {
      console.error("Failed to parse openMenuId from localStorage:", error);
      return null;
    }
  });

  const [files, setFiles] = useState([
    {
      name: "Real Estate 4.zip",

      folder: "",

      date: "Feb 6, 2024",

      contact: "rahul",

      tag: "Will",
    },
  ]);

  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid

  const [fileExtension, setFileExtension] = useState(""); // Store file extension

  const [showOverlay, setShowOverlay] = useState(false);

  const [docContent, setDocContent] = useState(""); // Extracted Word content

  const [fileData, setFileData] = useState(null);

  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name1, setName1] = useState("");
  const [designers, setDesigners] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");

  const [customFileName, setCustomFileName] = useState(""); // State to store the custom file name

  const [inputFileName, setInputFileName] = useState(""); // State to store the current value in input field

  const [uploadStatus, setUploadStatus] = useState("");

  const [tags, setTags] = useState([]);

  const [message, setMessage] = useState(null); // Added for feedback messages

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [uploadQueue, setUploadQueue] = useState([]); // Files currently uploading

  const [editFile, setEditFile] = useState(null); // File being edited

  const [expandedRow, setExpandedRow] = useState(null);

  const [selectedFileId, setSelectedFileId] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const [folders, setFolders] = useState([]);

  const [name, setName] = useState([]);

  const [shareFileVisible, setShareFileVisible] = useState(null); // Track which file's ShareFile is visible

  const [designee, setDesignee] = useState("");

  const [share, setShare] = useState("");

  const [notify, setNotify] = useState(true);

  const [deletebutton, setDeletebutton] = useState(false);

  // const [people, setPeople] = useState([

  //   { name: "Hariom Gupta (you)", email: "hg119147@gmail.com", role: "Owner" },

  //   { name: "Akash", email: "Akahs@gmail.com", role: "" },

  // ]);
  const [people, setPeople] = useState([]);
  const [showDesignerPopup, setShowDesignerPopup] = useState(false); // Toggles the popup visibility
  // const [designeeName, setDesigneeName] = useState(""); // Holds the input for designee name
  // const [designeePhone, setDesigneePhone] = useState(""); // Holds the input for designee phone number
  // const [designeeEmail, setDesigneeEmail] = useState(""); // Holds the input for designee email

  const [need, setNeed] = useState([]);

  const [token, setToken] = useState([]);
  const [editingFileId, setEditingFileId] = useState(null); // ID of the file being edited

  const [tempFileName, setTempFileName] = useState("");
  const [MobilesearchQuery, MobilesetsearchQuery] = useState("");
  // const [users, setUsers] = useState([

  //   {

  //     name: "Hariom Gupta (you)",

  //     email: "hg119147@gmail.com",

  //     role: "Owner",

  //     permission: "Owner",

  //   },

  //   {

  //     name: "Akash",

  //     email: "Akahs@gmail.com",

  //     role: "User",

  //     permission: "Only View",

  //   },

  // ]);

  const [users, setUsers] = useState([]);

  const [newUser, setNewUser] = useState("");

  const [showDropdown, setShowDropdown] = useState(null);

  const [editFileId, setEditFileId] = useState(null);
  const [tempFName, setTempFName] = useState("");
  const menuRef = useRef(null);

  const [access, setAccess] = useState(false);
  const [isMembershipActive, setIsMembershipActive] = useState(false);
  const [membershipDetail, setMembershipDetail] = useState(null);
  const [userData, setUserData] = useState(null);
  const [deletebutton1, setDeletebutton1] = useState(false);
  // const [filteredFiles, setFilteredFiles] = useState();
  const [username, setUsername] = useState("");

  const setPermission1 = async (index, data, userId) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/api/designee/set-permission`, // Backend endpoint

      { userId, data },

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setPermission({ ...permission, [index]: data });
  };
  // Start editing a file name
  const handleEditFileName = (file) => {
    setEditFileId(file.id);
    setTempFName(file.name);
  };

  // const handleSaveFileName = (fileId) => {
  //   // Save the new name logic here
  //   const updatedFiles = filteredFiles.map((file) =>
  //     file.id === fileId ? { ...file, name: tempFileName } : file
  //   );
  //   setFilteredFiles(updatedFiles);
  //   // Update your state with the updated files
  //   console.log("Updated files:", updatedFiles); // Replace with your state update logic
  //   setEditingFileId(null); // Exit editing mode
  // };

  useEffect(() => {
    console.log("Current editing file ID:", editFileId);
  }, [editFileId]);

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
        console.log("user name ");
        setIsMembershipActive(data.user.activeMembership);
        setMembershipDetail(data.user.memberships);
        setUsername(data.user.username);
        console.log("user name ", data.user.username);
        console.log("details", data.user.membershipDetail);
        console.log("membership", data.user.isMembershipActive);
      } catch (err) {
        console.log(err.message || "Failed to fetch user data");
      }
    };
    getUserData();
  }, []);

  const handleUsersClick = (fileId) => {
    setShareFileVisible((prevId) => (prevId === fileId ? null : fileId)); // Toggle visibility
  };

  const toggleAccess = () => {
    setAccess(true); // Toggle the access state when the folder button is clicked
  };

  const handleDesigneeChange = (e) => setDesignee(e.target.value);

  const handleMessageChange = (e) => setMessage(e.target.value);

  const handleNotifyChange = () => setNotify(!notify);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedEmail = localStorage.getItem("email");

    console.log("krcnjrncirc", storedUser);
    console.log("krcnjrncirc", storedEmail);

    setPeople([
      {
        user_id: 1,
        name: `${username} (you)`,
        email: storedEmail,
        role: "Owner",
      },
    ]);
    setUsers([
      { name: `${username} (you)`, email: storedEmail, role: "Owner" },
    ]);
  }, []);

  const handleSaveFName = async (fileId) => {
    console.log("Saving File Name:", tempFName, "for File ID:", fileId);

    if (!tempFName.trim()) return; // Ensure file name is not empty

    // Find the file object based on the fileId
    const file = files.find((f) => f._id === fileId);

    if (file) {
      // Extract the file extension from the original file name (e.g., abc.docx → .docx)
      const originalFileName = file.file_name;
      const fileExtension = originalFileName.slice(
        originalFileName.lastIndexOf(".")
      ); // Get the extension part (e.g., .docx)

      // Ensure the edited file name ends with the correct extension
      const newFileName = tempFName.endsWith(fileExtension)
        ? tempFName
        : tempFName + fileExtension; // Append the extension if it's missing

      console.log("Final File Name with Extension:", newFileName);

      try {
        const response = await axios.post(`${API_URL}/api/edit-file-name`, {
          file_id: fileId,
          new_file_name: newFileName, // Send the updated file name with the extension
        });

        if (response.data.message === "File name updated successfully.") {
          // Update the file name in local state
          setFiles((prevFiles) =>
            prevFiles.map((file) =>
              file._id === fileId
                ? { ...file, file_name: response.data.new_file_name }
                : file
            )
          );
          setEditFileId(null); // Exit edit mode
          setTempFName(""); // Reset temp file name
          fetchFiles();
        }
      } catch (error) {
        console.error("Error updating file name:", error);
      }
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    console.log("Selected folderId:", folderId);
  }, [folderId]);

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "grid" : "list");
  };

  const handleDownloadFile = async (file_id) => {
    try {
      // const token = Cookies.get('token');
      const token = localStorage.getItem("token");

      // Get the download link from the server

      const response = await axios.post(
        `${API_URL}/api/download-file`, // Backend endpoint

        { file_id },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { download_url } = response.data;

      // Programmatically trigger the file download

      const link = document.createElement("a");

      link.href = download_url;

      link.setAttribute("download", ""); // Let the browser infer the filename

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.error("Error preparing file download:", error);

      // alert('Error preparing file download. Please try again.');
    }
  };

  const handleAddDesignee = () => {
    if (designeeName && designeePhone && designeeEmail) {
      setDesigners([...designers, designeeName]); // Add the new designer to the list
      setShowDesignerPopup(false); // Close the popup
      setDesigneeName(""); // Reset the input fields
      setDesigneePhone("");
      setDesigneeEmail("");
    } else {
      setError("Please fill out all fields before inviting a designee.");
    }
  };

  const closeOverlay = () => {
    setOverlayVisible(false); // Close the overlay

    setFileData(null); // Reset file data when closing overlay
  };

  const handleSubmit = async () => {
    //alert(`Designee: ${collabs}\nMessage: ${message}\nNotify: ${notify}`);
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/api/share-files`,
      { file_id: fileId, designee: collabs, message, notify, permission },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const { success } = response.data;
    if (success) {
      console.log("API response for folderId:", response.data);
      alert("Share file successfully!");
    } else {
      alert("You have already shared the file!");
    }
    setShare(false);
  };

  const handleSubmitFolder = async () => {
    //alert(`Designee: ${collabs}\nMessage: ${message}\nNotify: ${notify}`);
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/api/share-folder`,
      { folder_id: folderId, designee: collabs, message, notify, permission },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const { success } = response.data;
    if (success) {
      console.log("API response for folderId:", response.data);
      alert("Share file successfully!");
    } else {
      alert("You have already shared the file!");
    }
    setShare(false);
  };

  const addUser = () => {
    if (newUser.trim() !== "") {
      setUsers([
        ...users,

        {
          name: newUser,

          email: `${newUser.toLowerCase().replace(/\s/g, "")}@gmail.com`,

          role: "User",

          permission: "Only View",
        },
      ]);

      setNewUser("");
    }
  };

  const clear = () => {
    setSelectedFile(null);

    setSelectedFolderId("");

    setCustomFileName("");

    setUploadQueue([]);

    setInputFileName("");

    setEditFile(null);

    setIsUploading(false);
  };

  const clear2 = () => {
    setEditFile(null);

    setSelectedFolderId("");

    setCustomFileName("");

    setTags("");
  };

  const removeUser = (index) => {
    setUsers(users.filter((_, i) => i !== index));
  };

  const updatePermission = (index, permission) => {
    const updatedUsers = [...users];

    updatedUsers[index].permission = permission;

    setUsers(updatedUsers);

    setShowDropdown(null);
  };

  const fetchFolders = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      // const token = Cookies.get('token');

      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const response = await axios.get(
        `${API_URL}/api/get-folders`,

        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in Authorization header
          },
        }
      );

      const foldersData = response.data.map((folder) => ({
        id: folder._id, // Get _id for folder selection

        name: folder.folder_name,
      }));

      setFolders(foldersData); // Set fetched folders

      // Do not set selectedFolderId automatically on first load
    } catch (error) {
      console.log(error.response?.data?.message || "Error fetching folders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (!activeFolderId) return;

    fetchFolders();

    if (onFolderSelect) {
      onFolderSelect(activeFolderId);
    }
  }, [activeFolderId, onFolderSelect]);

  const handleFolderSelect = (id) => {
    setSelectedFolderId(id); // Only set when the user selects a folder
  };

  const fetchFiles = async () => {
    setLoading(true);

    setError(null);

    try {
      // const token = Cookies.get('token');
      const token = localStorage.getItem("token");

      console.log("tokennnnnnn", token);

      // console.log("useerrrrrrrrid", userId);

      console.log("folderrrrrid", folderId);

      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      if (folderId === 0) {
        const userId = localStorage.getItem("user");
        console.log("userrrrrId", userId);

        if (!userId) {
          throw new Error("No userId found. Please log in again.");
        }

        console.log("Folder ID is 0, fetching all files for userId:", userId);
        setFiles([]);

        const response = await axios.get(
          `${API_URL}/api/get-all-files`,

          {
            // params: { user_id: userId },  // Correctly pass user_id as a query parameter

            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API response for all filessssssss:", response.data);

        setNeed(false);

        setFiles(response.data || []);
      } else if (folderId === 1) {
        setFiles([]);

        // console.log("Folder ID is 0, fetching all files for userId:", userId);

        const response = await axios.get(
          `${API_URL}/api/default/default-files`
        );

        console.log("API response for defaultttttttttttt:", response.data);

        const filesArray = response.data?.files || []; // Extract the files array

        setFiles(filesArray); // Set only the files array to the state

        setNeed(true);
      } else {
        console.log("Fetching files for folderId:", folderId);
        setFiles([]);

        const response = await axios.post(
          `${API_URL}/api/get-files`,

          { folder_id: folderId },

          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API response for folderId:", response.data);

        setNeed(false);

        setFiles(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching files:", error.response || error.message);

      console.log(error.response?.data?.message || "Error fetching files.");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (fileId) => {
    setExpandedRow(expandedRow === fileId ? null : fileId); // Collapse if already expanded, otherwise expand
  };

  useEffect(() => {
    fetchFiles();
  }, [folderId]);

  const handleUploadClick = () => {
    setIsUploading(true);
  };

  const handleToggleRow = (_id) => {
    console.log("Toggling row with id:", _id); // Log the ID when toggling the row

    setExpandedRow((prev) => {
      const newExpandedRow = prev === _id ? null : _id;

      console.log("Updated expandedRow:", newExpandedRow); // Log the new expandedRow value

      return newExpandedRow;
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Select first file

    const customName = editFile?.name || file.name; // Use the custom name if editing, otherwise use the original name

    if (file) {
      setSelectedFile(file);

      setUploadStatus("Preparing file for upload...");

      const fileExtension = file.name.split(".").pop();

      // Save file and extension for later use

      setSelectedFile({ name: file.name, extension: fileExtension, file });

      setUploadQueue((prevQueue) => [
        ...prevQueue,

        { id: customName, name: customName, isUploading: true, progress: 0 },
      ]);

      setUploadStatus("Ready to upload");

      // Add to files state with custom name

      setFiles((prevFiles) => [
        ...prevFiles,

        { name: customName, description: "", tag: "" }, // Add file to the state with custom name
      ]);

      // Simulate upload for the selected file

      simulateUpload({ id: customName, name: customName });
    }
  };

  const simulateUpload = (file) => {
    const fileExtension = extractFileExtension(file.name); // Extract file extension

    const customFileName = `custom_name_${file.id}.${fileExtension}`; // Create custom file name

    const interval = setInterval(() => {
      setUploadQueue((prevQueue) => {
        const updatedQueue = prevQueue.map((item) => {
          if (item.id === file.id) {
            const updatedProgress = Math.min(item.progress + 20, 100);

            if (updatedProgress === 100) {
              clearInterval(interval);

              // Mark file as uploaded

              const updatedFile = {
                ...item,

                isUploading: false,

                progress: 100,
              };

              // Trigger actual upload to server after simulation

              uploadFileToServer(updatedFile, customFileName); // Pass the custom file name to uploadFileToServer

              return updatedFile; // File is uploaded
            }

            return { ...item, progress: updatedProgress };
          }

          return item;
        });

        return updatedQueue;
      });
    }, 500);
  };

  const uploadFileToServer = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file.");

      return;
    }

    const updatedFile = files.find((file) => file.name === selectedFile.name);

    if (!updatedFile) {
      setUploadStatus("Error: File not found.");

      return;
    }

    const formData = new FormData();

    const folderToUpload = selectedFolderId || folderId;

    formData.append("file", selectedFile.file);

    formData.append("folder_id", folderToUpload);

    formData.append("tags", updatedFile.tag);

    formData.append("description", updatedFile.description || "");

    formData.append("custom_file_name", customFileName || updatedFile.name);

    try {
      showLoading();

      setIsUploading(true);

      // const token = Cookies.get('token');
      const token = localStorage.getItem("token");

      if (!token) {
        setUploadStatus("No token found. Please log in.");

        return;
      }

      const response = await axios.post(
        `${API_URL}/api/upload-file`,

        formData,

        {
          headers: {
            "Content-Type": "multipart/form-data",

            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUploadStatus("File uploaded successfully!");

      setSelectedFile(null);

      setSelectedFolderId("");

      setCustomFileName("");

      setUploadQueue([]);

      fetchFiles();
    } catch (error) {
      setUploadStatus("Error uploading file.");
    } finally {
      setIsUploading(false);

      hideLoading();
    }
  };

  // const toggleEllipses = (file) => {

  //   const newOpenMenuId = openMenuId === folderId ? null : folderId;

  //   setOpenMenuId(newOpenMenuId);

  //   localStorage.setItem("openMenuId", JSON.stringify(newOpenMenuId));

  // };

  const handleEditFile = (file) => {
    if (!file || typeof file.name !== "string") {
      console.error("Invalid file object:", file);
      return;
    }

    const fileExtension = file.name.split(".").pop(); // Extract the extension

    setEditFile({
      ...file,

      name: file.name.replace(`.${fileExtension}`, ""), // Remove the extension from the name

      description: file.description || "", // Provide a fallback for description

      tag: file.tag || "", // Provide a fallback for tag

      extension: fileExtension, // Store the extension
    });
  };

  const toggleEllipses = (fileId) => {
    // Toggle the menu for the specific file by comparing the IDs
    setOpenMenuId((prevId) => (prevId === fileId ? null : fileId));
  };

  const handleSaveEdit = () => {
    if (!editFile) return;

    const updatedFileName = inputFileName
      ? `${inputFileName}.${editFile.extension}`
      : `${editFile.name}.${editFile.extension}`;

    // Update the file list with the new name

    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.name === editFile.name
          ? { ...file, name: updatedFileName, ...editFile }
          : file
      )
    );

    setCustomFileName(updatedFileName); // Update custom file name

    setEditFile(null); // Close the edit modal or reset the form
  };

  const handleDeleteFile = (fileId) => {
    setUploadQueue((prevQueue) =>
      prevQueue.filter((file) => file.id !== fileId)
    );
  };

  const extractFileExtension = (fileName) => {
    const extension = fileName.split(".").pop(); // Extracts file extension

    return extension;
  };

  const deleteFile = async (file_id) => {
    // const token = Cookies.get('token');
    const token = localStorage.getItem("token");

    const selectedFolder = folderId; // Ensure folderId is set correctly

    // Debugging logs

    console.log("Token:", token);

    console.log("Selected Folder ID:", selectedFolder);

    console.log("File ID to delete33333:", file_id);

    // Check for missing values

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

    if (!file_id) {
      setMessage("No file selected to delete.");

      console.error("Missing file_id");

      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/delete-file`,

        { folder_id: selectedFolder, file_id },

        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFiles(files.filter((file) => file._id !== file_id));

      setMessage(response.data.message || "File deleted successfully.");

      setDeletebutton(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error deleting file.");
    }
  };

  const fetchFileContent = async (fileId) => {
    try {
      setLoading(true);
      setError("");

      // const token = Cookies.get('token');
      const token = localStorage.getItem("token");

      console.log("Retrieved Token:", token);

      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }

      console.log("defaultttttttttttttt", fileId);

      if (folderId === 1) {
        console.log("defaultttttttttttttttttttt", fileId);
        const response = await axios.get(
          `${API_URL}/api/default/view-file/${fileId}`
        );

        if (response.status !== 200) {
          throw new Error(
            `Failed to fetch file, status code: ${response.status}`
          );
        }

        const { file_name, aws_file_link, mime_type } = response.data.file;

        if (!aws_file_link) {
          throw new Error("File URL is missing from the response.");
        }

        setFileData({
          fileName: file_name || "Unknown",
          mimeType: mime_type || "Unknown",
          fileUrl: aws_file_link,
        });

        setShowOverlay(true);
      } else {
        const response = await axios.post(
          `${API_URL}/api/view-file-content`,
          { fileId: fileId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // const toggleEllipses = (fileId) => {
        //   const newOpenMenuId = openMenuId === fileId ? null : fileId; // Toggle menu
        //   setOpenMenuId(newOpenMenuId);
        // };
        console.log("xknwjxbexnbc", response);

        const { file_name, file_url, file_type } = response.data;

        if (!file_url) {
          throw new Error("File URL is missing from the response.");
        }

        setFileData({
          fileName: file_name || "Unknown",
          mimeType: file_type || "Unknown",
          fileUrl: file_url,
        });

        setShowOverlay(true); // Show overlay after fetching file details
      }
    } catch (err) {
      console.error("Error fetching file content:", err);
      setError(
        err.response?.data?.message ||
          "An unexpected error occurred while fetching the file content."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderFileContent = () => {
    if (!fileData || !fileData.fileUrl) return null;

    const { mimeType, fileUrl } = fileData; // Destructuring to get mimeType and fileUrl from state

    console.log("MIME Type:", mimeType); // Log MIME type to check if it is image-related

    console.log("File URL:", fileUrl); // Log the File URL to check

    // Handle Image files (e.g., PNG, JPG, SVG)

    if (
      mimeType.startsWith("image/") || // Covers common image types
      mimeType === "image/jpeg" ||
      mimeType === "image/jpg" ||
      mimeType === "image/png" ||
      mimeType === "jpg" || // Specific check for 'jpg'
      mimeType === "jpeg" || // Specific check for 'jpeg'
      mimeType === "png" ||
      mimeType === "image/svg+xml"
    ) {
      return (
        <div>
          <img
            src={fileUrl}
            alt="file content"
            style={{ width: "100%", maxHeight: "500px" }}
            onError={(e) => {
              console.error("Error loading image:", e);

              e.target.src = "https://via.placeholder.com/500"; // Fallback if image fails to load
            }}
          />
        </div>
      );
    }

    // Handle PDF files

    if (mimeType === "application/pdf" || mimeType === "pdf") {
      return (
        <iframe
          src={fileUrl}
          title="PDF Document"
          style={{ width: "500vw", height: "500vh", border: "none" }}
        />
      );
    }

    // Handle Word Documents (.docx) via Google Docs Viewer

    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword" ||
      mimeType === "docx" // In case backend sends 'docx' instead of full MIME type
    ) {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        fileUrl
      )}&embedded=true`;

      return (
        <iframe
          src={googleDocsUrl}
          title="Word Document Viewer"
          style={{ width: "100vw", height: "200vh", border: "none" }}
          className="max-w-6xl overflow-hidden"
        />
      );
    }

    // Handle Excel files (e.g., .xlsx, .xls)

    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    ) {
      return (
        <div>
          <p>Spreadsheet detected. Please download to view:</p>

          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            Download Spreadsheet
          </a>
        </div>
      );
    }

    // Default fallback for unsupported file types

    return <p>Unsupported file type for viewing.</p>;
  };

  const renderOverlay = () => (
    <div
      className="fixed top-0 left-0  w-[100vw] h-[100%] bg-[rgba(0,0,0,0.8)] text-white  z-[1000] flex justify-center items-center"
      // style={{

      //   position: "fixed",

      //   top: 50,

      //   left: 50,

      //   width: "150vw",

      //   height: "100vh",

      //   backgroundColor: "rgba(0, 0, 0, 0.8)",

      //   color: "#fff",

      //   display: "flex",

      //   // flexDirection: "column",

      //   // justifyContent: "center",

      //   // alignItems: "center",

      //   zIndex: 1000,

      // }}
    >
      <div
        className="bg-white text-black p-5 rounded-lg max-w-[90%] max-h-[90%] overflow-y-auto relative w-[80%] h-auto"

        // style={{

        //   backgroundColor: "#fff",

        //   color: "#000",

        //   padding: "20px",

        //   borderRadius: "10px",

        //   maxWidth: "90%",

        //   maxHeight: "90%",

        //   overflowY: "auto",

        //   position: "relative",

        //   width: "80%",

        //   height: "auto",

        // }}
      >
        <h2>Document Viewer</h2>

        {renderFileContent()}

        <button
          className="absolute top-[10px] right-[10px] bg-red-500 text-white border-none px-[10px] py-[2px] rounded"
          onClick={() => setShowOverlay(false)}
        >
          {/* style={{

            position: "absolute",

            top: "10px",

            right: "10px",

            backgroundColor: "#ff0000",

            color: "#fff",

            border: "none",

            padding: "2px 10px",

            borderRadius: "5px",

          }}

          */}
          X
        </button>
      </div>
    </div>
  );

  const filteredFiles = files.filter((file) =>
    file.file_name?.toLowerCase().includes(searchQuery)
  );
  const filteredMobileFiles = files.filter((file) =>
    file.file_name?.toLowerCase().includes(MobilesearchQuery)
  );
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null); // Close the menu
      }
    };

    // Attach event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const shareFile = async (file_id) => {
    const storedUser = localStorage.getItem("user");
    const storedEmail = localStorage.getItem("email");
    let set_people = [
      { name: `${storedUser} (you)`, email: storedEmail, role: "Owner" },
    ];
    //setPeople([{ name: `${storedUser} (you)`, email: storedEmail, role: "Owner" }]);
    // Get the download link from the server
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/api/get-file-data`, // Backend endpoint
      { file_id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    var set_permission = {};
    const { userSharedFile } = response.data;
    userSharedFile.forEach((sharedFile, index) => {
      set_permission = { ...set_permission, [index + 1]: sharedFile.access };
      //setPermission({...permission, [index]:sharedFile.access});
      if (sharedFile.to_user_id) {
        set_people.push({
          user_id: `${sharedFile.to_user_id._id}`,
          name: `${sharedFile.to_user_id.username}`,
          email: sharedFile.to_user_id.email,
          role: sharedFile.to_user_id.roles[0].roleName,
        });
      } else {
        set_people.push({
          user_id: `${sharedFile.to_email_id}`,
          name: `${sharedFile.to_email_id}`,
          email: sharedFile.to_email_id,
          role: "Designee",
        });
      }
    });
    setPermission(set_permission);
    setPeople(set_people);
    setFileId(file_id);
    setShare(true);
  };

  return (
    <div className=" px-4  bg-white">
      {/* Dashboard Header */}

      <div className="w-full mt-2 flex items-center border border-gray-300 rounded-lg p-2 md:hidden">
        <Search className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="w-full p-1 bg-transparent outline-none text-black"
          onChange={(e) => MobilesetsearchQuery(e.target.value)}
        />
      </div>

      {folderId !== 1 && (
        <div className="flex flex-col mt-8">
          <h1 className="text-2xl font-normal text-[#1F1F1F]">Welcome to Cumulus</h1>

          <div
            className="bg-[#0067FF] w-52 rounded-2xl my-2 p-3 "
            onClick={() => {
              if (isMembershipActive) {
                handleUploadClick();
              } else {
                setDeletebutton1(true);
              }
            }}
          >
            <button className="flex items-center text-white px-2">
              <img
                src={fileupload}
                alt=""
                className="w-10 mr-2 object-contain"
              />
              Upload File
            </button>

            <div className="flex justify-between">
              <p className="text-white text-sm ml-1">Click to drop file now</p>

              <ArrowRight className="ml-2 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* TOGLE BTN */}

      <div className="flex justify-end  md:hidden">
        <button
          className="px-4 py-2 text-black rounded-md text-sm  flex"
          onClick={toggleViewMode}
        >
          {viewMode === "list" ? (
            <LayoutGrid className="h-5" />
          ) : (
            <Menu className="h-5" />
          )}

          {viewMode === "list" ? "Grid View" : "List View"}
        </button>
      </div>

      {/* File List */}

      {Array.isArray(files) && files.length > 0 ? (
        <div className="flex border-b-2 md:border-0 mb-0 justify-between items-center mt-2 ml-4 md:px-0 border-gray-300">
          <div className="flex justify-between items-center mt-2 md:px-0 border-gray-300">
            <div className="text-sm">
              {/* Folder Name */}
              <div className="flex items-center md:gap-x-2 border-b-4 border-blue-500 text-blue-500">
                <span className=" font-semibold pb-2 mr-2">
                  {folderId === 1
                    ? "Cumulus"
                    : folderId === 0
                    ? "Allfiles"
                    : files[0]?.folder_name || "All Files"}
                </span>
                <span className="text-black rounded-lg text-sm mt-1 mb-2 px-2.5 bg-[#EEEEEF]">
                  {`${files.length}`}
                </span>
              </div>

              <div className="" />
            </div>
          </div>

          {!(folderId === "0" || folderId === 1) ? (
            <div
              className="flex items-center md:gap-2 mb-1 border-2 border-blue-500 rounded-lg cursor-pointer"
              onClick={() => setShareFolderModal(true)}
            >
              <div className="h-4 text-blue-500 flex items-center justify-center pl-1">
                <img className="h-4" src={shareicon} alt="" />
              </div>
              <p className="text-md md:text-xl text-blue-500 rounded-md py-2 px-2">
                Share Folder
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-center text-gray-500"></p>
      )}

      {viewMode === "list" ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:hidden p-1 max-h-[50vh] overflow-y-scroll ">
            {Array.isArray(filteredMobileFiles) &&
              filteredMobileFiles.map((file) => (
                <div key={file._id} className="border p-2 rounded  ">
                  <div className="flex justify-between relative">
                    {/* <h3 className="text-lg font-medium">{file.file_name}</h3> */}
                    {String(editFileId) === String(file._id) ? (
                      <div className="flex items-center gap-2 border-b-2 border-blue-500 pt-2">
                        <input
                          type="text"
                          value={tempFName}
                          onChange={(e) => {
                            setTempFName(e.target.value);
                            console.log("Temp File Name:", e.target.value);
                          }}
                          onBlur={() => handleSaveFName(file._id)} // Save the new file name when input loses focus
                          className="rounded p-1 bg-transparent outline-none"
                          autoFocus
                        />
                        <button
                          className="text-blue-500 hover:text-blue-700 px-3 py-1 bg-gray-100 rounded-md bg-transparent"
                          onClick={() => handleSaveFName(file._id)} // Save on button click
                        >
                          {/* <Check className="h-5" /> */}Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">
                          {file.file_name}
                        </h3>
                      </div>
                    )}

                    {/* Ellipsis Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleEllipses(file._id);
                      }}
                    >
                      <EllipsisVertical />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === file._id && (
                      <motion.div
                        ref={menuRef}
                        className="absolute top-5 right-6 mt-2 w-48 bg-white shadow-lg rounded-lg text-black flex flex-col gap-y-2 p-2 z-50 "
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        {!need && (
                          <>
                            <button
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                              onClick={() => {
                                setShare(true);
                                setOpenMenuId(null); // Close menu after selecting
                              }}
                            >
                              {/* <Users className="h-4" /> */}
                              <img
                                src={shareicondesignee}
                                alt=""
                                className="h-4"
                              />
                              Share
                            </button>

                            <button
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                              onClick={() => {
                                setAccess(true);
                                setOpenMenuId(null); // Close menu after selecting
                              }}
                            >
                              {/* <Folder className="h-4" /> */}
                              <img src={foldericon} alt="" className="h-4" />
                              Access
                            </button>

                            <button
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                              onClick={() => {
                                handleEditFile(file);
                                setOpenMenuId(null);
                                setEditFileId(file._id);
                                setTempFName(file.file_name); // Close menu after selecting
                              }}
                            >
                              <img
                                src={editicon}
                                alt=""
                                className="h-4 "
                                onClick={() => {
                                  setEditFileId(file._id);
                                  setTempFName(file.file_name);
                                }}
                              />
                              {/* <Edit className="h-4" /> */}
                              Edit
                            </button>

                            <button
                              className="flex items-center gap-2  text-gray-600 hover:text-red-500"
                              onClick={() => {
                                setDeletebutton(true);
                                setSelectedFileId(file._id); // Set the file ID to the state
                                setOpenMenuId(null); // Close menu after selecting
                              }}
                            >
                              {/* <Trash2 className="h-4" /> */}
                              <img src={trashicon} alt="" className="h-4" />
                              Delete
                            </button>
                          </>
                        )}

                        <button
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                          onClick={() => {
                            fetchFileContent(file._id);
                            setOpenMenuId(null); // Close menu after selecting
                          }}
                        >
                          {/* <Eye className="h-4" /> */}
                          <img src={eyeicon} alt="" className="h-4" />
                          View Content
                        </button>
                        <button
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                          onClick={() => {
                            handleDownloadFile(file._id);
                            setOpenMenuId(null);
                          }}
                        >
                          {/* <Download className="h-4 font-extrabold" /> */}
                          <img src={downloadicon} alt="" className="h-4" />
                          Download
                        </button>
                      </motion.div>
                    )}
                  </div>

                  <span className="">
                    <p className="text-lg text-gray-500">{file.folder_name}</p>
                  </span>

                  <span className="">
                    <p className=" text-sm text-gray-800  ">
                      {file.date_of_upload &&
                      !isNaN(new Date(file.date_of_upload))
                        ? new Date(file.date_of_upload).toLocaleString(
                            "en-US",
                            {
                              weekday: "short",

                              year: "numeric",

                              month: "short",

                              day: "numeric",

                              hour: "numeric",

                              minute: "numeric",

                              // second: 'numeric',

                              hour12: true, // for 24-hour format
                            }
                          )
                        : "Invalid Date"}
                    </p>
                  </span>

                  <span className="flex justify-between">
                    <p className="text-sm text-gray-600">
                      Sharing contact: {file.folder_contact}
                    </p>
                  </span>

                  <div className="mt-2 flex gap-2"></div>
                </div>
              ))}
          </div>

          <div className="mt-2 bg-white rounded hidden md:flex max-h-[70vh] pb-[20px] overflow-y-scroll">
            <table className="w-full">
            <thead>
                <tr className="bg-gray-100 text-left text-[0.8rem]  border-black">
                  <th className="p-2 md:p-4 font-medium text-[#667085] text-sm">
                    File Name
                  </th>
                  <th className="p-2 md:p-4 font-medium text-[#667085] text-sm">
                    Folder
                  </th>
                  <th className="p-2 md:p-4 font-medium text-[#667085] text-sm">
                    Date Uploaded
                  </th>
                  <th className="p-2 md:p-4 font-medium text-[#667085] text-sm">
                    Sharing Contact
                  </th>
                </tr>
              </thead>

              <tbody className="">
                {Array.isArray(filteredFiles) ? (
                  // If files is an array, use map

                  filteredFiles.map((file) => {
                    console.log("File Object:", file); // Debugging file object

                    const isExpanded = expandedRow === file._id; // Check if the current row is expanded

                    return (
                      <React.Fragment key={file._id}>
                        {/* Main Row */}
                        <tr
                          className={`text-xs sm:text-sm border-b-2 ${
                            isExpanded ? "bg-blue-100 border-blue-100" : ""
                          } transition-all duration-100`}
                        >
                          <td className="p-0 md:p-4 flex items-center gap-0 md:gap-2">
                            <button
                              className="text-gray-500 hover:text-gray-800"
                              onClick={() => handleToggleRow(file._id)}
                            >
                              <ChevronDown
                                className={`${
                                  isExpanded ? "rotate-180" : ""
                                } h-5 transition-transform`}
                              />
                            </button>

                            {String(editFileId) === String(file._id) ? (
                              <div className="flex items-center gap-2 border-b-2 border-blue-500 pt-2">
                                <input
                                  type="text"
                                  value={tempFName}
                                  onChange={(e) => {
                                    setTempFName(e.target.value);
                                    console.log(
                                      "Temp File Name:",
                                      e.target.value
                                    );
                                  }}
                                  onBlur={() => handleSaveFName(file._id)} // Save the new file name when input loses focus
                                  className="rounded p-1 bg-transparent outline-none"
                                  autoFocus
                                />
                                <button
                                  className="text-blue-500 hover:text-blue-700 px-3 py-1 bg-gray-100 rounded-md bg-transparent"
                                  onClick={() => handleSaveFName(file._id)} // Save on button click
                                >
                                  {/* <Check className="h-5" /> */}Save
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center font-normal text-sm gap-2">
                                {file.file_name}
                              </div>
                            )}
                          </td>

                          <td className="p-0 md:p-4">
                            <div
                              className={`bg-[#EEEEEF] rounded-lg px-3 py-1 text-[1rem] inline-block transition-all duration-300 ${
                                isExpanded ? "bg-white" : "bg-[#EEEEEF]"
                              }`}
                            >
                              {folderId === 1
                                ? "Cumulus"
                                : folderId === 0
                                ? "Allfiles"
                                : files[0]?.folder_name || "All files"}
                            </div>
                          </td>
                          <td className="p-0 md:p-4">
                            <p className="text-xss sm:text-sm text-gray-600 mt-1">
                              {file.date_of_upload &&
                              !isNaN(new Date(file.date_of_upload))
                                ? new Date(file.date_of_upload).toLocaleString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true, // for 12-hour format
                                    }
                                  )
                                : "Invalid Date"}
                            </p>
                          </td>
                          <td className="p-0 md:p-4">
                            {file.sharing_contacts}
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {isExpanded && (
                          <tr className="z-10">
                            <td
                              colSpan="5"
                              className="px-4 pb-4 border-r border-blue-100 bg-blue-100 rounded-bl-3xl rounded-br-3xl"
                            >
                              <div className="flex gap-4 items-center">
                                {!need && (
                                  <>
                                    <button
                                      className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500"
                                      //onClick={() => setShare(true)}
                                      onClick={() => shareFile(file._id)}
                                    >
                                      {/* <Users className="h-4" /> */}
                                      <img
                                        src={shareicondesignee}
                                        alt=""
                                        className="h-4"
                                      />
                                      <span className="absolute bottom-[-45px] left-2/3  transform -translate-x-1/2 hidden min-w-[110px] group-hover:block bg-white text-black text-xs py-1 px-1 rounded shadow z-20">
                                        Share with Designee
                                      </span>
                                    </button>
                                    <button
                                      className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500"
                                      onClick={() => setAccess(true)}
                                    >
                                      {/* <Folder className="h-4" /> */}
                                      <img
                                        src={foldericon}
                                        alt=""
                                        className="h-4"
                                      />
                                      <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 hidden group-hover:block min-w-[80px] bg-white text-black text-xs py-1 px-2 rounded shadow z-20">
                                        Full Access
                                      </span>
                                    </button>
                                    <button
                                      className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500"
                                      onClick={() => {
                                        setEditFileId(file._id);
                                        setTempFName(file.file_name);
                                        console.log(
                                          "Editing File ID:",
                                          file._id
                                        );
                                      }}
                                    >
                                      {/* <Edit className="h-4" /> */}
                                      <img
                                        src={editicon}
                                        alt=""
                                        className="h-4"
                                      />
                                      <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white min-w-[100px] text-black text-xs py-1 px-1 rounded shadow z-20">
                                        Edit Document
                                      </span>
                                    </button>

                                    <button
                                      className="relative group flex items-center gap-2 text-gray-600 hover:text-red-500"
                                      onClick={() => {
                                        setDeletebutton(true);
                                        console.log(
                                          "Deleting file with ID:",
                                          file._id
                                        );
                                        setSelectedFileId(file._id);
                                      }}
                                    >
                                      {/* <Trash2 className="h-4 text-red-700" /> */}
                                      <img
                                        src={trashicon}
                                        alt=""
                                        className="h-4"
                                      />

                                      <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white text-black text-xs py-1 px-2 rounded shadow z-20">
                                        Delete
                                      </span>
                                    </button>
                                  </>
                                )}

                                <button
                                  className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500"
                                  onClick={() => fetchFileContent(file._id)}
                                >
                                  {/* <Eye className="h-4" /> */}
                                  <img src={eyeicon} alt="" className="h-4" />
                                  <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white text-black text-xs py-1 px-2 rounded shadow z-20">
                                    View
                                  </span>
                                </button>
                                <button
                                  className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500"
                                  onClick={() => handleDownloadFile(file._id)}
                                >
                                  {/* <Download className="h-4" /> */}
                                  <img
                                    src={downloadicon}
                                    alt=""
                                    className="h-4"
                                  />
                                  <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white text-black text-xs py-1 px-2 rounded shadow z-20">
                                    Download
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  // If files is not an array (single file object), render the row without map

                  <React.Fragment key={files._id}>
                    {/* Main Row */}

                    <tr className="text-sm">
                      <td className="p-0 md:p-4 flex items-center gap-0 md:gap-2">
                        <button
                          className="text-gray-500 hover:text-gray-800"
                          onClick={() => handleToggleRow(files._id)} // Toggle specific file row
                        >
                          <ChevronDown
                            className={
                              expandedRow === files._id ? "rotate-180" : ""
                            }
                          />
                        </button>

                        {files.file_name}
                      </td>

                      <td className="p-0 md:p-4">{files.folder_name}</td>

                      <td className="p-0 md:p-4">{files.date_of_upload}</td>

                      <td className="p-0 md:p-4">{files.sharing_contacts}</td>

                      <td className="p-0 md:p-4">{files.tags}</td>
                    </tr>

                    {/* Expanded Actions */}

                    {expandedRow === files._id && (
                      <tr className="bg-white">
                        <td colSpan="5" className="p-4">
                          <div className="flex gap-4 items-center">
                            {/* Share Button */}

                            <button
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                              onClick={() => setShare(true)}
                            >
                              {/* <Users className="h-4" /> */}
                              <img
                                src={shareicondesignee}
                                alt=""
                                className="h-4"
                              />
                            </button>

                            {/* Access Button */}

                            <button
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                              onClick={() => setAccess(true)}
                            >
                              {/* <Folder className="h-4" /> */}

                              <img src={foldericon} alt="" className="h-6" />

                              <img src={foldericon} alt="" className="h-4" />
                            </button>

                            {/* Edit Button */}

                            <button
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                              onClick={() => handleEditFile(files)}
                            >
                              {/* <Edit className="h-4" /> */}
                              <img src={editicon} alt="" className="h-4" />
                            </button>

                            {/* View Content Button */}

                            <button
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                              onClick={() => fetchFileContent(files._id)}
                            >
                              {/* <Eye className="h-4" /> */}
                              <img src={eyeicon} alt="" className="h-4 " />
                            </button>

                            {/* Delete Button */}

                            <button
                              className="flex items-center gap-2 text-gray-600 hover:text-red-500"
                              onClick={() => {
                                setDeletebutton(true);

                                console.log(
                                  "Deleting file with ID:",
                                  files._id
                                ); // Debugging log

                                setSelectedFileId(files._id); // Set the file ID to the state
                              }}
                            >
                              {/* <Trash2 className="h-4" /> */}

                              <img src={trashicon} alt="" className="h-6" />

                              <img src={trashicon} alt="" className="h-4" />
                            </button>

                            {/* Download Button */}

                            <button
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                              onClick={() => handleDownloadFile(files._id)}
                            >
                              {/* <Download className="h-4" /> */}

                              <img src={downloadicon} alt="" className="h-6" />

                              <img src={downloadicon} alt="" className="h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:hidden p-2  max-h-[50vh] overflow-y-scroll">
          {Array.isArray(filteredMobileFiles) &&
            filteredMobileFiles.map((file) => (
              <div key={file._id} className="bg-white p-4 rounded border ">
                <div className="flex justify-between relative">
                  <span
                    className="block overflow-hidden"
                    style={{
                      maxWidth: "25vw", // Constrain the width
                    }}
                  >
                    {String(editFileId) === String(file._id) ? (
                      <div className="flex items-center gap-2 border-b-2 border-blue-500 pt-2">
                        <input
                          type="text"
                          value={tempFName}
                          onChange={(e) => {
                            setTempFName(e.target.value);
                            console.log("Temp File Name:", e.target.value);
                          }}
                          onBlur={() => handleSaveFName(file._id)} // Save the new file name when input loses focus
                          className="rounded p-1 bg-transparent outline-none"
                          autoFocus
                        />
                        <button
                          className="text-blue-500 hover:text-blue-700 px-3 py-1 bg-gray-100 rounded-md"
                          onClick={() => handleSaveFName(file._id)} // Save on button click
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p
                        className="text-lg font-bold  text-gray-600 truncate"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                      >
                        {file.file_name.trim()}
                      </p>
                    )}
                  </span>

                  {/* Ellipsis Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleEllipses(file._id);
                    }}
                  >
                    <EllipsisVertical />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === file._id && (
                    <motion.div
                      ref={menuRef}
                      className="absolute top-8  mt-2 w-48 bg-white shadow-lg rounded-lg text-black flex flex-col gap-y-2 p-2 z-50 "
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      {!need && (
                        <>
                          <button
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                            onClick={() => {
                              setShare(true);
                              setOpenMenuId(null); // Close menu after selecting
                            }}
                          >
                            {/* <Users className="h-4" /> */}
                            <img
                              src={shareicondesignee}
                              alt=""
                              className="h-4"
                            />
                            Share
                          </button>

                          <button
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                            onClick={() => {
                              setAccess(true);
                              setOpenMenuId(null); // Close menu after selecting
                            }}
                          >
                            {/* <Folder className="h-4" /> */}
                            <img src={foldericon} alt="" className="h-4" />
                            Access
                          </button>

                          <button
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                            onClick={() => {
                              handleEditFile(file);
                              setOpenMenuId(null);
                              setEditFileId(file._id);
                              setTempFName(file.file_name); // Close menu after selecting
                            }}
                          >
                            {/* <Edit className="h-4" /> */}
                            <img src={editicon} alt="" className="h-4 " />
                            Edit
                          </button>

                          <button
                            className="flex items-center gap-2 text-gray-600 hover:text-red-500"
                            onClick={() => {
                              setDeletebutton(true);
                              setSelectedFileId(file._id); // Set the file ID to the state
                              setOpenMenuId(null); // Close menu after selecting
                            }}
                          >
                            {/* <Trash2 className="h-4" /> */}
                            <img src={trashicon} alt="" className="h-4" />
                            Delete
                          </button>
                        </>
                      )}

                      <button
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                        onClick={() => {
                          fetchFileContent(file._id);
                          setOpenMenuId(null); // Close menu after selecting
                        }}
                      >
                        {/* <Eye className="h-4" /> */}
                        <img src={eyeicon} alt="" className="h-4 " />
                        View Content
                      </button>
                      <button
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                        onClick={() => {
                          handleDownloadFile(file._id);
                          setOpenMenuId(null); // Close menu after selecting
                        }}
                      >
                        {/* <Download className="h-4" /> */}
                        <img src={downloadicon} alt="" className="h-4" />
                        Download
                      </button>
                    </motion.div>
                  )}
                </div>

                <span
                  className="overflow-hidden"
                  style={{ maxWidth: "200px" }} // Adjust the width as needed
                >
                  <p
                    className="text-lg text-gray-600 truncate"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {file.folder_name}
                  </p>
                </span>

                <span className="">
                  <p className=" text-[1rem] text-gray-600  ">
                    {file.date_of_upload &&
                    !isNaN(new Date(file.date_of_upload))
                      ? new Date(file.date_of_upload).toLocaleString("en-US", {
                          weekday: "short",

                          year: "numeric",

                          month: "short",

                          day: "numeric",

                          hour: "numeric",

                          minute: "numeric",

                          // second: 'numeric',

                          hour12: true, // for 24-hour format
                        })
                      : "Invalid Date"}
                  </p>
                </span>

                <span className="flex items-center gap-1">
                  Contact:
                  <p className="text-xs text-gray-600">{file.folder_contact}</p>
                </span>

                <div className="mt-2 flex gap-2"></div>
              </div>
            ))}
        </div>
      )}

      {/* Upload Modal */}

      {isUploading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 mx-2 rounded shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Upload File</h2>

              <button onClick={() => setIsUploading(false)}>
                <X className="w-5 h-5 text-gray-700 hover:text-red-500" />
              </button>
            </div>

            <div className="border-dashed border-2 border-blue-500 p-4 text-center">
              <div className="flex justify-center">
                <img src={upload} alt="" className="h-10 w-10" />
              </div>

              <label className="block text-gray-600 mb-1">
                Drag your files to start uploading
              </label>

              <div className="relative flex items-center my-2">
                <hr className="flex-grow border-gray-300" />

                <p className="px-2 text-gray-500 text-lg">or</p>

                <hr className="flex-grow border-gray-300" />
              </div>

              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />

              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Browse Files
              </label>
            </div>

            <div className="text-gray-400 text-sm">
              {/* <p>Only support .jpg, .png, .svg and zip files</p> */}
            </div>

            {/* Show Progress Bar for Files Being Uploaded */}

            <div className="mt-4 space-y-2">
              {uploadQueue.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center"
                >
                  <div className="w-3/4">
                    <p className="font-medium">{file.name}</p>

                    {file.isUploading && (
                      <div className="bg-gray-200 w-full h-2 rounded overflow-hidden">
                        <div
                          className="bg-blue-500 h-2"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!file.isUploading && (
                      <>
                        <button
                          className="text-blue-500 border-2 border-blue-500 p-0.5 px-2 rounded-md hover:text-blue-700"
                          onClick={() => handleEditFile(file)}
                        >
                          Edit
                        </button>

                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => handleDeleteFile(file.name)}
                        >
                          {/* <Trash2 className="stroke-red-600 h-10" /> */}

                          <img src={trashicon} alt="" className="h-6" />

                          <img src={trashicon} alt="" className="h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 my-2">
              <button
                onClick={() => clear()}
                className="border-dashed border-2 border-blue-500 text-blue-700 px-4 py-2 rounded hover:bg-blue-500 hover:text-white"
              >
                Cancel
              </button>

              {isLoading ? (
                <button
                  type="submit"
                  className="cursor-not-allowed flex justify-center  bg-blue-400  px-7 py-2 rounded-md text-white"
                >
                  <Loader2 className="animate-spin h-4 w-6 font-bold" />
                </button>
              ) : (
                <button
                  type="submit"
                  className=" bg-blue-500 text-white  px-5 py-2 rounded-md hover:bg-blue-600 transition "
                  onClick={uploadFileToServer}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit File Modal */}

      {editFile && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit File</h2>

              <button onClick={() => clear()}>
                <X className="w-5 h-5 text-gray-700 hover:text-red-500" />
              </button>
            </div>

            {/* Title Field (instead of File Name) */}

            {/* File Name Input */}

            <input
              type="text"
              value={inputFileName} // Bind the input to `inputFileName` state
              onChange={(e) => setInputFileName(e.target.value)} // Update `inputFileName` state when the user types
              className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Description Field */}

            <div className="mt-2">
              <label className="block text-gray-600 mb-1">Description</label>

              <textarea
                value={editFile.description || ""} // Add description if it exists
                onChange={(e) =>
                  setEditFile({ ...editFile, description: e.target.value })
                }
                className="w-full border p-2 rounded"
                rows="1"
              ></textarea>
            </div>

            {/* Folder Dropdown */}

            <div className="mt-2">
              <label className="block text-gray-600 mb-1">Folder</label>

              {loading ? (
                <p>Loading folders...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <div>
                  {/* If folder is selected, show dropdown to allow folder change */}

                  {selectedFolderId ? (
                    <div className="flex flex-col">
                      <label className="block mb-2">Selected Folder</label>

                      <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        className="w-full border p-2 rounded"
                      >
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    // If no folder is selected, display buttons for folder selection

                    <div className="flex flex-col">
                      <label className="block">
                        Select a Folder to Upload File:
                      </label>

                      <div className="grid grid-cols-3 gap-2">
                        {folders.map((folder) => (
                          <button
                            key={folder.id}
                            className="border p-2 rounded text-center"
                            onClick={() => handleFolderSelect(folder.id)}
                          >
                            {folder.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags Input */}

            <div className="mt-2">
              <label className="block text-gray-600 mb-1">Tags</label>

              <div className="relative">
                <input
                  type="text"
                  value={editFile.tag} // Bind the input value to the editFile.tag state
                  onChange={(e) =>
                    setEditFile({ ...editFile, tag: e.target.value })
                  } // Update tag state when the input changes
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "+" || e.key === " ") {
                      e.preventDefault();

                      const newTag = editFile.tag.trim();

                      if (newTag && !editFile.tag.split(",").includes(newTag)) {
                        setTags((prevTags) => [...prevTags, newTag]); // Add new tag to the tags state

                        setEditFile({ ...editFile, tag: "" }); // Clear input field after adding tag
                      }
                    }
                  }}
                  className="w-full border p-2 rounded"
                  placeholder="Add multiple tags"
                />

                <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center">
                  <button
                    onClick={() => {
                      const newTag = editFile.tag.trim();

                      if (newTag && !editFile.tag.split(",").includes(newTag)) {
                        setEditFile({
                          ...editFile,

                          tag: `${editFile.tag},${newTag}`,
                        });
                      }
                    }}
                    className="text-gray-700 hover:text-blue-500"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Displaying tags */}

              {editFile.tag && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {editFile.tag.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center"
                    >
                      {tag.trim()}

                      <button
                        onClick={() => {
                          const tags = editFile.tag

                            .split(",")

                            .filter((t) => t.trim() !== tag.trim());

                          setEditFile({ ...editFile, tag: tags.join(",") });
                        }}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}

            <div className="flex justify-end gap-2 my-2">
              <button
                onClick={
                  () => clear2() // setSelectedFolderId('');
                }
                className="border-2 border-blue-500 text-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSaveEdit(editFile)}
                className="bg-blue-500 text-white px-6 py-2 rounded flex items-center gap-2"
              >
                {/* <ArrowRight className="w-4 h-4" /> */}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {share && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="mt-4 bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                Share <span className="text-blue-600">File</span>
              </h2>

              <button onClick={() => setShare(null)}>
                <X className="w-5 h-5 text-gray-700 hover:text-red-500" />
              </button>

              {/* <i

                                      className="fas fa-times cursor-pointer bg-black"

                                      onClick={() => setShareFileVisible(null)} // Close form

                                  ></i> */}
            </div>

            <div className="mb-4">
              <AsyncSearchBar setCollabs={setCollabs} />
              {/* <input

              type="text"

              placeholder="Add designee, members"

              className="w-full border border-blue-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"

              value={designee}

              onChange={handleDesigneeChange}

            /> */}
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold">People with access</h3>

              {people.map((person, index) => (
                <div className="flex items-center mt-2" key={index}>
                  <img
                    src="https://placehold.co/40x40"
                    alt={`Profile picture of ${person.name}`}
                    className="w-10 h-10 rounded-full mr-3"
                  />

                  <div>
                    <p className="font-semibold">
                      {person.name} ({person.role && person.role})
                    </p>

                    <p className="text-sm text-gray-500">{person.email}</p>
                  </div>

                  {person.role === "Owner" ? (
                    <p className="text-gray-500 text-sm">{person.permission}</p>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowDropdown(showDropdown === index ? null : index)
                        }
                        className="text-blue-500 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        {permission[index]}
                      </button>

                      {showDropdown === index && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-70">
                          <p
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              setPermission1(index, "view", person.user_id)
                            }
                          >
                            Only View
                          </p>

                          <p
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              setPermission1(index, "edit", person.user_id)
                            }
                          >
                            Edit Access
                          </p>

                          <p
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              setPermission1(index, "delete", person.user_id)
                            }
                          >
                            Remove Access
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* {person.role && (

                  <span className="ml-auto text-gray-500">{person.role}</span>

                )} */}
                </div>
              ))}
            </div>

            <div className="mb-4">
              <textarea
                placeholder="Message"
                className="w-full border border-blue-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={message}
                onChange={handleMessageChange}
              ></textarea>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="notify"
                checked={notify}
                onChange={handleNotifyChange}
                className="mr-2"
              />

              <label htmlFor="notify" className="text-sm">
                Notify people
              </label>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {shareFolderModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="mt-4 bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                Share <span className="text-blue-600">Folder</span>
              </h2>

              <button onClick={() => setShareFolderModal(false)}>
                <X className="w-5 h-5 text-gray-700 hover:text-red-500" />
              </button>

              {/* <i

                                        className="fas fa-times cursor-pointer bg-black"

                                        onClick={() => setShareFileVisible(null)} // Close form

                                    ></i> */}
            </div>

            <div className="mb-4">
              <AsyncSearchBar setCollabs={setCollabs} />
              {/* <input

                type="text"

                placeholder="Add designee, members"

                className="w-full border border-blue-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"

                value={designee}

                onChange={handleDesigneeChange}

              /> */}
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold">People with access</h3>

              {people.map((person, index) => (
                <div className="flex items-center mt-2" key={index}>
                  <img
                    src="https://placehold.co/40x40"
                    alt={`Profile picture of ${person.name}`}
                    className="w-10 h-10 rounded-full mr-3"
                  />

                  <div>
                    <p className="font-semibold">
                      {person.name} ({person.role && person.role})
                    </p>

                    <p className="text-sm text-gray-500">{person.email}</p>
                  </div>

                  {person.role === "Owner" ? (
                    <p className="text-gray-500 text-sm">{person.permission}</p>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowDropdown(showDropdown === index ? null : index)
                        }
                        className="text-blue-500 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        {permission[index]}
                      </button>

                      {showDropdown === index && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-70">
                          <p
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              setPermission1(index, "view", person.user_id)
                            }
                          >
                            Only View
                          </p>

                          <p
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              setPermission1(index, "edit", person.user_id)
                            }
                          >
                            Edit Access
                          </p>

                          <p
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              setPermission1(index, "delete", person.user_id)
                            }
                          >
                            Remove Access
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* {person.role && (

                    <span className="ml-auto text-gray-500">{person.role}</span>

                  )} */}
                </div>
              ))}
            </div>

            <div className="mb-4">
              <textarea
                placeholder="Message"
                className="w-full border border-blue-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={message}
                onChange={handleMessageChange}
              ></textarea>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="notify"
                checked={notify}
                onChange={handleNotifyChange}
                className="mr-2"
              />

              <label htmlFor="notify" className="text-sm">
                Notify people
              </label>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmitFolder}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {access && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="mt-4 bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">
                Share <span className="text-blue-500">File</span>
              </h2>

              <button
                onClick={() => setAccess(null)}
                className="p-2 rounded-full "
              >
                <X className="w-6 h-4 text-gray-700 hover:text-red-500" />
              </button>
            </div>

            <div className="mb-6">
              <AsyncSearchBar setCollabs={setCollabs} />
              {/* <input
                type="text"
                placeholder="Add designee, members"
                className="w-full p-3 border border-blue-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
              /> */}
              <button
                // onClick={addUser}     setShowDesignerPopup(true);

                className="mt-4 w-full p-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">People with access</h3>

              {users.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="flex items-center">
                    <img
                      src="https://placehold.co/40"
                      alt="User avatar"
                      className="w-12 h-12 rounded-full mr-4"
                    />

                    <div>
                      <p className="font-semibold text-lg">{user.name}</p>

                      <p className="text-gray-600 text-sm">{user.email}</p>
                    </div>
                  </div>

                  {user.role === "Owner" ? (
                    <p className="text-gray-500 text-sm">{user.permission}</p>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowDropdown(showDropdown === index ? null : index)
                        }
                        className="text-blue-500 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        {user.permission}
                      </button>

                      {showDropdown === index && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-70">
                          <p
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => updatePermission(index, "Only View")}
                          >
                            Only View
                          </p>

                          <p
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              updatePermission(index, "Edit Access")
                            }
                          >
                            Edit Access
                          </p>

                          <p
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => removeUser(index)}
                          >
                            Remove Access
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                Are you sure to delete this file?
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
                  deleteFile(selectedFileId);

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
                onClick={() => setDeletebutton1(false)}
                className="border-2 border-blue-500 text-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <NavLink to="/Subscription">
                <button
                  className="bg-blue-500 text-white px-6 py-2 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setDeletebutton1(false)}
                >
                  Take Membership
                </button>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {showDesignerPopup && (
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
                  <Camera className="h-4 w-6" />
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
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Invite to Cumulus
            </button>
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {showOverlay && renderOverlay()}

      <div>
        {/* Dashboard content */}
        <DesignerPopup
          isVisible={showDesignerPopup}
          onClose={closePopup}
          designeeName={designeeName}
          setDesigneeName={setDesigneeName}
          designeePhone={designeePhone}
          setDesigneePhone={setDesigneePhone}
          designeeEmail={designeeEmail}
          setDesigneeEmail={setDesigneeEmail}
          handleAddDesignee={handleAddDesignee}
        />
      </div>
    </div>
  );
};

export default Dashboard;

const AsyncSearchBar = ({ setCollabs }) => {
  //set default query terms
  const [query, setQuery] = useState("");

  // fetch filteres search results for dropdown
  const loadOptions = async () => {
    return new Promise((resolve, reject) => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      axios
        .get(`${API_URL}/api/auth/get-all-users?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log(response.data.user);
          // Map the API response to the format expected by AsyncSelect
          const formattedOptions = response.data.user
            .map((data) => {
              if (data._id == storedUser) {
                // Skip 'admin' users
                return null;
              }
              return {
                label: data.username,
                value: data._id,
              };
            })
            .filter((item) => item !== null); // Remove any null values

          resolve(formattedOptions); // Resolve the promise with formatted data
        })
        .catch((error) => {
          reject(error); // Handle errors if necessary
        });
    });
  };

  return (
    <>
      <AsyncSelect
        cacheOptions
        isMulti
        getOptionLabel={(e) => e.label}
        getOptionValue={(e) => e.value}
        loadOptions={loadOptions}
        onInputChange={(value) => setQuery(value)}
        onChange={(value) => setCollabs(value)}
      />
    </>
  );
};
