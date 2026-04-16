## Why
用户档案是成长档案的主体，机构/老师是上课记录的核心关联实体。两者是后续所有模块（课时记录、统计、课表）的数据依赖，需优先实现。

## What Changes
- M1 用户档案：首次进入引导填写、"我的"页编辑、微信头像昵称获取
- M6 机构管理：机构 CRUD（名称、城市、地址、logo）
- M6 老师管理：老师 CRUD（名称、所属机构多选、简介、头像）
- 课型词典：8 个预置课型 + 用户自定义新增
- "我的"页面入口整合

## Impact
- Affected specs: user-profile（新建）、studio-teacher-mgmt（新建）
- Affected code: miniprogram/pages/profile/、cloudfunctions/user/、cloudfunctions/studio/
