export function up(queryInterface, Sequelize) {
  return queryInterface.addColumn('queues', 'isConfidential', {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    after: 'messageEnabled',
  })
}

export function down(queryInterface, _Sequelize) {
  return queryInterface.removeColumn('queues', 'isConfidential')
}
