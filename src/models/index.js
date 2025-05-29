import { readdirSync } from 'fs'
import { join } from 'path'
import Sequelize from 'sequelize'

require('dotenv-flow').config({
  // eslint-disable-next-line @typescript-eslint/camelcase
  default_node_env: 'development',
})

const CONFIG = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: process.env.DB_LOGGING === 'true',
  storage: process.env.DB_STORAGE, // Sqlite only
}

/**
 * Loads our models into the given Sequelize instance
 * @param  {[type]} sequelize [description]
 * @return {[type]}           [description]
 */
export function initSequelize(sequelize) {
  const models = {}

  readdirSync(__dirname)
    .filter(
      file =>
        file.indexOf('.') !== 0 && file.endsWith('.js') && file !== 'index.js'
    )
    .forEach(file => {
      const model = sequelize.import(join(__dirname, file))
      const modelName = file.substring(0, file.indexOf('.js'))
      models[modelName] = model
    })

  Object.keys(models).forEach(modelName => {
    if ('associate' in models[modelName]) {
      models[modelName].associate(models)
    }
  })

  return models
}

const sequelizeConfig = {
  dialectOptions: {
    multipleStatements: true,
  },
}

let sequelize
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    ...CONFIG,
    ...sequelizeConfig,
  })
} else {
  sequelize = new Sequelize(CONFIG.database, CONFIG.username, CONFIG.password, {
    ...CONFIG,
    ...sequelizeConfig,
  })
}

const models = initSequelize(sequelize)

Object.assign(module.exports, models)

const _sequelize = sequelize
export { _sequelize as sequelize }
const _Sequelize = Sequelize
export { _Sequelize as Sequelize }
const _models = models
export { _models as models }
