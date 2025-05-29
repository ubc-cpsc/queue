import Umzug from 'umzug'
import Sequelize from 'sequelize'
import { createConnection } from 'mysql2/promise'
import { resolve } from 'path'

import { logger } from '../../util/logger'
import { initSequelize } from '../../models'

/**
 * Executes all pending migrations.
 * @return {Promise} A promise that resolves when all migrations are complete
 */
export async function performMigrations(sequelize) {
  logger.info('Running migrations...')
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize,
    },
    migrations: {
      path: resolve(__dirname, '..'),
      params: [sequelize.getQueryInterface(), Sequelize],
    },
  })

  const migrations = await umzug.up()
  migrations.forEach((migration, i) => logger.info(`${i}. ${migration.file}`))
  logger.info(`Ran ${migrations.length} migrations`)
}

/**
 * Verifies that the tables created by Sequelize match the tables created by
 * our migration.
 * @return {Promise} A promise that resolves with the diff when the comparisons are complete
 */
export async function createVerificationDatabases() {
  // We'll skirt around Sequelize for a hot minute and do some manual setup
  const testConnection = await createConnection({
    host: 'localhost',
    user: 'queue',
    charset: 'UTF8MB4_GENERAL_CI',
  })

  // Create test databases to create our test tables in
  await testConnection.query('DROP DATABASE IF EXISTS `queue_sequelize`;')
  await testConnection.query('DROP DATABASE IF EXISTS `queue_migrations`;')
  await testConnection.query('CREATE DATABASE `queue_sequelize`')
  await testConnection.query('CREATE DATABASE `queue_migrations`')

  const sequelizeUri = 'mysql://queue@localhost/queue_sequelize'
  const migrationUri = 'mysql://queue@localhost/queue_migrations'

  const syncedSequelize = new Sequelize(sequelizeUri, {
    dialect: 'mysql',
    operatorsAliases: false,
    dialectOptions: {
      multipleStatements: true,
    },
    logging: false,
  })
  const migrationSequelize = new Sequelize(migrationUri, {
    dialect: 'mysql',
    operatorsAliases: false,
    dialectOptions: {
      multipleStatements: true,
    },
    logging: false,
  })

  // Run migrations on the appropriate database
  await performMigrations(migrationSequelize)

  // Run the Sequelize "sync" on the other database
  initSequelize(syncedSequelize)
  await syncedSequelize.sync({ force: true })

  // Delete the migrations metadata table before diffing
  await migrationSequelize.getQueryInterface().dropTable('SequelizeMeta')

  testConnection.close()
  syncedSequelize.close()
  migrationSequelize.close()
}

export async function destroyVerificationDatabases() {
  // We'll skirt around Sequelize for a hot minute and do some manual setup
  const testConnection = await createConnection({
    host: 'localhost',
    user: 'queue',
    charset: 'UTF8MB4_GENERAL_CI',
  })

  // Cleanup time!
  await testConnection.query('DROP DATABASE IF EXISTS `queue_sequelize`;')
  await testConnection.query('DROP DATABASE IF EXISTS `queue_migrations`;')

  testConnection.close()
}
