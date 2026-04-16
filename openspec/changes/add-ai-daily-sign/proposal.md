## Why
用户上完课后想快速生成一张精美的芭蕾主题日签分享到小红书。AI 生图让每次日签独一无二，Canvas 兜底保证"一定能出图"，降低用户分享门槛。

## What Changes
- 从上课记录详情页一键生成日签
- 云函数组合 prompt → Cloudflare Workers 代理 → Gemini 生图
- 返回 1080×1920 竖版图（芭蕾插画 + 文案 + 日期水印）
- 兜底：AI 失败时 Canvas 2D 合成静态海报（5-10 套极简黑白模板）
- 50-100 句芭蕾文案库
- 保存到云端日签库 + 长按保存手机相册

## Impact
- Affected specs: ai-daily-sign（新建）
- Affected code: miniprogram/pages/sign-preview/、cloudfunctions/sign/、miniprogram/utils/canvas-templates/
