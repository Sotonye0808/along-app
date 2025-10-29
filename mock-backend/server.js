const jsonServer = require("json-server");
const cors = require("cors");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Otp storage for mock simulation
let otpStore = {};

//Register endpoint simulation
server.post("/register", (req, res) => {
  const { userName, firstName, lastName, email, password } = req.body;
  const users = router.db.get("users").value();
  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const newUser = {
    id: String(users.length + 1),
    userName,
    firstName,
    lastName,
    email,
    password, // Mock only o, the real version will hash
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
    bio: "",
    followers: 0,
    following: [],
    likes: [],
    bookmarks: [],
    createdAt: new Date().toISOString(),
    verified: false,
  };

  // Save new user
  router.db.get("users").push(newUser).write();

  // Generate fake otp
  const otpCode = "123456";
  otpStore[email] = otpCode;
  console.log(`OTP for ${email}: ${otpCode}`);

  res.json({
    message:
      "User registered successfully. Verification code sent to your email.",
  });
});

// Verify Otp endpoint simulation
server.post("/verify-otp", (req, res) => {
  const { email, code } = req.body;

  const validOtp = otpStore[email];
  if (!validOtp) {
    return res.status(400).json({ error: "No Otp found for this email" });
  }

  if (code !== validOtp) {
    return res.status(400).json({ error: "Invalid Otp" });
  }

  // Mark user as verified
  const users = router.db.get("users").value();
  const userIndex = users.findIndex((u) => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[userIndex].verified = true;
  router.db.set("users", users).write();

  delete otpStore[email];

  res.json({ message: "Account verified successfully" });
});

// Login endpoint simulation
server.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = router.db.get("users").value();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Note: in the db.json bcrypt should be re-enabled when we switch to real hashing and backend later. Also this check is for mock testing only
  if (user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Return fake tokens + user
  const accessToken = "mock-access-token";
  const refreshToken = "mock-refresh-token";

  res.json({
    user,
    accessToken,
    refreshToken,
  });
});

server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server running on http://localhost:${PORT}`);
});
