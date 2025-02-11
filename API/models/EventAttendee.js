"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EventAttendee extends Model {
    static associate(models) {
      EventAttendee.belongsTo(models.Event, {
        foreignKey: "eventId",
        as: "event",
      });
      EventAttendee.belongsTo(models.User, {
        foreignKey: "volunteerId",
        as: "volunteer",
      });
    }
  }

  EventAttendee.init(
    {
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      volunteerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("attending", "not attending"),
        defaultValue: "attending",
      },
    },
    {
      sequelize,
      modelName: "EventAttendee",
      timestamps: true,
    }
  );

  return EventAttendee;
};
