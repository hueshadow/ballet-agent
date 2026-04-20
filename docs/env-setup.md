# 环境配置指南

## 1. 微信小程序 AppID

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册小程序（个人主体即可）
3. 在「开发 → 开发管理 → 开发设置」获取 AppID
4. 将 `project.config.json` 中的 `YOUR_APPID` 替换为你的 AppID

## 2. 云开发环境

1. 在微信开发者工具中打开本项目
2. 点击「云开发」按钮，开通云开发
3. 创建环境（如 `ballet-prod`），记下环境 ID
4. 将 `miniprogram/app.js` 中的 `YOUR_CLOUD_ENV_ID` 替换为你的环境 ID

## 3. 初始化数据库

1. 在微信开发者工具中，右键 `cloudfunctions/db-init` → 上传并部署
2. 在云开发控制台调用 `db-init` 云函数，创建所有集合
3. 按照 `docs/db-indexes.md` 手动创建索引

## 4. Gemini API 代理（M5 日签用，可后续配置）

在云开发控制台 → 对应云函数 → 编辑环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `GEMINI_PROXY_URL` | Cloudflare Workers / VPS 代理地址 | `https://your-worker.your-domain.workers.dev` |
| `GEMINI_API_KEY` | Gemini API Key | `AIza...` |

这些环境变量只在云函数中使用，不会下发到小程序前端。
