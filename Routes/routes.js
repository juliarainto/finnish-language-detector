require("./node_modules/isomorphic-unfetch")
const express = require('express')
const cors = require('cors')
const app = express()
const port = 4000
const fs = require('fs')

const development = true;

app.use(cors())

app.get('/', async (req, res) => {
  const { url, token } = req.query;
  if (!url || !token) {
    res.status(400).send({success: false, message: 'Missing query parameters'})
  }
  try {
    let response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status >= 400) {
      throw { message: `Error: ${await response.text()}` };
    }

    const data = await response.json()

    return res.status(200).send({
      success: true,
      bullshits: data.bullshits
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({success: false, message: e.message.toString() || e.toString()})
  }

})

if (development) {
  const http = require('http')
  const httpServer = http.createServer(app)
  httpServer.listen(port, () => console.log(`HTTP server running on port: ${port}`))
} else {
  const https = require('https')
  const privateKey  = fs.readFileSync('path/to/privkey.pem', 'utf8')
  const certificate = fs.readFileSync('path/to/cert.pem', 'utf8')
  const credentials = { key: privateKey, cert: certificate }
  const httpsServer = https.createServer(credentials, app)
  httpsServer.listen(port, () => console.log(`HTTPS server running on port: ${port}`))
}