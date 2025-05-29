export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.addColumn(
      'queues',
      'admissionControlEnabled',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        after: 'isConfidential',
      },
      { transaction }
    )
    await queryInterface.addColumn(
      'queues',
      'admissionControlUrl',
      {
        type: Sequelize.TEXT,
        after: 'admissionControlEnabled',
      },
      { transaction }
    )
  })
}

export async function down(queryInterface, _Sequelize) {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.removeColumn('queues', 'admissionControlEnabled', {
      transaction,
    })
    await queryInterface.removeColumn('queues', 'admissionControlUrl', {
      transaction,
    })
  })
}
