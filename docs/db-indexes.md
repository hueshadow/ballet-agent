# 数据库索引配置

在微信开发者工具「云开发控制台 → 数据库 → 对应集合 → 索引管理」中手动创建以下索引。

## users
| 索引名 | 字段 | 排序 |
|--------|------|------|
| `_openid_1` | `_openid` | 升序 |

## studios
| 索引名 | 字段 | 排序 |
|--------|------|------|
| `_openid_name` | `_openid` 升序, `name` 升序 |

## teachers
| 索引名 | 字段 | 排序 |
|--------|------|------|
| `_openid_studioIds` | `_openid` 升序, `studioIds` 升序 |

## courseTypes
| 索引名 | 字段 | 排序 |
|--------|------|------|
| `_openid_builtIn` | `_openid` 升序, `builtIn` 升序 |

## lessons
| 索引名 | 字段 | 排序 |
|--------|------|------|
| `_openid_date` | `_openid` 升序, `date` 降序 |
| `_openid_studioId` | `_openid` 升序, `studioId` 升序 |
| `_openid_teacherId` | `_openid` 升序, `teacherId` 升序 |

## moveCheckins
| 索引名 | 字段 | 排序 |
|--------|------|------|
| `_openid_moveKey_date` | `_openid` 升序, `moveKey` 升序, `date` 降序 |

## moveAssets
| 索引名 | 字段 | 排序 |
|--------|------|------|
| `moveKey_1` | `moveKey` 升序 |

## dailySigns
| 索引名 | 字段 | 排序 |
|--------|------|------|
| `_openid_date` | `_openid` 升序, `date` 降序 |

## schedules
| 索引名 | 字段 | 排序 |
|--------|------|------|
| `_openid_date` | `_openid` 升序, `date` 升序 |

## reminderLogs
| 索引名 | 字段 | 排序 |
|--------|------|------|
| `_openid_scheduleId_kind` | `_openid` 升序, `scheduleId` 升序, `kind` 升序 |
