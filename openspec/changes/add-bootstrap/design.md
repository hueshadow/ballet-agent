## Context
这是一个微信原生小程序 + 云开发项目，MVP 阶段单用户自用，但数据模型需为多用户预留。需要建立坚实的基建层，后续所有功能模块在此基础上开发。

## Goals / Non-Goals
- Goals:
  - 完成小程序项目脚手架，开发者工具可直接运行
  - 云开发环境就绪，10 个集合已创建并有正确索引
  - `_openid` 隔离从第一天起生效
  - 5-Tab 导航可正常切换
  - 全局样式基线就位（黑白极简风）
- Non-Goals:
  - 不实现任何业务功能
  - 不做多端适配
  - 不做 CI/CD 配置

## Decisions

### 项目结构
```
miniprogram/
  app.js / app.json / app.wxss
  pages/
    home/          # Tab 1 - 首页看板
    lessons/       # Tab 2 - 记录列表
    checkin/       # Tab 3 - 快速打卡（非 Tab 页，由 + 号触发）
    moves/         # Tab 4 - 动作库
    profile/       # Tab 5 - 我的
  components/      # 公共组件
  utils/           # 工具函数
  styles/          # 公共样式 token
cloudfunctions/
  common/          # 公共模块（鉴权、响应格式、_openid 工具）
project.config.json
```

### 云函数架构
按业务域划分云函数，每个云函数内通过 `action` 参数分发：
- `lesson`：课时记录 CRUD
- `studio`：机构老师管理
- `user`：用户档案
- `schedule`：课表与提醒
- `move`：动作打卡
- `sign`：AI 日签
- `data`：数据导入导出

### _openid 隔离方案
云函数公共模块提供 `getOpenId(cloud)` 方法，所有数据库操作必须通过此方法获取 openid 并作为查询条件。

### 数据库索引策略
每个集合以 `_openid` 为首字段建立复合索引，高频查询字段（如 lessons 的 date、studioId）作为第二字段。

## Risks / Trade-offs
- 云开发免费额度有限（2GB 数据库），但 MVP 单用户阶段远不会触及
- 不使用 TypeScript，降低了类型安全但减少了构建复杂度，MVP 阶段可接受

## Open Questions
- 用户需要在微信后台创建小程序 AppID 和云开发环境（bootstrap 文档会包含步骤）
