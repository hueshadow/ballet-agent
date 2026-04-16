## Why
用户将补录上千条珍贵的历史课时数据，需要应急数据备份能力。一键导出 JSON 作为 MVP 的数据安全兜底，让用户对数据存储有信心。

## What Changes
- "我的"页新增"一键导出"入口
- 云函数遍历当前用户的全部集合（users、studios、teachers、courseTypes、lessons、moveCheckins、dailySigns、schedules），打包为一个 JSON 文件
- 照片/视频以 fileID 引用，不嵌入二进制
- 通过 wx.saveFileToDisk 或复制链接交给用户

## Impact
- Affected specs: json-export（新建）
- Affected code: miniprogram/pages/profile/（导出入口）、cloudfunctions/data/（导出 action）
