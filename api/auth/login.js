export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  // Handle OPTIONS for CORS
  if (req.method === "OPTIONS") return res.status(200).end();

  // Only POST allowed
  if (req.method !== "POST") {
    console.error("Invalid method for /api/auth/login:", req.method);
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // Parse request body
    let raw = "";
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => (raw += chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });

    if (!raw) {
      console.warn("POST /api/auth/login - missing body");
      return res.status(400).json({ success: false, message: "Missing JSON body" });
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch (err) {
      console.error("POST /api/auth/login - failed to parse JSON", err.message);
      return res.status(400).json({ success: false, message: "Invalid JSON" });
    }

    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      console.warn("POST /api/auth/login - missing credentials");
      return res.status(400).json({ success: false, message: "Username and password required" });
    }

    // Default credentials (use env vars in production)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "widelle2025";

    // Check credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log("POST /api/auth/login - successful login for user:", username);
      return res.status(200).json({ success: true, message: "Login successful" });
    }

    console.warn("POST /api/auth/login - failed login attempt for user:", username);
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    console.error("POST /api/auth/login - unhandled error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
