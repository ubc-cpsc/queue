export function up(queryInterface, _Sequelize) {
  return queryInterface.addIndex('users', ['isAdmin'])
}

export function down(queryInterface, _Sequelize) {
  return queryInterface.removeIndex('users', ['isAdmin'])
}
