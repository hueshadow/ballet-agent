# Project Context

## Purpose
芭蕾个人课时管家 —— 面向成人业余芭蕾爱好者的微信小程序，提供跨机构课时记录、成长档案、动作打卡与 AI 日签功能。MVP 阶段为单用户自用工具，数据模型从第一天起为多用户 + 多机构预留。

## Tech Stack
- **前端**：微信原生小程序（WXML + WXSS + JS）
- **后端**：微信云开发 CloudBase（云函数 + 云数据库 + 云存储）
- **数据库**：云开发文档型数据库（MongoDB 风格）
- **图表**：ec-canvas（官方微信版 ECharts）
- **AI 生图**：Gemini（Imagen），通过用户自有 Cloudflare Workers 代理访问
- **海报兜底**：小程序 Canvas 2D
- **语音输入**：wx.getRecorderManager + 微信语音识别插件
- **设计资产**：modern-frontend-design skill 统一产出

## Project Conventions

### Code Style
- 文件命名：kebab-case（如 `lesson-list.js`、`lesson-list.wxml`）
- 变量/函数：camelCase
- 常量：UPPER_SNAKE_CASE
- 云函数目录：`cloudfunctions/<function-name>/`
- 页面目录：`miniprogram/pages/<page-name>/`
- 组件目录：`miniprogram/components/<component-name>/`
- 每个页面/组件一个目录，包含 .js/.wxml/.wxss/.json 四件套

### Architecture Patterns
- **数据隔离**：所有云函数查询必须加 `_openid = auth.openid` 条件
- **云函数粒度**：按业务域划分（如 `lesson`、`studio`、`schedule`），单个云函数内用 action 参数分发
- **前端状态**：页面级 data + app.globalData，不引入额外状态管理库
- **文件上传**：前端压缩后直接调用 wx.cloud.uploadFile，返回 fileID 存数据库
- **错误处理**：云函数统一返回 `{ code, data, message }` 结构

### Testing Strategy
- MVP 阶段以真机体验版手动测试为主
- 云函数关键逻辑可写单元测试（Jest）
- 不做 E2E 自动化测试

### Git Workflow
- 主分支：`main`
- 功能分支：`feat/<module-name>`（如 `feat/bootstrap`、`feat/lesson-record`）
- 提交信息：中文，格式 `<type>(<scope>): <subject>`（如 `feat(M2): 新增上课记录表单`）
- 每个 OpenSpec change proposal 对应一个功能分支

## Domain Context
- **课时**：单节课的累计，可按"节数"或"小时数"统计
- **打卡**：在小程序里为一件事留下时间标记（上课打卡、动作打卡）
- **日签**：每天的签到海报，芭蕾主题插画 + 文案 + 日期水印，用于社交媒体分享
- **把杆（Barre）**：扶着把杆做的基础训练
- **中间（Center）**：离开把杆在教室中间做的训练
- **课型**：基训、把杆、中间、跳跃、足尖、编舞、汇演排练等
- **机构**：芭蕾工作室/舞蹈学校

## Important Constraints
- MVP 只发布小程序体验版，不提交审核、不上架
- MVP 唯一用户为产品负责人本人
- 云开发使用免费额度（数据库 2GB、存储 5GB、CDN 5GB/月）
- Gemini API 不可直达，必须通过用户自有代理中转
- API Key 和代理地址只在云函数环境变量中使用，不下发到前端
- 视频/照片默认仅当前用户可见

## External Dependencies
- 微信小程序平台 & 开发者工具
- 微信云开发 CloudBase
- Gemini API（通过 Cloudflare Workers 代理）
- ec-canvas 图表库

## Navigation Structure
5 底部 Tab：
1. 首页（M3 统计看板）
2. 记录（M2 课时列表）
3. 中间 + 号（快速打卡入口）
4. 动作库（M4）
5. 我的（M1 档案 + M6 机构老师 + M7 课表 + M8/M9 数据管理 + 设置）
