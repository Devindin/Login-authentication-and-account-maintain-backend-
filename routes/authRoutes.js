const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const bcrypt = require("bcrypt");
const cors = require("cors");
const axios = require('axios');
const nodemailer = require('nodemailer');

const authMiddleware = require('../middleware/authmiddleware');
const Relation = require("../models/Relation");

/////////////////////////////////////////
const User = mongoose.model("User");
////////////////////////////////////////

////////////////////////////////////////
require("dotenv").config();
////////////////////////////////////////


// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '991017anuradha@gmail.com', 
    pass: 'ctff rqfn mvqr btug'    
  }
});

////////////////// add new user //////////////////////
router.post('/addNewUser', async (req, res) => {
  console.log("sent by the client side -", req.body);

  const { firstName, lastName, email, password, userID, contact } = req.body;

  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      contact,
      userID,
     password: hashPassword
     

});

    await user.save();
    res.send({ message: "user registered successfuly" });
  } catch (error) {
    console.log("Database error", error);
    return res.status(422).send({ error: error.message });
  }
});

//////////////////// user login //////////////

router.post("/userLogin", async (req, res) => {
  const { userID, password } = req.body;

  try {
    const user = await User.findOne({ userID });
    if (!user) {
      return res.status(401).send({ error: "user not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({ error: "Invalid Password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m"
    });
    const email = user.email;
    // Send email upon successful login
    const mailOptions = {
      from: '991017anuradha@gmail.com',
      to: email,
      subject: 'Login Notification',
      text: "Hello, you have successfully logged in to the Future Tech official page."
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.json({ token });
  } catch (error) {
    console.error("Database Error", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

/////////// Rout to get details the logged user ///////////
router.get('/loggedUserBio',authMiddleware,async(req ,res) =>{
try {
  const userId =req.userId;
  const user = await User.findById(userId);

  if (typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if(!user){
    return res.status(404).json({error  : "User not found"});
  };

  res.json({
    firstName:user.firstName,
    lastName: user.lastName,
    email: user.email,
    contact: user.contact,
    userID: user.userID,
    city:user.city,
    school:user.school,
  })
} catch (error) {
  console.error("Error fetching user details :" , error);
  res.status(500).json({error : "Interna; server error"});
}
});

module.exports = router;


////////////////// Update //////////////////////////


router.put('/updateUserDetails',authMiddleware ,async(req,res)=>{
  try {
    const userId = req.userId;
    const {firstName,lastName,email,contact,city,school}= req.body;

    const user = await User.findById(userId);

    if(!user)
    {
      return res.status(404).json({error:"user Not Found!"});
    }
    if(firstName){
      user.firstName = firstName;
    }
    if(lastName){
      user.lastName = lastName;
    }
    if(email){
      user.email = email;
    }
    if(contact){
      user.contact = contact;
    }
    if(city){
      user.city = city;
    }
    if(school){
      user.school = school;
    }

    /////// save the update user details ////
     await user.save();

     res.json({message:"User details update Successfully!"});
    

  } catch (error) {
    console.log('Error updating Details',error);
    return res.status(500).json({error:"Internal server Error"});
  }



  router.post('/addRelation', authMiddleware ,async(req,res)=>{
    try {
      const userId = req.userId;
      const {firstName,lastName,relation}= req.body;

      const newRelation = new Relation({
        firstName,
        lastName,
        relation,
      });

      await newRelation.save();
      const user =await User.findById(userId);

      if(!user){
        return res.status(404).json({error :"user not found"});
      }

      user.relationIDs.push(newRelation._id);
      await user.save();

      res.json({
        message:"relation added successfully",
      });

    } catch (error) {
      console.error("Error adding relation" , error);
      return res.status(500).json({error:"Internal Server Error"});
    }
  });

  

  router.get('/userRelations',authMiddleware,async(req,res)=>{
    try {
      const userId = req.userId;
      const user = await User.findById(userId).populate('relationIDs');
      if(!user){
        return res.status(404).json({error :"user not found"});
      }

      const relations = user.relationIDs.map(relation =>({
        id:relation._id,
        firstName: relation.firstName,
        lastName: relation.lastName,
        relation: relation.relation,

      })
      )
      res.json(relations);
    } catch (error) {
      console.log('Error',error)
    }
    
  })


 router.delete('/deleteRelation/:id', authMiddleware, async(req,res)=>{
  try {
    const relationId = req.params.id;
    console.log("Clicked object ID return from Server :" ,req.params.id);

    await Relation.findByIdAndDelete(relationId);
    
    const user = await User.findOneAndUpdate(
      {relationIDs : relationId},
      {$pull:{relationIDs : relationId}},
      {new: true}
    )

    if(!user){
      return res.status(404).json({error :"user not found"});
    }

    res.json({message : 'Relation deleted successfully'});

  } catch (error) {
    console.log("Error",error);
  }
 })








})