## ADDED Requirements

### Requirement: AI 日签生成
系统 SHALL 支持用户基于上课记录一键生成日签图。云函数根据课时信息（日期、机构、老师、课型、笔记、主题标签、愉悦度 emoji）组合 prompt，通过用户自有 Cloudflare Workers 代理调用 Gemini 生图 API，返回一张 1080×1920 竖版图（芭蕾主题插画 + 当日文案 + 日期水印）。

#### Scenario: Gemini 生图成功
- **WHEN** 用户在上课记录详情页点击"生成日签"
- **THEN** 系统调用 Gemini 生图，60 秒内返回结果
- **THEN** 展示日签预览页，用户可"再生成一张"或保存

#### Scenario: 代理或 API 调用失败
- **WHEN** Gemini 代理不可达或 API 返回错误
- **THEN** 自动降级到 Canvas 兜底方案

### Requirement: Canvas 兜底日签
系统 SHALL 提供 5-10 套极简黑白风格的 Canvas 2D 海报模板作为兜底。当 AI 生图失败时，使用 Canvas 合成静态海报，5 秒内出图。模板风格与小程序主界面的极简黑白风一致。

#### Scenario: Canvas 兜底出图
- **WHEN** AI 生图失败触发兜底
- **THEN** 随机选取一套 Canvas 模板，合成包含文案和日期水印的海报
- **THEN** 5 秒内完成并展示预览

### Requirement: 日签文案库
系统 SHALL 内置 50-100 句芭蕾相关短句（诗句、名言、课堂用语、心情短句），生成日签时随机抽取一句叠加在图片上。

#### Scenario: 随机文案叠加
- **WHEN** 生成日签（AI 或 Canvas）
- **THEN** 从文案库随机抽取一句叠加到日签图上

### Requirement: 日签保存与分享
系统 SHALL 支持将日签保存到云端日签库（dailySigns 集合），并支持长按保存到手机相册。MVP 分享仅做保存相册，用户手动打开小红书发布。

#### Scenario: 保存到云端
- **WHEN** 用户在预览页确认满意
- **THEN** 日签图保存到云端 dailySigns 集合，记录来源（gemini / canvas_fallback）

#### Scenario: 保存到手机相册
- **WHEN** 用户长按日签图
- **THEN** 调用 wx.saveImageToPhotosAlbum 保存到相册
- **WHEN** 用户未授权相册权限
- **THEN** 引导用户授权
