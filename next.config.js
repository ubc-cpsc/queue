require('dotenv-flow').config({
  // eslint-disable-next-line @typescript-eslint/camelcase
  default_node_env: 'development',
})

module.exports = {
  useFileSystemPublicRoutes: false,
  assetPrefix: process.env.BASE_URL || '',
  publicRuntimeConfig: {
    uidName: process.env.UID_NAME || 'email',
    uidArticle: process.env.UID_ARTICLE || 'an',
    institutionName: process.env.INSTITUTION_NAME || 'Illinois',
  },
}
