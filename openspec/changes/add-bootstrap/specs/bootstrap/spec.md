## ADDED Requirements

### Requirement: 小程序项目脚手架
系统 SHALL 提供完整的微信原生小程序项目结构，包含 miniprogram/ 和 cloudfunctions/ 两个顶层目录，配置文件就绪后可在微信开发者工具中直接运行。

#### Scenario: 开发者工具打开项目
- **WHEN** 开发者在微信开发者工具中打开项目根目录
- **THEN** 项目正常加载，无编译错误，可预览空白页面

### Requirement: 五底部 Tab 导航
系统 SHALL 配置 5 个底部 Tab：首页（看板）、记录（课时列表）、中间加号（快速打卡入口）、动作库、我的。Tab 切换流畅无闪烁。

#### Scenario: 用户切换 Tab
- **WHEN** 用户点击底部任意 Tab
- **THEN** 对应页面正常展示，当前 Tab 高亮

#### Scenario: 中间加号入口
- **WHEN** 用户点击底部中间的 + 号
- **THEN** 弹出新建上课记录表单（或跳转打卡页面）

### Requirement: 云开发环境初始化
系统 SHALL 在 app.js 中完成 wx.cloud.init 调用，配置正确的云开发环境 ID。应用启动时自动连接云开发后端。

#### Scenario: 小程序启动连接云开发
- **WHEN** 小程序冷启动
- **THEN** wx.cloud.init 成功执行，后续云函数调用正常

### Requirement: 数据库集合与索引
系统 SHALL 创建 10 个数据库集合（users、studios、teachers、courseTypes、lessons、moveCheckins、moveAssets、dailySigns、schedules、reminderLogs），每个集合以 `_openid` 为首字段建立复合索引。

#### Scenario: 集合存在且可写入
- **WHEN** 云函数向任意集合写入一条记录
- **THEN** 写入成功，记录包含 `_openid` 字段

### Requirement: _openid 数据隔离
系统 SHALL 提供云函数公共鉴权模块，所有数据库查询 MUST 通过此模块获取当前用户 openid 并作为 where 条件。禁止任何不带 `_openid` 过滤的查询操作。

#### Scenario: 云函数查询自动附加 _openid
- **WHEN** 云函数执行数据库查询
- **THEN** 查询条件中包含 `_openid = 当前用户openid`

#### Scenario: 跨用户数据不可访问
- **WHEN** 用户 A 的云函数试图查询用户 B 的数据
- **THEN** 查询结果为空

### Requirement: 云函数统一响应格式
所有云函数 SHALL 返回统一的 JSON 结构 `{ code: number, data: any, message: string }`。code=0 表示成功，非 0 表示错误。

#### Scenario: 云函数成功响应
- **WHEN** 云函数正常处理请求
- **THEN** 返回 `{ code: 0, data: {...}, message: "ok" }`

#### Scenario: 云函数错误响应
- **WHEN** 云函数处理过程中发生业务错误
- **THEN** 返回 `{ code: 非0错误码, data: null, message: "错误描述" }`

### Requirement: 全局样式基线
系统 SHALL 定义极简黑白风格的全局样式 token（颜色、字号、间距、圆角），作为所有页面和组件的设计基准。禁止使用 Material Design 默认视觉、彩色渐变背景、大圆角大阴影的 soft UI。

#### Scenario: 页面使用统一 token
- **WHEN** 开发者创建新页面
- **THEN** 可通过 @import 引入全局 token，使用统一的颜色和字号变量
