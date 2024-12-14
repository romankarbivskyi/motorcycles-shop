import { sequelize } from "../config/database";
import { DataTypes } from "sequelize";
import { Product } from "./product.model";

export const Image = sequelize.define(
  "Image",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
    },
  },
  {
    tableName: "images",
    timestamps: false,
  },
);
