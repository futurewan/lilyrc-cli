# `lilyrc-cli-create`脚手架的模板工程

## 技术栈
`React`、`TypeScript`、`Webpack5`
## 编码规范
- `ESLint`代码检查工具配合`airbnb`整套风格对`TypeScript`文件编码约束。
- `Stylelint`样式检查工具配合`stylelint-less`对`Less`文件编码约束。
- `Prettier`基于上面两个工具的规则，对代码进行格式化；当然最佳实践还需要配置VSCode实现自动格式化。
- `husky`工具使用Git Hooks自动化检查代码
  - `lint-staged`配合`husky`在提交代码前对代码检查是否符合`ESLint`和`Stylelint`配置的规则
  - `commitlint`配合`husky`校验提交的commit信息是否符合规范

## 环境变量配置
env目录存放不同环境所需的全局变量。
命名规范：.env.{环境标识}

## 其他工具
- `PostCSS` CSS的转换工具
  - `autoprefixer`：添加浏览器特定前缀
  - `postcss-pxtorem`：px转rem单位

需要使用`lilyrc-cli`对项目打包


