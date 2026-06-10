# 课程表管理微信小程序 Spec

## Why
当前项目是基于贪吃蛇小游戏的模板，需要改造成一个功能完整的课程表管理微信小程序，帮助学生管理课程安排。已有完整的设计方案（task_plan.md），需要按照方案实施。

## What Changes
- 创建数据库集合 `courses` 并配置权限和索引
- 创建 5 个云函数：addCourse, updateCourse, deleteCourse, getCourseList, getCourseDetail
- 修改 app.json 全局配置
- 开发 3 个页面：课程列表页、添加/编辑课程页、课程详情页
- 开发 1 个组件：课程卡片组件

## Impact
- Affected specs: 数据库管理、云函数开发、前端页面开发
- Affected code: app.json, 新建页面和云函数文件

## ADDED Requirements
### Requirement: 课程数据库集合
系统 SHALL 提供 `courses` 集合存储课程数据，权限设置为"仅创建者可读写"，并配置 dayOfWeek 普通索引和 dayOfWeek+startTime 复合索引。

#### Scenario: 用户创建课程
- **WHEN** 用户提交课程表单
- **THEN** 课程数据保存到 courses 集合，自动注入 _openid 字段

### Requirement: 课程云函数
系统 SHALL 提供 5 个云函数处理课程的增删改查操作。

#### Scenario: 添加课程
- **WHEN** 用户提交添加课程表单
- **THEN** addCourse 云函数验证数据并保存到数据库

### Requirement: 前端页面
系统 SHALL 提供 3 个页面和 1 个组件实现课程管理界面。

#### Scenario: 查看课程列表
- **WHEN** 用户打开小程序
- **THEN** 显示课程列表，支持按星期筛选
