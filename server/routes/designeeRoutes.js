const express = require("express");
const router = express.Router();
const { sendEmail } = require('../email/emailUtils');
const Subscription = require("../models/userSubscriptions");
const { authenticateToken } = require("../routes/userRoutes"); 
const { UserSharedFile, Designee } = require("../models/userModel");
router.post("/add", authenticateToken, async (req, res) => {
  const user_id = req.user.user_id; // Extracted from token
  const { designeeName, designeePhone, designeeEmail } = req.body;

  // Ensure valid email
  if (!designeeEmail || !designeeName) {
      return res.status(400).json({ message: "Designee name and email are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(designeeEmail)) {
      return res.status(400).json({ message: "Invalid email address format." });
  }

  console.log("Valid email to be sent to:", designeeEmail);  // Ensure it's a valid email address

  try {
      let otp = Math.floor(100000 + Math.random() * 900000);
      var body = `Hello ${designeeName}<br/><br/>Please click on below link for registration with Cumulus.<br/><br/>`;
      body += `<a href='http://localhost:3000/SharedFiles?email=${designeeEmail}&created_by=${user_id}'>http://localhost:3000/SharedFiles?email=${designeeEmail}&created_by=${user_id}</a>`;
      body += "<br/>Your OTP is: "+otp;
      body += "<br/><br/>Thanks<br/>Cumulus Team!";

      const emailResponse = await sendEmail({
          to: designeeEmail,  // Only valid email here
          subject: "Member Registration Email",
          body
      });

      if (emailResponse.success) {
          let designee=new Designee({from_user_id: user_id, name: designeeName, phone_number: designeePhone, email: designeeEmail, otp});
          await designee.save();
          res.status(200).json({
              message: "Subscription created successfully.",
              previewURL: emailResponse.previewURL,
          });
      } else {
          res.status(500).json({ message: "Error sending OTP email.", error: emailResponse.error });
      }
  } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Error creating subscription.", error: error.message });
  }
});

router.post("/get", async (req, res) => {
  const { email } = req.body;
  //let designee=await UserSharedFile.find({to_email_id: email}).populate("from_user_id").populate("to_user_id");
  let designee=[];
  const designee1 = await UserSharedFile.aggregate([
    // Match documents based on the provided email
    {
      $match: {
        to_email_id: email
      }
    },

    // Group by 'from_user_id' and accumulate the documents in an array
    {
      $group: {
        _id: "$from_user_id",
      }
    }
  ]);
  for(var i=0; i<designee1.length; i++){
    var designee2=await UserSharedFile.find({from_user_id: designee1[i]._id, to_email_id: email}).populate("file_id").populate("from_user_id").populate("to_user_id");
    designee.push({_id: designee1[i]._id, files: designee2});
  }
  res.status(200).json(designee);
});

router.post("/auth-get", authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  //let designee=await UserSharedFile.find({to_user_id: user_id}).populate("file_id").populate("from_user_id").populate("to_user_id");
  let designee=[];
  const designee1 = await UserSharedFile.aggregate([
    // Match documents based on the provided email
    {
      $match: {
        to_user_id: user_id
      }
    },

    // Group by 'from_user_id' and accumulate the documents in an array
    {
      $group: {
        _id: "$from_user_id",
      }
    }
  ]);
  for(var i=0; i<designee1.length; i++){
    var designee2=await UserSharedFile.find({from_user_id: designee1[i]._id, to_user_id: user_id}).populate("file_id").populate("from_user_id").populate("to_user_id");
    designee.push({_id: designee1[i]._id, files: designee2});
  }
  res.status(200).json(designee);
});

router.post("/set-permission", authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { userId, data } = req.body;
  let result = userId.indexOf("@");
  if(result!="-1"){
    var designee=await UserSharedFile.findOne({from_user_id: user_id, to_email_id: userId});
  }
  else{
    var designee=await UserSharedFile.findOne({from_user_id: user_id, to_user_id: userId});
  }
  designee.access=data;
  await designee.save();
  res.status(200).json({success: true});
});
  
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const designee = await Designee.findOne({ email, otp });
    if(designee==null){
      res.status(200).json({success: false, message: "OTP is wrong!"});
    }
    else{
      //designee.otp="";
      //await designee.save();
      res.status(200).json({success: true, message: "Thanks for login with email and OTP!"});
    }
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ message: "Error fetching subscriptions.", error: error.message });
  }
});
module.exports = router;
