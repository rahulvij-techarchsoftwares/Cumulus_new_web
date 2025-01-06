const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const stripeRoutes = require('./routes/stripeRoutes');
const { router: userRoutes } = require('./routes/userRoutes');
const fileuploadRoutes = require("./routes/fileuploadRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const voiceuploadRoutes = require("./routes/voiceuploadRoutes");
const defaultfileRoutes = require("./routes/defaultfileRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const helpandsupport = require("./routes/userhelpRoutes");
const designeeRoutes = require("./routes/designeeRoutes");
const { router: emailRoutes } = require('./email/emailUtils');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(cookieParser());
app.use(cors({
  origin: 'http://16.170.230.178:3001', 
  credentials: true, 
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure express-session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

app.use("/api/auth", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);  
app.use("/api", fileuploadRoutes);
app.use("/api/voice-memo", voiceuploadRoutes);
app.use("/api/default", defaultfileRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api', membershipRoutes);
app.use("/api/help-support", helpandsupport);
app.use("/api/designee", designeeRoutes);
app.use("/api/email", emailRoutes);

const DB_URI = process.env.DB_URI;
mongoose
  .connect(DB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://16.170.230.178:${PORT}`));
