"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class NGOProfile extends Model {
    static associate(models) {
      NGOProfile.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }

  NGOProfile.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "NGOProfile",
    }
  );

  return NGOProfile;
};
