import { sequelize } from "../config/database";
import { DataTypes } from "sequelize";
import { User } from "./user.model";
import { Product } from "./product.model";

export const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Completed", "Shipped", "Cancelled"),
      defaultValue: "Pending",
    },
    createAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
    },
  },
  {
    tableName: "orders",
    timestamps: false,
  },
);
