## Why
用户需要量化自己的成长轨迹——看到累计课时、月度趋势、机构/老师/课型分布，以及里程碑达成。统计看板是首页的核心内容，也是产品差异化价值的集中体现。

## What Changes
- 首页卡片：本月课时、累计课时、本周进度条（目标 vs 实际）、最近一节课距今天数
- 统计页图表（ec-canvas）：近 12 个月课时折线图、机构分布饼图、老师 Top10 条形图、课型分布饼图
- 成长里程碑：第 10/50/100/200/500/1000 节课达成时间

## Impact
- Affected specs: stats-dashboard（新建）
- Affected code: miniprogram/pages/home/、miniprogram/pages/stats/、cloudfunctions/lesson/（统计查询 action）
