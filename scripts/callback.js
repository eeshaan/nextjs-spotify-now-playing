require("dotenv").config({ path: ".env.local" });
const express = require("express");
const axios = require("axios");
const app = express();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const PORT = process.env.AUTH_SETUP_PORT;

app.get("/", (req, res) => {
  res.send("hello, world");
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      params: {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: `http://localhost:${PORT}/callback`,
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const refresh_token = response.data.refresh_token;
    console.log("Refresh Token:", refresh_token);
    res.send("Token received. Check your console.");
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error occurred");
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
