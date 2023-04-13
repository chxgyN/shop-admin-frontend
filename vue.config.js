module.exports = {
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')
    // 清除已有的所有 loader
    // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
    // 配置Webpack的SVG加载规则，使用svg-sprite-loader将SVG图标打包成雪碧图，并生成唯一的symbol ID。
    svgRule.uses.clear()
    svgRule
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },
  lintOnSave: false,
  devServer: {
    open: true,
    host: 'localhost',
    port: 8848,
    https: false,
  }
}