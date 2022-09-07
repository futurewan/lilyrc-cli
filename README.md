# 一键生成前端工程
用于生成前端基础工程项目（react版），脚手架包含webpack相关配置，零配置即可启动和打包项目。

## 安装初始化工具
`npm i -g lilyrc-cli-create`

### 初始化项目
`lilyrc-cli-create <project-name>`

## 安装打包工具
初始化的项目中会安装打包工具`lilyrc-cli`依赖
### 启动开发环境
```
lilyrc-cli start
```

### 打包
```
lilyrc-cli build
```

## 环境变量配置
env目录存放不同环境所需的全局变量。
命名规范：.env.{环境标识}（e.g.：.env.production）
启动命令：
```shell
lilyrc-cli start --env test
lilyrc-cli build --env production
```
**.env**文件存放一些通用固定的变量，省去在所有的环境都定义一遍。

## 配置选项
`start`和`build`命令默认会使用根目录下 lilyrc.config.js 文件作为默认配置项。   
也可使用 `--config <configPath>`来指定路径
有哪些可以配置的项：

- 启动项目类参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | ------- | --- | --- |
| port | 开发环境端口，如果当前端口被暂用，端口号+1 | number | 8001 |
| proxy | 开发环境 proxy 代理，语法参考[http-proxy-middleware](https://webpack.js.org/configuration/dev-server/#devserverproxy)  | object | - |




- 打包项目类参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | ------- | --- | --- |
| outputPath | 打包输出目录<br/>这里支持二级目录，e.g. dist/pro1 | string | - |
| publicPath | 资源的基础路径，一般用在资源放在cdn上，需要配置其路径；同`webpack`的`output.publicPath` | string | / |
| copy | 静态资源，拷贝至`outputPath`目录<br/> 使用方法参考 [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) 插件patterns参数，<br/>e.g. ```[{from:'public',to:'assets'}]``` | object[] | `[{ from: 'favicon.ico'}]` |


## 开启 `webpack-bundle-analyzer` 包分析
```
lilyrc-cli build --report true
```

## 工程介绍
### 技术栈
`React`、`TypeScript`、`Webpack5`
### 编码规范
- `ESLint`代码检查工具配合`airbnb`整套风格对`TypeScript`文件编码约束。
- `Stylelint`样式检查工具配合`stylelint-less`对`Less`文件编码约束。
- `Prettier`基于上面两个工具的规则，对代码进行格式化；当然最佳实践还需要配置VSCode实现自动格式化。
- `husky`工具使用Git Hooks自动化检查代码
  - `lint-staged`配合`husky`在提交代码前对代码检查是否符合`ESLint`和`Stylelint`配置的规则
  - `commitlint`配合`husky`校验提交的commit信息是否符合规范

### 其他工具
- `PostCSS` CSS的转换工具
  - `autoprefixer`：添加浏览器特定前缀
  - `postcss-pxtorem`：px转rem单位