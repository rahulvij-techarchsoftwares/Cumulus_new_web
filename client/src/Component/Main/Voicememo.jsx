import React, { useState, useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowRight, Menu, LayoutGrid, X, ChevronDown, Users, Edit, Eye, Trash2, EllipsisVertical, Download, Search } from 'lucide-react';
import Cookies from 'js-cookie';
import fetchUserData from './fetchUserData';
import play from "../../assets/Play.png"
import { NavLink } from "react-router-dom";
// import VoiceLogo from '../../assets/VoiceLogo.png';
// import voicepage from '../../assets/voicepage.png';
import mainmic from "../../assets/mainmic.png"
import editicon from "../../assets/editicon.png";
import shareicondesignee from "../../assets/shareicondesignee.png";
import foldericon from "../../assets/foldericon.png";
import eyeicon from "../../assets/eyeicon.png";
import trashicon from "../../assets/trashicon.png";
import downloadicon from "../../assets/downloadicon.png";

import { API_URL } from '../utils/Apiconfig';
import axios from 'axios'; // For API integration
const Voicememo = ({ searchQuery }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [username, setUsername] = useState("");
  // const [isRecording, setIsRecording] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Toggle for popup
  const [popupIndex, setPopupIndex] = useState(null);
  const popupRef = useRef(null);
  const [audioURL, setAudioURL] = useState(null);
  const [audioName, setAudioName] = useState('');
  const [audioFiles, setAudioFiles] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [frequencyData, setFrequencyData] = useState([]);
  const [isStopped, setIsStopped] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null); // Reference to the audio element
  const [expandedRow, setExpandedRow] = useState(null);
  const [message, setMessage] = useState(null); // Added for feedback messages
  const [deletebutton, setDeletebutton] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0); // Timer state
  const startTimeRef = useRef(null); // Ref to track recording start time
  const durationRef = useRef(null); // Ref to track duration
  const timerRef = useRef(null); // Reference to the timer
  const [designee, setDesignee] = useState("");
  const [share, setShare] = useState("");
  const [notify, setNotify] = useState(true);
  const [people, setPeople] = useState([]);
  const [isMembershipActive, setIsMembershipActive] = useState(false);
  const [membershipDetail, setMembershipDetail] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null); // For handling errors
  const [deletebutton1, setDeletebutton1] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [users, setUsers] = useState([]);
  const [MobilesearchQuery, MobilesetSearchQuery] = useState("");



  const [editsMode, setEditsMode] = useState(null);
  const [newVoicesName, setNewVoicesName] = useState("");

  const handleEdits = (id, currentName) => {
    setEditsMode(id);
    setNewVoicesName(currentName);
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
        fetchAudioFiles();
        // Optionally, refresh the list of files
      } else {
        alert(result.error || "Failed to update voice name");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating voice name");
    }
  };




  const handleEllipsisClick = (index) => {
    setPopupIndex(index);
    setIsPopupOpen((prev) => (popupIndex === index ? !prev : true));
  };

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
        setUsername(data.user.username);
        console.log("details", data.user.membershipDetail);
        console.log("membership", data.user.isMembershipActive);
      } catch (err) {
        setError(err.message || "Failed to fetch user data");
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedEmail = localStorage.getItem("email");

    console.log("krcnjrncirc", storedUser);
    console.log("krcnjrncirc", storedEmail);

    setPeople([{ name: `${username} (you)`, email: storedEmail, role: "Owner" }]);
    setUsers([{ name: `${username} (you)`, email: storedEmail, role: "Owner" }]);
  }, []);
  const handleToggleRecording = () => {
    if (!isRecording && !isStopped) {
      // Start recording
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        audioChunks.current = [];
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
          startTimeRef.current = Date.now();
        };

        // Web Audio API for frequency analysis
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const drawFrequency = () => {
          analyser.getByteFrequencyData(dataArray);
          setFrequencyData([...dataArray]);
          animationFrameRef.current = requestAnimationFrame(drawFrequency);
        };
        drawFrequency();
        setIsRecording(true);
        setShowPopup(true);

        timerRef.current = setInterval(() => {
          setDuration((prevTime) => prevTime + 1);
        }, 1000);
      });
    } else if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);

          // Calculate duration
          const endTime = Date.now();
          durationRef.current = Math.round((endTime - startTimeRef.current) / 1000);

          setIsRecording(false);
          setIsStopped(true); // Recording stopped
          cancelAnimationFrame(animationFrameRef.current);

          // Stop all audio tracks to turn off the microphone
          if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
          }

          if (audioContextRef.current) {
            audioContextRef.current.close();
          }

          // Stop the timer
          clearInterval(timerRef.current);
        };
      }
    } else if (isStopped) {
      // Re-recording
      setIsStopped(false);
      setAudioURL(null); // Clear the previous audio URL
      // setElapsedTime(0); // Reset elapsed time
      setDuration((prevTime) => prevTime + 1);
      console.log(duration);
      console.log(setDuration);

    }
  };
  const handleSubmit = () => {
    // alert(`Designee: ${designee}\nMessage: ${message}\nNotify: ${notify}`);
    setShare(false);
  };

  const handleDesigneeChange = (e) => setDesignee(e.target.value);
  const handleMessageChange = (e) => setMessage(e.target.value);
  const handleNotifyChange = () => setNotify(!notify);
  const fetchAudioFiles = async () => {
    try {
      // const token = Cookies.get('token');
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found. Please log in.");
        return;
      }

      const response = await axios.get(`${API_URL}/api/voice-memo/get-recordings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setAudioFiles(response.data);
      }
    } catch (error) {
      console.error('Error fetching audio files:', error);
    }
  };

  // const handlePlay = (audio) => {
  //   if (audioRef.current) {
  //     audioRef.current.src = audio.url;
  //     audioRef.current.play();
  //     setCurrentAudio(audio); // Set the current audio being played
  //   }
  // };
  const handlePlay = async (file) => {
    try {
      // const token = Cookies.get('token');
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/voice-memo/listen-recording`,
        { voice_id: file._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { audio_url, voice_name } = response.data;

      if (!audio_url) {
        console.error("Audio URL is missing");
        return;
      }

      // Set the current audio for the popup without playing it
      setCurrentAudio({ url: audio_url, name: voice_name });
    } catch (err) {
      console.error("Error fetching audio:", err);
    }
  };



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



  const saveRecording = async () => {
    setError("");
    if (audioName.trim() === '') {
      setError('Please enter a name for the recording.');
      return;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setError('Please stop the recording before saving.');
      return;
    }

    try {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' });
      // const token = Cookies.get('token');
      const token = localStorage.getItem("token");

      if (!token) {
        alert('No token found. Please log in.');
        return;
      }

      if (isNaN(duration) || duration <= 0) {
        setError('Invalid audio duration.');
        return;
      }

      const formData = new FormData();
      formData.append('voice_name', audioName);
      formData.append('voice_file', audioBlob);
      formData.append('duration', duration);

      const response = await axios.post(
        `${API_URL}/api/voice-memo/upload-voice`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const { fileName, size, date } = response.data;

        // Update the audio files list with the new recording
        setAudioFiles((prev) => [
          ...prev,
          { name: fileName, size, date, url: audioURL },
        ]);

        // Resetting after save
        setAudioURL(null);
        setAudioName('');
        setShowPopup(false);
        setDuration(0); // Reset duration
        audioChunks.current = []; // Clear recorded chunks
        mediaRecorderRef.current = null; // Reset media recorder
        startTimeRef.current = null; // Reset start time

        fetchAudioFiles(); // Fetch updated list after saving
      } else {
        console.error(`Unexpected response: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving recording:', error.response || error.message);
      alert('Failed to save recording. Please try again.');
    }
  };
  // Fetch audio files on component mount
  useEffect(() => {
    fetchAudioFiles();
  }, []);

  const deleteFile = async (folderId) => {
    // const token = Cookies.get('token');
    const token = localStorage.getItem("token");
    const selectedvoice = folderId;

    console.log("Token:", token);
    console.log("File ID to delete:", selectedvoice);

    if (!token) {
      setMessage("No token found. Please log in.");
      console.error("Missing token");
      return;
    }

    if (!selectedvoice) {
      setMessage("No file selected to delete.");
      console.error("Missing selectedvoice");
      return;
    }

    try {
      // Send the voice_id in the JSON body
      const response = await axios.delete(`${API_URL}/api/voice-memo/delete-voice`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // JSON content type
        },
        data: {
          voice_id: selectedvoice, // Add the voice_id in the body
        },
      });

      setMessage(response.data.message || "File deleted successfully.");
      fetchAudioFiles();
      setDeletebutton(false);
    } catch (error) {
      console.error("Error response:", error.response || error);
      setMessage(error.response?.data?.message || "Error deleting file.");
    }
  };




  // Helper function to calculate the duration of the audio (returns a number)
  // async function calculateAudioDuration(audioBlob) {
  //   return new Promise((resolve, reject) => {
  //     const audio = new Audio(URL.createObjectURL(audioBlob));
  //     audio.onloadedmetadata = () => {
  //       // Ensure duration is a number before returning it
  //       const duration = audio.duration;
  //       if (!isNaN(duration)) {
  //         resolve(duration);
  //       } else {
  //         reject('Invalid audio duration');
  //       }
  //     };
  //     audio.onerror = (e) => reject('Error loading audio');
  //   });
  // }

  useEffect(() => {
    if (canvasRef.current && frequencyData.length) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      frequencyData.forEach((value, index) => {
        const barWidth = (width / frequencyData.length) * 1.5;
        const barHeight = (value / 255) * height;
        const x = index * barWidth;
        ctx.fillStyle = '#4A90E2';
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      });
    }
  }, [frequencyData]);
  useEffect(() => {
    // fetchAudioFiles(); // Fetch audio files on component mount
  }, []);

  // const getAudioDuration = (url) => {
  //   return new Promise((resolve) => {
  //     const audio = new Audio(url);
  //     audio.onloadedmetadata = () => {
  //       resolve(audio.duration); // Get the duration of the audio file
  //     };
  //   });
  // };

  // useEffect(() => {
  //   const fetchDurations = async () => {
  //     const durations  = {};
  //     for (let file of audioFiles) {
  //       const duration = await getAudioDuration(file.url);
  //       durations[file.url] = duration;
  //     }
  //     setAudioDurations(durations);
  //   };

  //   fetchDurations();
  // }, [audioFiles]);

  const handleToggleRow = (_id) => {
    console.log("Toggling row with id:", _id); // Log the ID when toggling the row
    setExpandedRow((prev) => {
      const newExpandedRow = prev === _id ? null : _id;
      console.log("Updated expandedRow:", newExpandedRow); // Log the new expandedRow value
      return newExpandedRow;
    });
  };
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

  // const handleMobileSearchChange = (e) => {
  //   MobilesetSearchQuery(e.target.value.toLowerCase());
  // };
  console.log(audioFiles);
  const filteredMobileFiles = audioFiles.filter((file) =>
    (file.voice_name || '').toLowerCase().includes(MobilesearchQuery.toLowerCase())
  );
  const filteredFiles = audioFiles.filter((file) =>
    (file.voice_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
        setPopupIndex(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  

  return (
    <div className="mt-1 p-2 sm:p-4 max-h-screen bg-white overflow-hidden">

      <div className="w-full mt-2 flex items-center border border-gray-300 rounded-lg p-2 md:hidden">
        <Search className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="w-full p-1 bg-transparent outline-none text-black"
          onChange={(e) => MobilesetSearchQuery(e.target.value)}

        />
      </div>

      <div className="flex flex-col ">
        <h1 className="text-2xl font-normal text-[#1F1F1F]">Your Voice Memo</h1>
        <div
          className="bg-[#0067FF] w-52 rounded-2xl my-2 p-2 cursor-pointer space-y-0 sm:space-y-1"


          onClick={() => {
            if (isMembershipActive) {
              setShowPopup(true);
            } else {
              setDeletebutton1(true);
            }
          }}
        >
          <button className="flex items-center  text-white px-2">
            {/* <img src={VoiceLogo} alt="" className="h-12 w-12" /> */}
            <img src={mainmic} alt="" className='h-10' />
            <p className="text-xl">Record Now</p>
          </button>
          <div className="flex justify-between">
            <p className="text-white  text-sm ml-1">Click to record now</p>
            <ArrowRight className="mr-2 text-white" />
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed top-1/2 sm:top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 sm:p-6 shadow-lg rounded-lg w-2/3 sm:w-[25%]">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">
              {isRecording ? 'Recording in Progress' : 'Ready to Record'}
            </h2>
            <div onClick={() => {
              // Close the popup
              setShowPopup(false);

              // Stop the media recording and the microphone access
              if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.onstop = () => {
                  // Clean up and reset states related to the recording
                  audioChunks.current = []; // Clear recorded chunks
                  mediaRecorderRef.current = null; // Reset media recorder
                  startTimeRef.current = null; // Reset start time
                  setAudioURL(null); // Clear audio URL
                  setAudioName(''); // Reset the audio name
                  setDuration(0); // Reset duration
                  setIsRecording(false); // Set the recording status to false
                  setIsStopped(true); // Mark recording as stopped
                };
              }

              // Stop the microphone stream
              if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
              }

              // Close the audio context to stop any Web Audio API processes
              if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null; // Clean up
              }

              // Stop the frequency analysis animation frame
              if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
              }

              // Reset any other states
              setAudioURL(null); // Ensure the audio URL is cleared
              fetchAudioFiles(); // Fetch updated list after saving or clearing
            }} className="cursor-pointer">
              <X />
            </div>

          </div>
          <p className="mt-2 text-gray-600">
            {isStopped ? 'Click Re-Record to Restart the Recording.' : isRecording ? 'Recording in progress...' : 'Click Start to begin recording.'}
          </p>

          {/* {isRecording && (
            
          )} */}

          {isRecording && (
            <div className="mt-3">
              <canvas ref={canvasRef} className="w-full h-24 bg-gray-100 rounded-md"></canvas>
            </div>
          )}

          <p className="mt-2 text-gray-600">
            Time: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
          </p>

          <button
            onClick={handleToggleRecording}
            className={`mt-4 px-4 py-2 rounded-md text-white w-full ${isRecording || isStopped ? 'bg-[#0067FF]' : 'bg-[#0067FF]'}`}
          >
            {isStopped ? 'Re-recording' : isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>


          <div className="mt-4">
            <label htmlFor="voice">Enter voice name</label>
            <input
              type="text"
              placeholder="Enter voice memo name"
              value={audioName}
              onChange={(e) => setAudioName(e.target.value)}
              className="p-2 border rounded-md w-full"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>} {/* Inline error message */}
            <button
              onClick={saveRecording}
              className="mt-4 px-4 py-2 bg-[#0067FF] text-white rounded-md w-full"
            >
              Save
            </button>
          </div>

          {/* {!isRecording &&  (
            <div className="mt-4">
              <label htmlFor="voice">Enter voice name</label>
              <input
                type="text"
                placeholder="Enter voice memo name"
                value={audioName}
                onChange={(e) => setAudioName(e.target.value)}
                className="p-2 border rounded-md w-full"
              />
              <button
                onClick={saveRecording}
                className="mt-4 px-4 py-2 bg-[#0067FF] text-white rounded-md w-full"
              >
                Save
              </button>
            </div>
          )} */}
        </div>
      )}

      <div className=" block mt-2">
        <h2 className="text-xl font-bold">Voices Library</h2>
      </div>


      <div className=" justify-between items-center mt-8 hidden">
        <h2 className="text-xl font-bold">Voices Library</h2>
        {/* <button
          onClick={() => setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'))}
          className="px-4 py-2 bg-[#0067FF] text-white rounded-md flex"
        >
          {viewMode === 'list' ? <LayoutGrid className="h-5" /> : <Menu className="h-6" />}
          {viewMode === 'list' ? 'Grid View' : 'List View'}
        </button> */}
      </div>


      {/* view voice  */}
      <>
        <div className="mt-2 bg-white hidden md:flex text-left border-collapse overflow-y-scroll max-h-[70vh] pb-[20px]">
          <table className="w-full">
          <thead>
              <tr className="border-t border-b bg-gray-100 text-left text-[0.8rem] md:text-lg">
                <th className="p-3 font-semibold text-[#667085] text-sm">Voice Name</th>
                <th className="p-2 font-semibold text-[#667085] text-sm">Duration</th>
                <th className="p-2 font-semibold text-[#667085] text-sm">Date Uploaded</th>
                <th className="p-2 font-semibold text-[#667085] text-sm">File Size</th>
                <th className="p-2 font-semibold text-[#667085] text-sm"></th>
              </tr>
            </thead>
            <tbody>

              {filteredFiles.map((file, index) => (
                <React.Fragment key={file._id}>
                  {/* Main Row */}
                  <tr
                    className={`text-xs text-[#212636] font-medium sm:text-sm border-b-2 ${expandedRow === file._id ? "bg-blue-100 border-blue-100" : ""
                    } transition-all duration-100`}
                  >
                    <td className="p-0 md:p-4 flex items-center gap-0 md:gap-2">
                      <button
                        className="text-gray-500 hover:text-gray-800"
                        onClick={() => handleToggleRow(file._id)}
                      >
                        <ChevronDown
                          className={`${expandedRow === file._id ? "rotate-180" : ""
                            } h-5 transition-transform`}
                        />
                      </button>

                      {editsMode === file._id ? (
                        <div className="flex items-center gap-2 border-b-2 border-blue-500 pt-2">
                          <input
                            type="text"
                            value={newVoicesName}
                            onChange={(e) => setNewVoicesName(e.target.value)}
                            className="border rounded px-2 py-1 text-sm w-full bg-transparent outline-none"
                          />
                          <button
                            className="text-blue-500 hover:text-blue-700 px-3 py-1 bg-gray-100 rounded-md bg-transparent"
                            onClick={() => handleSaveEdits(file._id)}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <h2 className='text-sm font-normal'> {file.voice_name}</h2>

                      )}
                    </td>
                    <td className="p-0 md:p-4 text-sm text-[#212636]">
                      <div
                        className={`bg-[#EEEEEF] rounded-md px-3 py-1 text-sm text-[#212636] inline-block transition-all duration-300 ${expandedRow ? "bg-white" : "bg-[#EEEEEF]"
                          }`}
                      >
                        {file.duration} sec
                      </div>
                    </td>
                    <td className="p-0 md:p-4">
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {file.date_of_upload && !isNaN(new Date(file.date_of_upload))
                          ? new Date(file.date_of_upload).toLocaleString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          })
                          : "Invalid Date"}
                      </p>
                    </td>
                    <td className="p-0 md:p-4">
                      <span
                        className={`bg-[#EEEEEF] p-2 rounded-md ${expandedRow ? "bg-white" : "bg-[#EEEEEF]"
                          }`}
                      >
                        {file.file_size} Kb
                      </span>
                    </td>
                    <td className="p-0 md:p-4">
                      <button
                        onClick={() => handlePlay(file)}
                        className={`px-2 py-1 bg-[#EEEEEF] text-black font-semibold rounded-md ${expandedRow ? "bg-white" : "bg-[#EEEEEF]"
                          }`}
                      >
                        <span className="flex">
                          <img src={play} alt="" className="h-5 gap-1" />
                          Play
                        </span>
                      </button>
                    </td>
                  </tr>
                  {/* Expanded Row */}
                  {expandedRow === file._id && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 pb-4 border-r border-blue-100 bg-blue-100 rounded-bl-3xl rounded-br-3xl"
                      >
                        <div className="flex gap-4 items-center">
                          {/* <button
                            className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500"
                            onClick={() => setShare(true)}
                          >
                            <img src={shareicondesignee} alt="" className="h-4 " />
                            
                            <span className="absolute bottom-[-40px] z-40 left-2/3 transform -translate-x-1/2 hidden group-hover:block bg-white w-24 text-black text-xs py-1 px-2 rounded shadow">
                              Share with Designee
                            </span>
                          </button> */}
                          <button
                            className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500"
                            onClick={() => handleEdits(file._id, file.voice_name)}

                          >
                            <img src={editicon} alt="" className="h-4 " />
                            {/* <Edit className="h-4" /> */}
                            <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white w-24 text-black text-xs py-1 px-2 rounded shadow">
                              Edit Document
                            </span>
                          </button>
                          <button
                            className="relative group flex items-center gap-2 text-gray-600 hover:text-red-500"
                            onClick={() => {
                              setSelectedFileId(file._id);
                              setDeletebutton(true);
                            }}
                          >
                            <img src={trashicon} alt="" className="h-4 " />
                            {/* <Trash2 className="h-4 text-red-700" /> */}
                            <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white text-black text-xs py-1 px-2 rounded shadow">
                              Delete
                            </span>
                          </button>

                          <button
                            className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500"
                            onClick={() => handleDownloadFile(file._id)}
                          >
                            <img src={downloadicon} alt="" className="h-4 " />
                            {/* <Download className="h-4" /> */}
                            <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white text-black text-xs py-1 px-2 rounded shadow">
                              Download
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>

              ))}
            </tbody>
          </table>
        </div>
      </>


      <div className="md:hidden grid grid-cols-1 gap-y-3 gap-x-2 mt-4 overflow-y-scroll max-h-[60vh] scroll-smooth">
      
        {filteredMobileFiles.map((file, index) => (
          <div
            key={index}
            className="border p-3 sm:p-3 rounded-md flex flex-col justify-between"
          >
            {/* File Header */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={play}
                  alt=""
                  className="h-6"
                  onClick={() => handlePlay(file)}
                />

                {editsMode === file._id ? (
                  <div className="flex items-center gap-1 border-b-2 border-blue-500 pt-2">
                    <input
                      type="text"
                      value={newVoicesName}
                      onChange={(e) => setNewVoicesName(e.target.value)}
                      className="border rounded px-2 py-1 text-sm w-full bg-transparent outline-none"
                    />
                    <button
                      className="text-blue-500 hover:text-blue-700 px-1 py-1 bg-gray-100 rounded-md bg-transparent"
                      onClick={() => handleSaveEdits(file._id)}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h3 className="font-bold text-xl">{file.voice_name}</h3>
                )}
              </div>

              {/* Ellipsis Icon */}
              <div className="relative flex">
                <p className="text-gray-700 text-sm mr-4 text-center pt-1 w-12 bg-[#EEEEEE] rounded-lg">
                  {file.file_size}
                </p>
                <button
                  className="cursor-pointer"
                  onClick={() => handleEllipsisClick(index)}
                >
                  <EllipsisVertical />
                </button>

                {/* Popup Menu */}
                {isPopupOpen && popupIndex === index && (
                  <motion.div
                    ref={popupRef}
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute top-8 right-0 z-10 bg-white shadow-md rounded-md p-2 w-40 flex flex-col gap-2"
                  >
                    <button
                      className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500"
                      onClick={() => alert("Share")}
                    >
                      <img src={shareicondesignee} alt="" className="h-4" />
                      Share
                    </button>
                    {/* <button className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500">
                <img src={editicon} alt="" className="h-4" />
                Edit
              </button> */}
                    <button
                      className="relative group flex items-center gap-2 text-gray-600 hover:text-blue-500"
                      onClick={() => handleEdits(file._id, file.voice_name)}
                    >
                      <img src={editicon} alt="" className="h-4 " />
                      {/* <Edit className="h-4" /> */}
                      Edit
                    </button>

                    <button
                      className="relative group flex items-center gap-2 text-gray-600 hover:text-red-500"
                      onClick={() => {
                        setSelectedFileId(file._id);
                        setDeletebutton(true);
                      }}
                    >
                      <img src={trashicon} alt="" className="h-4" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* File Details */}
            <div className="flex justify-around mt-3">
              <p className="text-sm text-gray-700 mt-1">
                {file.date_of_upload &&
                  !isNaN(new Date(file.date_of_upload)) ? (
                  new Date(file.date_of_upload).toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })
                ) : (
                  "Invalid Date"
                )}
              </p>

              <p className="text-sm text-gray-700  mt-1">{file.duration} sec</p>
            </div>
          </div>
        ))}
      </div>






      {currentAudio && (
        <div className="absolute top-1/2 md:top-2/3 right-1/2 md:right-[25%] transform translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-lg rounded-lg w-80">
          <h2 className="text-lg font-bold mb-4 text-black">{currentAudio.name}</h2>

          <div className="audio-container items-center justify-center bg-gray-100 rounded-2xl">
            <audio
              id="audio-player"
              src={currentAudio.url}
              controls
              className="w-full rounded"
              controlsList="nodownload" // Disable download option
            >
              Your browser does not support the audio element.
            </audio>
          </div>

          <button
            onClick={() => setCurrentAudio(null)}
            className="mt-6 px-4 py-2 bg-[#0067FF] text-white rounded-md w-full"
          >
            Close
          </button>
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
                Are you sure to delete this Recording?
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
                className="bg-[#0067FF] text-white px-6 py-2 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Yes
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
                Share <span className="text-blue-600">Recording</span>
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
              <input
                type="text"
                placeholder="Add designee, members"
                className="w-full border border-blue-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={designee}
                onChange={handleDesigneeChange}
              />
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold"></h3>
              {people.map((person, index) => (
                <div className="flex items-center mt-2" key={index}>
                  <img
                    src="https://placehold.co/40x40"
                    alt={`Profile picture of ${person.name}`}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">{person.name}</p>
                    <p className="text-sm text-gray-500">{person.email}</p>
                  </div>
                  {person.role && (
                    <span className="ml-auto text-gray-500">{person.role}</span>
                  )}
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
                className="bg-[#0067FF] text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Send
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
              <NavLink
                to="/Subscription">
                <button className="bg-[#0067FF] text-white px-6 py-2 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setDeletebutton1(false)}>
                  Take Membership
                </button>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};
export default Voicememo;