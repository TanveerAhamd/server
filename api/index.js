const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const app = express();
const cors = require("cors");
app.use(cors());
const secretkey = "kjfskdj6^ksj98982hjk;.,-sgd434!"
const message = require("../models/messages")
const jwt = require("jsonwebtoken");
const { sendRoleUpdateNotification } = require('../sendRoleUpdateNotification');

const UserModel = require("../models/user");
const Complain = require("../models/newcomplain");
const Feedback = require("../models/feedback");
app.use(express.json())

app.get("/api", (req, res) => {
  res.send("working...")
})




app.post("/api/registrationofnewuser", async (request, response) => {
  console.log('Received request:', request.body);
  try {

    if (!request.body || !request.body.email) {
      return response.status(400).json({
        status: false,
        error: "Invalid request. Email is missing.",
      });
    }
    const existingUser = await UserModel.findOne({ email: request.body.email });
    if (existingUser) {
      return response.json({
        status: false,
        msg: "This email is already registered.",
      });
    }

    request.body.password = await bcrypt.hash(request.body.password, 10);

    const newUser = await UserModel.create(request.body);

    return response.json({
      status: true,
      msg: "Successfully created.",
    });
  } catch (error) {
    console.log(error.message)
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return response.json({
        status: false,
        errors: errors,
      });
    }

    // Handle other types of errors
    console.error(error);
    return response.status(500).json({
      status: false,
      error: "Something went wrong.",
    });
  }
});


app.post("/api/login", async (request, response) => {
  try {
    const { email, password } = request.body;

    // Find the user in the database by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      // User not found
      return response.json({
        status: false,
        msg: "Invalid email or password",
      });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Incorrect password
      return response.json({
        status: false,
        msg: "Invalid email or password",
      });
    }

    // Password is valid, generate a JWT token
    const token = jwt.sign(
      { name: user.name, email: user.email, id: user._id, role: user.role },
      secretkey
    );

    return response.json({
      status: true,
      token: token,
    });

  } catch (error) {
    console.error(error);

    return response.status(500).json({
      status: false,
      error: "Something went wrong during login.",
    });
  }
});



app.post('/api/addfeedback', async (req, res) => {
  try {
    const { Name, Email, Contact, FeedbackMessage } = req.body;
    console.log(Name, Email, Contact, FeedbackMessage);
    // Validation
    if (!Name || !FeedbackMessage) {
      return res.status(400).json({ message: "Incomplete data provided" });
    }

    // Create a new Complaint
    const newFeedback = await Feedback.create({
      Name,
      Email,
      Contact,
      FeedbackMessage,
    });

    res.status(201).json({
      status: "success",
      message: " Your Feedback hass been saved successfully",
      Feedback: newFeedback,
    });

  } catch (error) {
    console.error("Error creating Feedback:", error);
    res.status(500).json({ message: "Failed to add a Feedback / Suggestion" });
  }
})
app.post('/api/dellFeedBack', async (req, res) => {
  // Delete all documents from the collection
  Feedback.deleteMany({}, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('All documents deleted successfully');
    }
  })
})

app.get("/api/feedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({});
    res.status(200).json({
      status: "success",
      feedbacks: feedbacks,
    });
  } catch (error) {
    res.status(200).json({
      status: "failed"
    });
  }
})


app.post("/api/addcomplain", async (req, res) => {
  try {
    const { Name, Email, Department, Contact, Complainmessage } = req.body;

    // Validation
    if (!Name || !Email || !Department || !Contact || !Complainmessage) {
      return res.status(400).json({ message: "Incomplete data provided" });
    }

    // Create a new Complaint
    const newComplain = await Complain.create({
      Name,
      Email,
      Department,
      Contact,
      Complainmessage,
    });

    // Send role update notification email
    if (Email) {
      await sendRoleUpdateNotification(Email.toString(), newComplain.Requestid);
    }

    res.status(201).json({
      status: "success",
      message: "Complaint saved successfully",
      Complain: newComplain,
    });
  } catch (error) {
    console.error("Error creating Complaint:", error);
    res.status(500).json({ message: "Failed to add a Complaint" });
  }
});










app.get('/api/applications', async (req, res) => {
  try {
    let query = {};

    if (req.query.requestid) {
      query = { ...query, Requestid: req.query.requestid };
    }

    if (req.query.startDate && req.query.endDate) {
      query = {
        ...query,
        createdAt: {
          $gte: new Date(req.query.startDate), // greater than or equal to start date
          $lte: new Date(req.query.endDate),   // less than or equal to end date
        },
      };
    }

    if (req.query.status) {
      query = { ...query, Status: req.query.status };
    }
    console.log(query)
    const applications = await Complain.find(query);
    res.json({ status: true, applications: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// app.get("/api/deletebyid/:id", async (req, res) => {
//   const id = req.params.id;
//   try {
//     const complain = await Complain.findById(id);
//     if (!complain) {
//       return res.status(404).json({
//         status: false,
//         message: "Complain not found",
//       });
//     }

//     res.status(200).json({
//       status: true,
//       complain: complain,
//     });
//   } catch (error) {
//     console.error("Error retrieving Complain:", error);
//     res.status(500).json({ status: false, message: "Internal Server Error" });
//   }
// });


app.get("/api/getrequestbyid/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const complain = await Complain.findOne({ id });
    if (!complain) {
      return res.json({
        status: false,
        message: "Complain not found",
      });
    }

    res.status(200).json({
      status: true,
      complain: complain,
    });
  } catch (error) {
    console.error("Error retrieving Complain:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

app.get("/api/getbyid/:id", async (request, response) => {
  const id = request.params.id;
  console.log(id)
  try {
    const com = await Complain.findById(id);
    response.json({
      status: true,
      complain: com
    });
  } catch (error) {
    response.json({
      status: false,
      error: "something went wrong"
    });
  }
});



app.put("/api/updatecomplain/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const complain = await Complain.findById(id);

    if (!complain) {
      return res.status(404).json({
        status: false,
        message: "Complain not found",
      });
    }

    // Update Status if provided in the request body
    if (req.body.Status) {
      complain.Status = req.body.Status;
    }

    // Update Severity if provided in the request body
    if (req.body.Severity) {
      complain.Severity = req.body.Severity;
    }

    await complain.save();

    res.status(200).json({
      status: true,
      message: "Complain updated successfully",
      complain: complain,
    });
  } catch (error) {
    console.error("Error updating Complain:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const newMessage = await message.create(req.body);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/messages/:complainid', async (req, res) => {
  const complainid = req.params.complainid;

  try {
    const messagesForComplain = await message.find({ complainid })


    if (!messagesForComplain || messagesForComplain.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(messagesForComplain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// saad db
// mongodb+srv://saad:DKdnKtF19CjhTI4k@cluster0.nqx7zzf.mongodb.net


// tanveer db 
// mongodb+srv://mtanveerulhassan2:PGQaPVMYsSCJ9yRB@cluster0.krsilsu.mongodb.net/

mongoose.connect("mongodb+srv://mtanveerulhassan2:pu3E6rttg4VexM5P@cluster0.vykalzk.mongodb.net/TicerComplain").then(() => {
  console.log("db  is running on port 3003 ")
  app.listen(3003, () => {
    console.log("db and server is running on port 3003 ")
  })
});



module.exports = app;
