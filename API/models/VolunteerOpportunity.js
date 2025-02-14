"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VolunteerOpportunity extends Model {
    static associate(models) {
      VolunteerOpportunity.belongsTo(models.NGOProfile, {
        foreignKey: "ngoId",
        as: "ngo",
      });
      VolunteerOpportunity.hasMany(models.VolunteerApplication, {
        foreignKey: "opportunityId",
        as: "applications",
      });
    }
  }

  VolunteerOpportunity.init(
    {
      ngoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "NGOProfiles",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "VolunteerOpportunity",
    }
  );

  return VolunteerOpportunity;
};
