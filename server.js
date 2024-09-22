const express = require("express");
const app = express();
const atob = require("atob"); // To decode Base64 file data
const cors = require('cors');

// Allow cross-origin requests from your frontend's origin
app.use(cors({
  origin: 'https://bajaj-finserv-5u8b.vercel.app/Backend' // Replace with the origin of your frontend
}));

// Middleware to parse JSON data
app.use(express.json());

// Helper function to check file type and size from Base64 string
function getFileInfo(base64String) {
  let isValid = false;
  let mimeType = "";
  let sizeKB = 0;

  if (base64String) {
    try {
      const mime = base64String.match(/^data:(.*);base64,/);
      if (mime) {
        mimeType = mime[1];
        const fileBuffer = Buffer.from(base64String.split(",")[1], "base64");
        sizeKB = (fileBuffer.length / 1024).toFixed(2); // Convert bytes to KB
        isValid = true;
      }
    } catch (error) {
      isValid = false;
    }
  }

  return { isValid, mimeType, sizeKB };
}

// Array to store user data (not being used, but kept for future use)
const users = [];

app
  .route("/bfhl")
  // GET method to return operation_code
  .get((req, res) => {
    res.status(200).json({
      operation_code: 1,
      message: "Success",
    });
  })

  // POST method to accept and process data
  .post((req, res) => {
    const { data = [], file_b64, email, roll_number } = req.body;

    // Validate required fields
    if (!email || !roll_number || !data.length) {
      return res.status(400).json({
        is_success: false,
        message: "Missing required fields.",
      });
    }

    const numbers = [];
    const alphabets = [];
    let highest_lowercase = "";

    // Sorting data into numbers and alphabets
    for (const item of data) {
      if (!isNaN(item)) {
        numbers.push(item); // Numbers
      } else if (typeof item === "string" && item.length === 1) {
        alphabets.push(item); // Alphabets
        if (/[a-z]/.test(item)) {
          if (highest_lowercase === "" || item > highest_lowercase) {
            highest_lowercase = item;
          }
        }
      }
    }

    // File handling
    const { isValid, mimeType, sizeKB } = getFileInfo(file_b64);

    // Generate user_id in the specified format
    const full_name = "john_doe"; // Replace with your actual full name
    const dob = "17091999"; // Replace with your actual DOB in DDMMYYYY format
    const user_id = `${full_name}_${dob}`;

    // Respond with the required data format
    res.status(200).json({
      is_success: true,
      user_id,
      email,
      roll_number,
      numbers,
      alphabets,
      highest_lowercase_alphabet: highest_lowercase ? [highest_lowercase] : [],
      file_valid: isValid,
      file_mime_type: mimeType,
      file_size_kb: sizeKB,
    });
  });

// You no longer need app.listen, Vercel handles this automatically
// Remove the following lines:
// const port = process.env.PORT || 5174;
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

module.exports = app; // Export your Express app for Vercel to handle
