import { DataTypes } from "sequelize";
import { Category } from "./category.model";
import { sequelize } from "../config/database";

export const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    description: DataTypes.STRING,
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
    },
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
        key: "id",
      },
    },
  },
  {
    tableName: "products",
    timestamps: false,
  },
);
