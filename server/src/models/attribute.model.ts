import { sequelize } from "../config/database";
import { DataTypes } from "sequelize";
import { Product } from "./product.model";

export const Attribute = sequelize.define(
  "Attribute",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
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
    tableName: "attributes",
    timestamps: false,
  },
);
