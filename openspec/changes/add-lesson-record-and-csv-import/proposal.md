## Why
上课记录是产品的核心数据实体。用户需要便捷地手动打卡记录每节课的详细信息，也需要通过 CSV 批量导入过往 5 年的历史数据（可能上千条），解决冷启动期逐条手录不现实的痛点。

## What Changes
- M2 上课记录新增：日期、机构、老师、课型、级别、时长、照片、笔记（含语音转文字）、身体状态评分、老师评分、主题标签、愉悦度 emoji、支付方式、来源标记
- M2 记录列表：时间倒序、多维筛选（机构/老师/月份/课型/标签/愉悦度）、关键字搜索
- M2 记录详情：完整信息展示、照片轮播、编辑/删除、一键生成日签入口、快捷复制新建
- M8 CSV 导入：下载模板 → 电脑填写 → 上传 → 预览校验 → 批量写入

## Impact
- Affected specs: lesson-record（新建）、csv-import（新建）
- Affected code: miniprogram/pages/lessons/、miniprogram/pages/lesson-add/、miniprogram/pages/lesson-detail/、cloudfunctions/lesson/、cloudfunctions/data/
