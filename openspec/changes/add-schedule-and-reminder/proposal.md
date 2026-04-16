## Why
用户需要管理未来的上课安排，并在课前收到提醒避免遗忘，课后收到补录提醒确保记录完整。个人课表是"上课提醒"的数据源，也提供了课表→记录的快捷转化路径。

## What Changes
- M7 课表 CRUD：日期+时间+时长+机构+老师+课型+重复规则+提醒提前量
- 日历视图（月/周切换）+ 即将到来 7 天课程卡片
- 课表条目一键生成上课记录（预填信息）
- 课前提醒：订阅消息 + 云函数定时任务
- 课后补录提醒：结束时间 + 2 小时后提醒

## Impact
- Affected specs: schedule-reminder（新建）
- Affected code: miniprogram/pages/schedule/、cloudfunctions/schedule/、云函数定时触发器
