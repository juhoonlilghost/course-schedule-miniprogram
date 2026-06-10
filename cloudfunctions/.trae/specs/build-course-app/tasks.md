# Tasks

## 第一阶段：数据库准备（需手动操作）
- [ ] Task 1: 在微信开发者工具中创建数据库集合 `courses`，设置权限为"仅创建者可读写"
- [ ] Task 2: 创建 `dayOfWeek` 普通索引
- [ ] Task 3: 创建 `dayOfWeek,startTime` 复合索引

## 第二阶段：云函数开发（5个云函数）
- [x] Task 4: 创建 `addCourse` 云函数
  - [x] 创建 index.js 实现添加课程逻辑
  - [x] 创建 package.json 和 project.config.json
  - [x] 数据校验（必填字段、格式验证）
- [x] Task 5: 创建 `updateCourse` 云函数
  - [x] 创建 index.js 实现更新课程逻辑
  - [x] 创建 package.json 和 project.config.json
  - [x] 验证创建者权限
- [x] Task 6: 创建 `deleteCourse` 云函数
  - [x] 创建 index.js 实现删除课程逻辑
  - [x] 创建 package.json 和 project.config.json
  - [x] 验证创建者权限
- [x] Task 7: 创建 `getCourseList` 云函数
  - [x] 创建 index.js 实现获取课程列表逻辑
  - [x] 支持按 dayOfWeek 筛选
  - [x] 按 startTime 排序
- [x] Task 8: 创建 `getCourseDetail` 云函数
  - [x] 创建 index.js 实现获取课程详情逻辑
  - [x] 验证创建者权限

## 第三阶段：前端页面开发
- [x] Task 9: 修改 app.json 全局配置
  - [x] 添加页面路由配置
  - [x] 配置导航栏样式
- [x] Task 10: 开发首页 - 课程列表页
  - [x] 创建页面文件（js, json, wxml, wxss）
  - [x] 实现课程列表展示
  - [x] 实现星期 Tab 筛选
  - [x] 添加"添加课程"悬浮按钮
  - [x] 支持下拉刷新
- [x] Task 11: 开发添加/编辑课程页
  - [x] 创建页面文件（js, json, wxml, wxss）
  - [x] 实现表单字段和校验
  - [x] 实现保存和取消功能
  - [x] 支持编辑模式（预填数据）
- [x] Task 12: 开发课程详情页
  - [x] 创建页面文件（js, json, wxml, wxss）
  - [x] 展示课程完整信息
  - [x] 实现编辑和删除功能
  - [x] 删除二次确认
- [x] Task 13: 开发课程卡片组件
  - [x] 创建组件文件（js, json, wxml, wxss）
  - [x] 展示课程基本信息

## 第四阶段：联调测试
- [ ] Task 14: 测试添加课程功能
- [ ] Task 15: 测试课程列表展示和星期筛选
- [ ] Task 16: 测试课程详情查看
- [ ] Task 17: 测试编辑课程功能
- [ ] Task 18: 测试删除课程功能
- [ ] Task 19: 测试权限隔离

# Task Dependencies
- [Task 4] depends on [Task 1] (数据库集合需先创建)
- [Task 5] depends on [Task 1]
- [Task 6] depends on [Task 1]
- [Task 7] depends on [Task 1]
- [Task 8] depends on [Task 1]
- [Task 9] 无依赖
- [Task 10] depends on [Task 7, Task 9]
- [Task 11] depends on [Task 4, Task 9]
- [Task 12] depends on [Task 8, Task 5, Task 6, Task 9]
- [Task 13] depends on [Task 10]
- [Task 14] depends on [Task 4, Task 11]
- [Task 15] depends on [Task 7, Task 10]
- [Task 16] depends on [Task 8, Task 12]
- [Task 17] depends on [Task 5, Task 11, Task 12]
- [Task 18] depends on [Task 6, Task 12]
- [Task 19] depends on [Task 4, Task 7]
