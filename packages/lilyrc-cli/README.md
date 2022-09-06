# 打包`lilyrc-cli-create`脚手架生成的工程

## 安装
```
npm i lilyrc-cli
```

## 启动开发环境
```
lilyrc-cli start
```

## 打包
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
| 参数 | 说明 | 类型 | 默认值 |
| --- | ------- | --- | --- |
| outputPath | 打包输出目录<br/>这里支持二级目录，e.g. dist/pro1 | string | - |
| publicPath | 资源的基础路径，一般用在资源放在cdn上，需要配置其路径；同`webpack`的`output.publicPath` | string | / |
| copy | 静态资源，拷贝至`outputPath`目录<br/> `copy-webpack-plugin`插件使用方法，<br/>e.g. ```[{from:'public',to:'assets'}]``` | object[] | `[{ from: 'favicon.ico'}]` |


## 开启 `webpack-bundle-analyzer` 包分析
```
lilyrc-cli build --report true
```

