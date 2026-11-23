// app.js
// Middleware and routes are kept here. server.js only starts the server.

const express = require("express");
const cors = require("cors");
const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/authRoutes");
const messRoutes = require("./routes/messRoutes");
const memberRoutes = require("./routes/memberRoutes");
const mealRoutes = require("./routes/mealRoutes");
const mealRequestRoutes = require("./routes/mealRequestRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const guestMealRoutes = require("./routes/guestMealRoutes");
const mealRateRoutes = require("./routes/mealRateRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MessMate server is working",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/messes", messRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/meal-requests", mealRequestRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/guest-meals", guestMealRoutes);
app.use("/api/meal-rate", mealRateRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/complaints", complaintRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
