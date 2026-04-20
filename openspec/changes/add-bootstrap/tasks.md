## 1. 项目脚手架
- [x] 1.1 初始化小程序项目目录结构（miniprogram/ + cloudfunctions/）
- [x] 1.2 配置 project.config.json（AppID 占位、云开发环境 ID）
- [x] 1.3 编写 app.json 五底部 Tab 导航配置
- [x] 1.4 创建 5 个 Tab 页面骨架（home、lessons、moves、profile + checkin 入口）

## 2. 全局样式
- [x] 2.1 定义全局样式 token（颜色、字号、间距、圆角）—— 极简黑白风
- [x] 2.2 编写 app.wxss 全局基础样式
- [x] 2.3 创建公共样式文件 styles/tokens.wxss

## 3. 云开发初始化
- [x] 3.1 初始化云开发环境（app.js 中 wx.cloud.init）
- [x] 3.2 创建 10 个数据库集合的初始化脚本（含字段说明）
- [x] 3.3 配置数据库索引（_openid 复合索引）
- [x] 3.4 创建环境变量配置模板文档

## 4. 公共模块
- [x] 4.1 实现云函数公共鉴权模块（getOpenId）
- [x] 4.2 实现统一响应格式工具函数 `{ code, data, message }`
- [x] 4.3 实现云函数 action 路由分发框架
- [x] 4.4 创建第一个示例云函数验证基建可用
