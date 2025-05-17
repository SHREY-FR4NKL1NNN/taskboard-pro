const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- Socket.IO setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

// Store mapping from userId to socketId
const userSockets = {};

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    userSockets[userId] = socket.id;
  });
  socket.on("disconnect", () => {
    for (const [userId, id] of Object.entries(userSockets)) {
      if (id === socket.id) delete userSockets[userId];
    }
  });
});

// Start server (only use server.listen, not app.listen)
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// --- Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/automations", require("./routes/automationRoutes"));
app.use("/api/activity-log", require("./routes/ActivityLogRoutes"));
app.use("/api/notifications", require("./routes/NotificationRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));

// --- Models & Utilities ---
const Task = require("./models/Task");
const Automation = require("./models/Automation");
const Notification = require("./models/Notification");
const User = require("./models/User");
const sendEmail = require("./utils/sendEmail");

// --- Cron job for overdue tasks ---
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily automation check for overdue tasks...");

  const now = new Date();
  const overdueTasks = await Task.find({
    dueDate: { $lt: now },
    status: { $ne: "done" },
  });

  for (const task of overdueTasks) {
    const automations = await Automation.find({
      projectId: task.projectId,
      trigger: "dueDatePassed",
    });

    for (const rule of automations) {
      if (rule.action.sendNotification) {
        // In-app notification
        if (task.assignedTo) {
          await Notification.create({
            userId: task.assignedTo,
            message: `Task "${task.title}" is overdue!`,
          });

          // Email notification
          const user = await User.findOne({ uid: task.assignedTo });
          if (user && user.email) {
            await sendEmail(
              user.email,
              "Task Overdue",
              `Task "${task.title}" is overdue!`
            );
          }
          // Real-time notification via Socket.IO
          if (userSockets[task.assignedTo]) {
            io.to(userSockets[task.assignedTo]).emit("notification", {
              message: `Task "${task.title}" is overdue!`,
            });
          }
        }
        console.log(
          `🔔 Notify: Task "${task.title}" is overdue (Assigned to: ${
            task.assignedTo || "Unassigned"
          })`
        );
      }
    }
  }
});