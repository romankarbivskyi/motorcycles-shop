import { sequelize } from "../config/database";
import { DataTypes } from "sequelize";

export const Category = sequelize.define(
  "Category",
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
    description: DataTypes.STRING,
  },
  {
    tableName: "categories",
    timestamps: false,
  },
);
