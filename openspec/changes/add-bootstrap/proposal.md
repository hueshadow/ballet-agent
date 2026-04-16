## Why
项目从零开始，需要搭建微信原生小程序脚手架、初始化云开发环境、建立数据库集合 schema、实现用户鉴权和 `_openid` 数据隔离中间件、配置 5-Tab 导航结构。这是所有功能模块的共享基建。

## What Changes
- 初始化小程序项目结构（miniprogram/ + cloudfunctions/）
- 配置 app.json 五底部 Tab 导航
- 创建云开发环境并初始化 10 个数据库集合（users、studios、teachers、courseTypes、lessons、moveCheckins、moveAssets、dailySigns、schedules、reminderLogs）
- 实现云函数鉴权公共模块，所有查询强制 `_openid` 过滤
- 配置云函数统一响应格式 `{ code, data, message }`
- 创建全局样式基线（极简黑白 Apple/Linear 风）
- 提供环境变量配置模板（GEMINI_PROXY_URL、GEMINI_API_KEY）

## Impact
- Affected specs: bootstrap（新建）
- Affected code: 项目根目录结构、app.js、app.json、app.wxss、cloudfunctions/common/
