
const express = require("express");
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const axios = require("axios");
const mongoose = require("mongoose");
const multer = require("multer");
const { sendEmail } = require('../email/emailUtils');
const { Folder, File } = require("../models/userUpload");
const { UserSharedFile, Userlogin } = require("../models/userModel");
require("dotenv").config();
const { encryptField, decryptField } = require("../utilities/encryptionUtils");
const { authenticateToken } = require("../routes/userRoutes"); 
const router = express.Router();
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer();

router.post("/create-folder", authenticateToken, async (req, res) => {
  const { folder_name } = req.body;
  console.log("Decoded user_id from token:", req.user);  // Log decoded token object
  // Safely extract user_id from the decoded token
  const user_id = req.user ? req.user.user_id : null;  // Changed _id to user_id
  if (!user_id) {
    return res.status(401).json({ error: "User ID not found in token" });
  }
  if (!folder_name) {
    return res.status(400).json({ error: "Folder name is required" });
  }
  try {
    const aws_folder_key = `${user_id}/${folder_name}_${new mongoose.Types.ObjectId()}/`;
    const aws_folder_link = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${aws_folder_key}`;
    // Encrypt the folder name and link
    const encryptedFolderName = encryptField(folder_name);
    const encryptedFolderLink = encryptField(aws_folder_link);
    const newFolder = new Folder({
      user_id, // The extracted user_id from the token
      folder_name: encryptedFolderName.encryptedData,
      aws_folder_link: encryptedFolderLink.encryptedData,
      iv_folder_name: encryptedFolderName.iv,
      iv_folder_link: encryptedFolderLink.iv,
    });
    await newFolder.save();
    res.status(201).json({
      message: "Folder created successfully",
      folder: {
        user_id,
        folder_name, 
        aws_folder_link,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating folder" });
  }
});


router.post("/upload-file", authenticateToken, upload.single("file"), async (req, res) => {
  const { folder_id, tags, custom_file_name } = req.body; // Include custom_file_name from the request body
  const file = req.file;
  // Extract user_id from the decoded token (since authenticateToken already sets req.user)
  const user_id = req.user ? req.user.user_id : null;
  if (!user_id) {
    return res.status(401).json({ error: "User ID not found in token" });
  }
  if (!folder_id) {
    return res.status(400).json({ error: "Folder ID is required" });
  }
  try {
    // Find the folder by ID (validate if it exists and belongs to the user)
    const folder = await Folder.findById(folder_id);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    // Check if the folder belongs to the current user
    if (folder.user_id.toString() !== user_id.toString()) {
      return res.status(403).json({ error: "You do not have permission to upload files to this folder" });
    }
    // Determine the file name: use custom name if provided, otherwise default to original name
    const fileName = custom_file_name && custom_file_name.trim() ? custom_file_name : file.originalname;
    // Generate AWS S3 file key and link
    const aws_file_key = `${user_id}/${folder.folder_name}_${folder._id}/${fileName}`;
    const aws_file_link = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${aws_file_key}`;
    // Encrypt the file link and name
    const encryptedFileLink = encryptField(aws_file_link);
    const encryptedFileName = encryptField(fileName);
    // Prepare the parameters for uploading the file to S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: aws_file_key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: "AES256",
      ACL: 'public-read',
    };
    const command = new PutObjectCommand(params);
    await s3.send(command); // Upload the file to S3
    // Create a new file entry in the database with tags
    const newFile = new File({
      user_id,
      folder_id,
      file_name: encryptedFileName.encryptedData,
      aws_file_link: encryptedFileLink.encryptedData,
      iv_file_name: encryptedFileName.iv,
      iv_file_link: encryptedFileLink.iv,
      tags: tags || [],
    });
    await newFile.save(); // Save the file to the database
    // Respond with success
    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        user_id,
        folder_id,
        file_name: fileName, // The final file name used
        aws_file_link,
        tags,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error uploading file" });
  }
});


// API to get all folders for logged-in user
router.get("/get-folders", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; // Extracted from token
    // Fetch all folders for the user
    const folders = await Folder.find({ user_id: user_id });
    // Decrypt folder names and links
    const decryptedFolders = folders.map(folder => {
      const folderName = decryptField(folder.folder_name, folder.iv_folder_name);
      const folderLink = decryptField(folder.aws_folder_link, folder.iv_folder_link);
      return {
        ...folder.toObject(),
        folder_name: folderName,
        aws_folder_link: folderLink
      };
    });
    res.status(200).json(decryptedFolders);
  } catch (error) {
    console.error("Error retrieving folders:", error);
    res.status(500).json({ message: "Error retrieving folders.", error: error.message });
  }
});
router.post("/share-files", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { file_id, designee, message, notify } = req.body;
    designee.forEach(async function(to_user_id, index, arr) {
      let result = to_user_id.value.indexOf("@");
      if(result!="-1"){
        let getData=await UserSharedFile.find({file_id, from_user_id: user_id, to_email_id: to_user_id.value});
        if(getData.length==0){
          if(notify==true){
            await sendEmail({to: to_user_id.value, subject: "Regarding share file", body: message});
          }
          var userSharedFile=new UserSharedFile({file_id, from_user_id: user_id, to_email_id: to_user_id.value, access: "view"});
          await userSharedFile.save();
          res.status(200).json({success: true, designee});
        }
        else{
          res.status(200).json({success: false, message: "You have already share the file!"});
        }
      }
      else{
        let getData=await UserSharedFile.find({file_id, from_user_id: user_id, to_user_id: to_user_id.value});
        if(getData.length==0){
          let to_user = await Userlogin.findById(to_user_id.value);
          if(notify==true){
            await sendEmail({to: to_user.email, subject: "Regarding share file", body: message});
          }
          var userSharedFile=new UserSharedFile({file_id, from_user_id: user_id, to_user_id: to_user_id.value, access: "view"});
          await userSharedFile.save();
          res.status(200).json({success: true, designee});
        }
        else{
          res.status(200).json({success: false, message: "You have already share the file!"});
        }
      }
    });
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ message: "Error retrieving files.", error: error.message });
  }
});
router.post("/share-folder", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { folder_id, designee, message, notify } = req.body;
    let files=await File.find({ folder_id });
    files.forEach(async function(file, index, arr) {
      var file_id=file._id;
      designee.forEach(async function(to_user_id, index, arr) {
        let result = to_user_id.value.indexOf("@");
        if(result!="-1"){
          let getData=await UserSharedFile.find({file_id, from_user_id: user_id, to_email_id: to_user_id.value});
          if(getData.length==0){
            if(notify==true){
              await sendEmail({to: to_user_id.value, subject: "Regarding share file", body: message});
            }
            var userSharedFile=new UserSharedFile({file_id, from_user_id: user_id, to_email_id: to_user_id.value, access: "view"});
            await userSharedFile.save();
            //res.status(200).json({success: true, designee});
          }
        }
        else{
          let getData=await UserSharedFile.find({file_id, from_user_id: user_id, to_user_id: to_user_id.value});
          if(getData.length==0){
            let to_user = await Userlogin.findById(to_user_id.value);
            if(notify==true){
              await sendEmail({to: to_user.email, subject: "Regarding share file", body: message});
            }
            var userSharedFile=new UserSharedFile({file_id, from_user_id: user_id, to_user_id: to_user_id.value, access: "view"});
            await userSharedFile.save();
            //res.status(200).json({success: true, designee});
          }
        }
      });
    });
    res.status(200).json({success: true});
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ message: "Error retrieving files.", error: error.message });
  }
});
router.post("/get-file-data", authenticateToken, async (req, res) => {
  try {
    const file_id = req.body.file_id;
    const userSharedFile = await UserSharedFile.find({ file_id }).populate('to_user_id');
    res.status(200).json({userSharedFile});
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ message: "Error retrieving files.", error: error.message });
  }
});
router.post("/get-files", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; 
    const { folder_id } = req.body; 
    if (!folder_id) {
      return res.status(400).json({ message: "Folder ID is required." });
    }
    
    const folder = await Folder.findOne({ _id: folder_id, user_id: user_id });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found or access denied." });
    }
     
     const folderName = decryptField(folder.folder_name, folder.iv_folder_name);
    
    const files = await File.find({ folder_id: folder_id });
   
    const decryptedFiles = files.map(file => {
      const fileName = decryptField(file.file_name, file.iv_file_name);
      const fileLink = decryptField(file.aws_file_link, file.iv_file_link);
      return {
        ...file.toObject(),
        folder_name: folderName,
        file_name: fileName,
        aws_file_link: fileLink,
      };
    });
    res.status(200).json(decryptedFiles);
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ message: "Error retrieving files.", error: error.message });
  }
});
router.post("/delete-file", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; // Extract user ID from the authenticated token
    const { folder_id, file_id } = req.body;
    if (!folder_id || !file_id) {
      return res.status(400).json({ message: "Folder ID and File ID are required." });
    }
    // Find the folder by ID and validate ownership
    const folder = await Folder.findOne({ _id: folder_id, user_id: user_id });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found or access denied." });
    }
    // Find the file by ID and validate ownership
    const file = await File.findOne({ _id: file_id, folder_id: folder_id, user_id: user_id });
    if (!file) {
      return res.status(404).json({ message: "File not found or access denied." });
    }
    // Decrypt the file link to get the S3 file key
    const fileKey = decodeURIComponent(decryptField(file.aws_file_link, file.iv_file_link).split(".com/")[1]);
    // Create the DeleteObjectCommand to delete the file from S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    };
    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3.send(deleteCommand); // Send the delete command to S3
    // Delete the file entry from the database
    await File.deleteOne({ _id: file_id });
    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Error deleting file.", error: error.message });
  }
}); 
router.post("/delete-folder", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; 
    const { folder_id } = req.body;

    if (!folder_id) {
      return res.status(400).json({ message: "Folder ID is required." });
    }

    const folder = await Folder.findOne({ _id: folder_id, user_id: user_id });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found or access denied." });
    }

    const files = await File.find({ folder_id: folder_id });
    if (files.length > 0) {
      return res.status(400).json({ message: "Folder contains files. Delete files first before deleting the folder." });
    }

    const folderLink = decryptField(folder.aws_folder_link, folder.iv_folder_link);
    const folderKey = decodeURIComponent(folderLink.split(".com/")[1]);

    const deleteFolderParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: folderKey,
    };

    const deleteFolderCommand = new DeleteObjectCommand(deleteFolderParams);
    await s3.send(deleteFolderCommand);

    await Folder.deleteOne({ _id: folder_id });

    res.status(200).json({ message: "Folder deleted successfully." });
  } catch (error) {
    console.error("Error deleting folder:", error.message, error.stack);
    res.status(500).json({ message: "Error deleting folder.", error: error.message });
  }
});

// API to get all files for logged-in user
router.get("/get-all-files", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; // Extracted from token
    
    // Fetch all files for the user across all folders
    const files = await File.find({ user_id: user_id });

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "No files found for this user." });
    }

    // Decrypt file details before sending the response
    const decryptedFiles = files.map(file => {
      const fileName = decryptField(file.file_name, file.iv_file_name);
      const fileLink = decryptField(file.aws_file_link, file.iv_file_link);
      // const folderName = decryptField(folder.folder_name, folder.iv_folder_name);
      return {
        ...file.toObject(),
        // folder_name: folderName,
        file_name: fileName,
        aws_file_link: fileLink,
      };
    });

    // Respond with the decrypted files
    res.status(200).json(decryptedFiles);
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ message: "Error retrieving files.", error: error.message });
  }
});

router.post("/view-file-content", authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.body; // Retrieve fileId from the request body
    const user_id = req.user.user_id; // Extracted from token

    if (!fileId) {
      return res.status(400).json({ message: "File ID is required." });
    }

    // Find the file by ID
    const file = await File.findById(fileId);

    if (!file || file.user_id.toString() !== user_id) {
      return res.status(403).json({ message: "Access denied or file not found." });
    }

    // Decrypt file details
    const fileName = decryptField(file.file_name, file.iv_file_name);
    const fileLink = decryptField(file.aws_file_link, file.iv_file_link);

    // Extract the object key from the file link
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const urlPrefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
    const fileKey = fileLink.replace(urlPrefix, ""); // Extract S3 object key

    // Generate a signed URL for the file
    const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey, // Use extracted file key
    }), { expiresIn: 300 }); // URL expires in 5 minutes

    // Respond with file details and the signed URL
    res.status(200).json({
      file_name: fileName,
      file_url: signedUrl,
      file_type: fileName.split(".").pop(), // Extract file extension
    });
  } catch (error) {
    console.error("Error viewing file:", error);
    res.status(500).json({ message: "Error viewing file.", error: error.message });
  }
});
router.post("/download-file", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { file_id } = req.body;
    if (!file_id) {
      return res.status(400).json({ message: "File ID is required." });
    }
    const file = await File.findOne({ _id: file_id, user_id: user_id });
    if (!file) {
      return res.status(404).json({ message: "File not found or access denied." });
    }
    // Decrypt the AWS file link
    const fileLink = decryptField(file.aws_file_link, file.iv_file_link);
    // Return the file link
    res.status(200).json({
      message: "File ready for download.",
      download_url: fileLink,
    });
  } catch (error) {
    console.error("Error preparing download link:", error);
    res.status(500).json({ message: "Error preparing download link.", error: error.message });
  }
});

router.post("/edit-file-name", async (req, res) => {
  try {
    const { file_id, new_file_name } = req.body;

    // Validate inputs
    if (!file_id || !new_file_name) {
      return res.status(400).json({ error: "File ID and new file name are required." });
    }

    // Find the file in MongoDB
    const file = await File.findById(file_id);
    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    // Encrypt the new file name
    const { encryptedData, iv } = encryptField(new_file_name);

    // Update the file name and IV in MongoDB
    file.file_name = encryptedData;
    file.iv_file_name = iv;
    await file.save();

    res.status(200).json({
      message: "File name updated successfully.",
      newFileName: new_file_name,
    });
  } catch (error) {
    console.error("Error in edit-file-name route:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

router.post("/edit-folder-name", authenticateToken, async (req, res) => {
  try {
    const { folder_id, new_folder_name } = req.body;
    // Validate inputs
    if (!folder_id || !new_folder_name) {
      return res.status(400).json({ error: "Folder ID and new folder name are required." });
    }
    // Find the folder in MongoDB
    const folder = await Folder.findById(folder_id);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found." });
    }
    // Encrypt the new folder name
    const { encryptedData: encryptedFolderName, iv: ivFolderName } = encryptField(new_folder_name);
    // Update the folder name and IV in MongoDB
    folder.folder_name = encryptedFolderName;
    folder.iv_folder_name = ivFolderName;
    await folder.save();
    res.status(200).json({
      message: "Folder name updated successfully.",
      newFolderName: new_folder_name,
    });
  } catch (error) {
    console.error("Error in edit-folder-name route:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});




// API to get the total size of a user's folder in S3
router.get('/get-folder-size', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;
  const folderName = `${userId}/`; 
  let totalSize = 0;
  let isTruncated = true;
  let continuationToken = null;

  try {

    while (isTruncated) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: folderName, 
        ContinuationToken: continuationToken, 
      };

      const command = new ListObjectsV2Command(params);
      const data = await s3.send(command);
      data.Contents.forEach((object) => {
        totalSize += object.Size;
      });


      isTruncated = data.IsTruncated;
      continuationToken = data.NextContinuationToken;
      
    }
    const totalSizeKB = totalSize / 1024;
    res.json({ totalSizeKB });
  } catch (error) {
    console.error('Error fetching folder size:', error);
    res.status(500).json({ error: 'Failed to retrieve folder size' });
  }
});


module.exports = router;
