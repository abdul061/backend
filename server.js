const express = require("express");
const cors = require("cors");
const app = express();
const nodemailer = require("nodemailer");
const { collection, subscription } = require("./mongo");

require("dotenv").config();

const PORT = 5002;

// Middleware to parse incoming JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_user,
    pass: process.env.Email_pass,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Error accuredd while sending mail", error);
  } else {
    console.log("Mail has been sent successfully", success);
  }
});

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  // Handle the data (e.g., save it to a database or send an email)
  console.log("Received contact form submission:", name, email, message);

  const data = {
    name: name,
    email: email,
    message: message,
  };
  await collection.insertMany([data]);
  res.status(200).json({
    message: "Thank you for contacting us! A reply email has been sent to you.",
  });
  const mailOptions = {
    from: process.env.Email_user,
    to: email,
    subject: `Thanks for contacting Adiz codez , ${name}`,
    text: `Dear ${name},

         \n Thank you for reaching out to Adiz! We appreciate your interest and value your feedback. \n
          Our team is currently reviewing your message and will get back to you as soon as possible. \n
          If your inquiry is urgent, please feel free to give us a call at +91 6385297091. \n
          We’re here to assist you and ensure you have a great experience with us. \n
          Thank you once again for contacting us!\n\n

Best regards,
The Adiz Team`,
  };
  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Reply email sent:", info.response);
  } catch (error) {
    console.error("Error sending reply email:", error);
    res.status(500).json({
      message:
        "There was an error sending your message. Please try again later.",
    });
  }
  // Respond to the frontend
});

app.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  const data = {email:email}
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    const existingSubscription = await subscription.findOne({ email });
    if (existingSubscription) {
      // Email is already subscribed
      return res.status(200).json({ message: 'You are already supporting Adiz.' });
    }
    const newSubscription = new subscription({ email });
    await newSubscription.save();

    res.status(200).json({ message: 'Thanks for supporting Adiz!' });
  } catch (error) {

      console.error('Error handling subscription:', error);
      res.status(500).json({ message: 'An error occurred. Please try again.' });
    
  }
  const mailOptions = {
    from: process.env.Email_user,
    to: email,
    subject: `Thanks for SUBSCRIBING to ADIZ CODEZ`,
    text: `\nThank you for subscribing to Adiz! We are thrilled to have you as part of our community.
     Your support means a lot to us, and we are committed to providing you with valuable updates, insights, and resources that will help you stay informed and engaged. If you have any questions or need assistance,
     feel free to reach out. Welcome aboard, and thank you for choosing Adiz!
     
     \n\nBest regards,
     \n\nThe Adiz Team`
  };
  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Reply email sent:", info.response);
  } catch (error) {
    console.error("Error sending reply email:", error);
    res.status(500).json({
      message:
        "There was an error sending your message. Please try again later.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
