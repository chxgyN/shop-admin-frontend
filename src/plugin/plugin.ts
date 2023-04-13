import SvgIcon from "@/components/common/SvgIcon.vue"

// 定义一个对象，该对象包含一个install方法，用于在Vue中安装插件
const componentPlugin: any = {
  // install方法的作用是加载SVG图标,并且将SvgIcon组件注册为全局组件
  install: function (vue: any, options: any) {
    // 如果传入的options对象存在且包含imports属性，并且imports属性是一个非空数组
    if (
      options &&
      options.imports &&
      Array.isArray(options.imports) &&
      options.imports.length > 0
    ) {
      // 按需引入图标
      const { imports } = options
      imports.forEach((name: any) => {
        require(`@/assets/svg/${name}.svg`);
      })
    } else {
      // 全量引入图标
      // require.context方法来加载SVG图标。会在@/assets/svg目录下查找所有以.svg结尾的文件
      // require.context方法接收三个参数：要搜索的目录、是否搜索子目录、以及匹配文件名的正则表达式。
      // 这个方法返回一个函数，这个函数可以用于获取匹配的模块
      const ctx = require.context("@/assets/svg", false, /\.svg$/)
      // 遍历所有匹配模块的路径
      ctx.keys().forEach(path => {
        // \.\/ 匹配以.开头的字符串 | 
        // ([A-Za-z0-9\-_]+) 匹配文件名
        // \.svg 匹配.svg
        // $: 匹配字符串的结尾
        const temp = path.match(/\.\/([A-Za-z0-9\-_]+)\.svg$/)
        if (!temp) return
        const name = temp[1]
        // 匹配到的SVG文件路径转换为模块路径，
        // 并使用require方法加载该模块，
        // 从而将SVG文件添加到Webpack打包的资源中。
        require(`@/assets/svg/${name}.svg`)
      })
    }
    // 在Vue中注册SvgIcon组件
    vue.component(SvgIcon.name, SvgIcon)
  }
}
export default componentPlugin
