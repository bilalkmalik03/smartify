const express = require("express")                     // Import Express framework
const axios = require("axios")                         // Import Axios for HTTP requests
const cors = require("cors")                           // Import CORS to handle cross-origin requests
require("dotenv").config()                             // Load environment variables from .env

const app = express()
app.use(cors())                                        // Enable CORS for all routes

// Get Spotify credentials and URIs from environment
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const FRONTEND_URI = process.env.FRONTEND_URI

// Route to redirect user to Spotify login page
app.get("/login", (req, res) => {
  const scope = "user-top-read user-library-read"
  const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`

  res.redirect(authURL)                                // Redirect to Spotify authorization URL
})

// Callback route that handles Spotify response after login
app.get("/callback", async (req, res) => {
  const code = req.query.code                          // Get authorization code from query param

  // Prepare token request parameters
  const params = new URLSearchParams()
  params.append("grant_type", "authorization_code")
  params.append("code", code)
  params.append("redirect_uri", REDIRECT_URI)

  // Prepare headers with Basic Auth
  const headers = {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }

  try {
    // Exchange code for access token
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      params,
      headers
    )

    const accessToken = response.data.access_token

    // Redirect to frontend with token as query param
    res.redirect(`${FRONTEND_URI}/?access_token=${accessToken}`)
  } catch (err) {
    console.error("Token error:", err.response?.data || err.message)
    res.status(500).send("Failed to get token")
  }
})

// Start the Express server
app.listen(8888, () => {
  console.log("🚀 Server running on http://localhost:8888")
})