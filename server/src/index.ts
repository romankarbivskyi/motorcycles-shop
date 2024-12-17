import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRoute from "./routes/auth.route";
import { sequelize } from "./config/database";
import bodyParser from "body-parser";
import productsRoute from "./routes/products.route";
import categoriesRoute from "./routes/categories.route";
import usersRoute from "./routes/users.route";
import ordersRoute from "./routes/orders.route";
import reviewsRoute from "./routes/reviews.route";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("uploads"));

app.use("/api/auth", authRoute);
app.use("/api/products", productsRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/users", usersRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/reviews", reviewsRoute);

app.use(errorMiddleware as any);

const PORT = process.env.PORT || 3000;

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    await sequelize.sync({ force: true });
    console.log("Successfully synced models.");

    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

main();
