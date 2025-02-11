"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VolunteerProfile extends Model {
    static associate(models) {
      VolunteerProfile.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  VolunteerProfile.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      skills: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      availability: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      totalHours: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "VolunteerProfile",
    }
  );

  return VolunteerProfile;
};
