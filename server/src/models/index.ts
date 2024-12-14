import { Product } from "./product.model";
import { User } from "./user.model";
import { Order } from "./order.model";
import { Category } from "./category.model";
import { Attribute } from "./attribute.model";
import { Image } from "./image.model";

export * from "./user.model";
export * from "./category.model";
export * from "./product.model";
export * from "./attribute.model";
export * from "./order.model";
export * from "./image.model";

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

Product.hasMany(Attribute, { foreignKey: "productId" });
Attribute.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(Order, { foreignKey: "productId" });
Order.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(Image, { foreignKey: "productId" });
Image.belongsTo(Product, { foreignKey: "productId" });
