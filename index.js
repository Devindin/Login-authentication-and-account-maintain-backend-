const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const cors = require('cors');

const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));

app.listen(port, () => {
  console.log("Server is running on ${port}");
});

//////////////////////////////////////
require("./db");
require("./models/User");
require("./models/Relation");

//////////////////////////////////////

const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);

app.use((req, res, next) => {
  const error = new Error("Route NOt Found");
  error.status = 404;
  next(error);
});

app.use(express.json());
app.use(cors());

// Error handling

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({ error: error.message });
});
