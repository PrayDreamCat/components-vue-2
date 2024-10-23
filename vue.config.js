const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  //开启代理服务器:
  devServer: {
    proxy: {
      //  /api开头的请求会被代理到https://localhost:5000
      //  只要请求前缀是'/api1'，就把服务给5000这台服务器
      //  '/api1'：（请求前缀）  匹配所有以 '/api1'开头的请求路径
      "/api": {
        target: "https://localhost:5000", // 代理目标的基础路径
        changeOrigin: true, //用于控制请求中的host值（向目标服务器撒谎）【当5000问代理服务器 他的端口号时候 回答5000，不回答自身真实的8080】
        pathRewrite: { "^/api": "" },
        // 把匹配到的/api1 变成空字符串（在5000里面，没有/api1路径）
      },
    },
  },
});
