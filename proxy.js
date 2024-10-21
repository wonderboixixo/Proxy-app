const express = require("express");
const bodyParser = require("body-parser");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.enable("trust proxy");
const port = process.env.PORT || 8000;
let urlToProxy = process.env.PROXYURL || "https://nyaa.si"; // Use let to allow changes

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the form at the /change-proxy route
app.get("/change-proxy", (req, res) => {
  res.send(`
    <form action="/set-proxy" method="POST">
      <label for="proxyUrl">Enter Proxy URL:</label>
      <input type="text" id="proxyUrl" name="proxyUrl" required>
      <button type="submit">Set Proxy</button>
    </form>
  `);
});

// Handle the form submission to change the proxy URL
app.post("/set-proxy", (req, res) => {
  const newUrl = req.body.proxyUrl; // Get the new URL from the form input
  urlToProxy = newUrl; // Update the urlToProxy variable
  res.send(`Proxy URL has been updated to: ${urlToProxy}`);
  console.log(urlToProxy);
});

// Middleware to handle proxy requests
const proxyMiddleware = () => {
  return createProxyMiddleware({
    target: urlToProxy,
    changeOrigin: true,
  });
};

// Apply the proxy middleware to all requests to the root route
app.use("/", (req, res, next) => {
  // Apply the proxy middleware for all requests except for /change-proxy and /set-proxy
  if (req.url === "/change-proxy" || req.url === "/set-proxy") {
    next(); // Skip proxy middleware for these routes
  } else {
    proxyMiddleware()(req, res, next); // Apply proxy middleware
  }
});

// Express server started
app.listen(port, () => {
  console.log(`Proxy server is running at http://localhost:${port}`);
});