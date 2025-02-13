"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.describeTable(
      "VolunteerApplications"
    );

    if (!tableExists.createdAt) {
      await queryInterface.addColumn("VolunteerApplications", "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }

    if (!tableExists.updatedAt) {
      await queryInterface.addColumn("VolunteerApplications", "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("VolunteerApplications", "createdAt");
    await queryInterface.removeColumn("VolunteerApplications", "updatedAt");
  },
};
