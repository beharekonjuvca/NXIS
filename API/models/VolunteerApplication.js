"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VolunteerApplication extends Model {
    static associate(models) {
      VolunteerApplication.belongsTo(models.VolunteerOpportunity, {
        foreignKey: "opportunityId",
        as: "opportunity",
      });
      VolunteerApplication.belongsTo(models.User, {
        foreignKey: "volunteerId",
        as: "volunteer",
      });
    }
  }

  VolunteerApplication.init(
    {
      opportunityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "VolunteerOpportunities",
          key: "id",
        },
      },
      volunteerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "VolunteerApplication",
      timestamps: true,
    }
  );

  return VolunteerApplication;
};
