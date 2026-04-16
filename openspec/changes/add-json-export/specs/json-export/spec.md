## ADDED Requirements

### Requirement: 一键导出 JSON
系统 SHALL 支持用户在"我的"页一键导出个人全部数据。云函数遍历当前用户名下的所有集合（users、studios、teachers、courseTypes、lessons、moveCheckins、dailySigns、schedules），打包为一个 JSON 文件。照片和视频以 fileID 引用，不嵌入二进制。每次全量导出，不做增量。

#### Scenario: 一键导出成功
- **WHEN** 用户点击"一键导出"
- **THEN** 系统开始导出，界面显示 loading
- **THEN** 导出完成后用户可将 JSON 文件保存到手机

#### Scenario: 导出数据完整性
- **WHEN** 用户有 500 条上课记录、20 个打卡视频、10 张日签
- **THEN** 导出的 JSON 包含全部数据，无遗漏

#### Scenario: 导出失败重试
- **WHEN** 云函数执行超时或网络错误
- **THEN** 界面显示错误提示和重试按钮

#### Scenario: 无数据导出
- **WHEN** 用户无任何数据时点击导出
- **THEN** 提示"暂无数据可导出"
