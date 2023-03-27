module.exports = {
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')
    // 清除已有的所有 loader
    // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
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
    port: 8080,
    https: false,
    //以上的ip和端口是我们本机的;下面为需要跨域的
    // proxy: { //配置跨域
    //     '/api': {
    //         target: 'http://localhost:3000/', //这里后台的地址模拟的;应该填写你们真实的后台接口
    //         ws: true,
    //         changOrigin: true, //允许跨域
    //         pathRewrite: {
    //             '^/api': '' //请求的时候使用这个api就可以
    //         }
    //     }
    // }
}

}
