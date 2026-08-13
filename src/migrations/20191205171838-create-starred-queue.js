module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('starredQueues', {
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        queueId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'queues',
            key: 'id',
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
        },
        userId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
        },
      })
      .then(() => {
        return queryInterface.addConstraint('starredQueues', {
          fields: ['queueId', 'userId'],
          type: 'primary key',
        })
      })
  },

  down: (queryInterface, _Sequelize) => {
    return queryInterface.dropTable('starredQueues')
  },
}
