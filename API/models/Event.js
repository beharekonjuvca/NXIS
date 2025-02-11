"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      Event.belongsTo(models.NGOProfile, { foreignKey: "ngoId", as: "ngo" });
      Event.hasMany(models.EventAttendee, {
        foreignKey: "eventId",
        as: "attendees",
      });
    }
  }

  Event.init(
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
    },
    {
      sequelize,
      modelName: "Event",
    }
  );

  return Event;
};
