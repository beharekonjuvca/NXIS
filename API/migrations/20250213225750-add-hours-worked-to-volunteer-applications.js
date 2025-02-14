"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("VolunteerApplications", "hoursWorked", {
      type: Sequelize.INTEGER,
      allowNull: true, // Initially null until updated
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("VolunteerApplications", "hoursWorked");
  },
};
