const withCSS = require('@zeit/next-css')
const withTypescript = require('@zeit/next-typescript')

require('./src/dotenv')

module.exports = withTypescript(
  withCSS({
    useFileSystemPublicRoutes: false,
    assetPrefix: process.env.BASE_URL || '',
    publicRuntimeConfig: {
      uidName: process.env.UID_NAME || 'email',
      uidArticle: process.env.UID_ARTICLE || 'an',
      institutionName: process.env.INSTITUTION_NAME || 'Illinois',
    },
  })
)
