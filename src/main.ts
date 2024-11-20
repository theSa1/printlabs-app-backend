import "dotenv/config";
import express from "express";
import { loginHandler } from "./routes/auth/login";
import { errorHandler } from "./lib/error-handler";
import { signUpHandler } from "./routes/auth/signup";
import { newOrderHandler } from "./routes/orders/new";
import { listOrderHandler } from "./routes/orders/list";
import { adminLoginHandler } from "./routes/admin/auth/login";
import { adminGetOrderHandler } from "./routes/admin/orders/get";
import { updateOrderStatusHandler } from "./routes/admin/orders/update-status";
import { getOrderHandler } from "./routes/orders/get";
import { authMiddleware } from "./lib/auth-middleware";
import { getStatisticsHandler } from "./routes/statistics";
import { markOrderPaid } from "./routes/orders/mark-paid";
import { forgotPasswordHandler } from "./routes/auth/forgot-password";
import { updatePasswordHandler } from "./routes/auth/update-password";
import { getProfileHandler } from "./routes/profile/get";
import { updateProfileHandler } from "./routes/profile/update";
import expressWinston from "express-winston";
import winston from "winston";
import { listPaidOrdersHandler } from "./routes/admin/orders/list-paid-orders";

const app = express();

// app.use(
//   expressWinston.logger({
//     transports: [new winston.transports.Console()],
//     format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.json()
//     ),
//     msg: "HTTP {{req.method}} {{req.url}}",
//     expressFormat: true,
//   })
// );

app.use(
  express.json({
    limit: "100mb",
  })
);

app.use(authMiddleware);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// auth
app.post("/auth/login", loginHandler);
app.post("/auth/signup", signUpHandler);
app.post("/auth/forgot-password", forgotPasswordHandler);
app.post("/auth/update-password", updatePasswordHandler);

// order
app.post("/order/new", newOrderHandler);
app.get("/order/list", listOrderHandler);
app.post("/order/mark-paid", markOrderPaid);
app.get("/order/get", getOrderHandler);

// profile
app.get("/profile", getProfileHandler);
app.post("/profile/update", updateProfileHandler);

// statistics
app.get("/statistics", getStatisticsHandler);

// admin
app.post("/admin/auth/login", adminLoginHandler);
app.get("/admin/order/get", adminGetOrderHandler);
app.post("/admin/order/update-status", updateOrderStatusHandler);
app.get("/admin/orders/list-paid", listPaidOrdersHandler);

app.use(express.static("public"));

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
