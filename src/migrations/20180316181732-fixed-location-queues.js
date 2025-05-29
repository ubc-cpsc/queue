export function up(queryInterface, Sequelize) {
  return queryInterface.addColumn('queues', 'fixedLocation', {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    after: 'location',
  })
}

export function down(queryInterface, _Sequelize) {
  return queryInterface.removeColumn('queues', 'fixedLocation')
}
