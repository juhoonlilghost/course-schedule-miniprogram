# Build Snake Game Spec

## Why
基于微信小程序云开发实现贪吃蛇游戏，利用云数据库实现玩家分数的持久化存储和排行榜功能。

## What Changes
- 配置云环境ID为 `cloud1-d4g49nkkyd53a1417`
- 新增游戏页面 `/pages/game/game`
- 新增排行榜页面 `/pages/rank/rank`
- 新增游戏核心逻辑工具文件 `/miniprogram/utils/gameLogic.js`
- 新增3个云函数：saveScore、getLeaderboard、getUserBestScore
- 首页改造为游戏入口页面

## Impact
- Affected specs: 游戏核心、分数系统、排行榜、数据持久化
- Affected code: app.js, app.json, pages/index/*, cloudfunctions/*

## ADDED Requirements
### Requirement: Game Core
系统 SHALL 提供贪吃蛇游戏核心功能，包括蛇移动、食物生成、碰撞检测、分数计算。

#### Scenario: 游戏进行
- WHEN 用户点击开始游戏
- THEN 游戏画布显示蛇和食物，蛇自动移动
- WHEN 蛇吃到食物
- THEN 蛇身体增长，分数增加
- WHEN 蛇碰到边界或自身
- THEN 游戏结束，显示最终分数

### Requirement: Score System
系统 SHALL 实时计算并显示游戏分数。

#### Scenario: 分数显示
- WHEN 游戏进行中
- THEN 页面顶部显示当前分数
- WHEN 游戏结束
- THEN 弹出最终分数显示

### Requirement: Leaderboard
系统 SHALL 提供排行榜功能，展示玩家分数排名。

#### Scenario: 查看排行榜
- WHEN 用户点击排行榜
- THEN 显示按分数降序排列的玩家列表（最多10条）

### Requirement: Data Persistence
系统 SHALL 使用云数据库存储玩家分数记录。

#### Scenario: 保存分数
- WHEN 游戏结束后
- THEN 玩家分数自动保存到云数据库 scores 集合

## MODIFIED Requirements
### Requirement: Cloud Environment
app.js 中的云环境配置 SHALL 更新为 `cloud1-d4g49nkkyd53a1417`

## Database Design
**集合名称**: `scores`
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 自动生成 |
| openid | String | 是 | 用户唯一标识 |
| nickName | String | 是 | 用户昵称 |
| avatarUrl | String | 否 | 用户头像 |
| score | Number | 是 | 游戏分数 |
| date | Date | 是 | 游戏日期 |

## Cloud Functions Design
| 云函数名称 | 功能说明 | 参数 | 返回值 |
|------------|----------|------|--------|
| saveScore | 保存玩家分数 | score (Number) | { success: Boolean, message: String } |
| getLeaderboard | 获取排行榜数据 | limit (Number, 默认10) | { success: Boolean, data: Array } |
| getUserBestScore | 获取用户最高分 | 无 | { success: Boolean, score: Number } |

## Page Structure
```
miniprogram/
├── pages/
│   ├── index/           # 首页（游戏入口）
│   ├── game/            # 游戏页面
│   └── rank/            # 排行榜页面
├── utils/
│   └── gameLogic.js     # 游戏核心逻辑
├── app.js
├── app.json
└── app.wxss
```
