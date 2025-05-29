export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.addColumn(
      'courses',
      'isUnlisted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        after: 'shortcode',
      },
      { transaction }
    )
    await queryInterface.addColumn(
      'courses',
      'questionFeedback',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        after: 'isUnlisted',
      },
      { transaction }
    )
  })
}

export async function down(queryInterface, _Sequelize) {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.removeColumn('courses', 'isUnlisted', {
      transaction,
    })
    await queryInterface.removeColumn('courses', 'questionFeedback', {
      transaction,
    })
  })
}
