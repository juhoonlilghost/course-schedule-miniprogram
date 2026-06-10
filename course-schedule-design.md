# 课程表管理微信小程序 — 设计方案

> **云环境 ID**: `cloud1-d4g49nkkyd53a1417`
> **当前项目**: 微信云开发快速入门模板（贪吃蛇游戏）→ 改造为课程表管理小程序

---

## 一、项目概述

### 1.1 项目定位
一款面向大学生的**课程表管理**微信小程序，实现课程的增删改查、日历视图查看、上课提醒等功能。利用微信云开发实现数据持久化，支持多设备登录数据同步。

### 1.2 核心功能需求

| 编号 | 功能模块 | 描述 | 优先级 |
|------|---------|------|--------|
| F1 | 课程列表页 | 按周次展示所有课程，支持按周切换 | P0 |
| F2 | 课程详情页 | 展示单门课程的详细信息 | P0 |
| F3 | 添加课程 | 表单录入课程信息（名称、教师、教室、时间等） | P0 |
| F4 | 编辑课程 | 修改已有课程信息 | P0 |
| F5 | 删除课程 | 删除不需要的课程 | P0 |
| F6 | 日历视图 | 以周历形式直观展示一周课表 | P0 |
| F7 | 用户登录 | 微信授权登录，获取用户 OpenID | P0 |
| F8 | 上课提醒 | 上课前推送提醒（可选） | P1 |

### 1.3 符合的方向要求
- ✅ 有明确的输入 → 处理 → 输出流程
- ✅ 数据使用云数据库存储，换设备登录数据不丢失
- ✅ 至少包含 2 个相关功能页面（列表页 + 详情页 + 添加页）
- ✅ 有基本的数据增删改查操作

---

## 二、数据库设计

### 2.1 云数据库集合

#### 集合 1: `courses`（课程表）

存储用户的课程数据，**一个用户对应多条课程记录**。

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `_id` | String | 自动生成 | 课程记录唯一 ID | `"abc123"` |
| `_openid` | String | 自动生成 | 用户 OpenID（云开发自动注入） | `"oxxxxxxxxxxxxxx"` |
| `courseName` | String | ✅ | 课程名称 | `"高等数学"` |
| `teacher` | String | ✅ | 授课教师 | `"张老师"` |
| `classroom` | String | ✅ | 教室/教室号 | `"教学楼 A301"` |
| `dayOfWeek` | Number | ✅ | 星期几（1=周一，7=周日） | `3` |
| `startSection` | Number | ✅ | 开始节次（第几节课开始） | `1` |
| `endSection` | Number | ✅ | 结束节次 | `2` |
| `startWeek` | Number | ✅ | 开始周次 | `1` |
| `endWeek` | Number | ✅ | 结束周次 | `16` |
| `startTime` | String | ✅ | 上课开始时间 | `"08:00"` |
| `endTime` | String | ✅ | 上课结束时间 | `"09:35"` |
| `note` | String | ❌ | 备注信息 | `"期中考试"` |
| `createTime` | Date | 自动 | 创建时间 | `Date` |
| `updateTime` | Date | 自动 | 更新时间 | `Date` |

**集合权限**: `仅创建者可读写`（用户只能操作自己的课程）

**索引配置**:

| 索引字段 | 索引类型 | 说明 |
|----------|----------|------|
| `_openid` | 唯一索引 | 默认已创建，用于隔离用户数据 |
| `dayOfWeek` | 普通索引 | 用于按星期查询课程 |
| `dayOfWeek + startSection` | 复合索引 | 用于日历视图按时间排序查询 |

**创建方式**: 在微信开发者工具 → 云开发 → 数据库 → 点击「+」创建集合，名称填 `courses`，权限选择「仅创建者可读写」。

---

#### 集合 2: `settings`（用户设置）

存储用户的全局设置，**一个用户一条记录**。

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `_id` | String | 自动生成 | 记录唯一 ID | `"xyz789"` |
| `_openid` | String | 自动生成 | 用户 OpenID | `"oxxxxxxxxxxxxxx"` |
| `semesterStart` | Date | ✅ | 本学期开学日期 | `"2025-09-01"` |
| `currentWeek` | Number | ✅ | 当前周次 | `5` |
| `semesterName` | String | ❌ | 学期名称 | `"2025秋季学期"` |
| `totalWeeks` | Number | ✅ | 学期总周数 | `18` |
| `updateTime` | Date | 自动 | 更新时间 | `Date` |

**集合权限**: `仅创建者可读写`

**索引配置**:

| 索引字段 | 索引类型 | 说明 |
|----------|----------|------|
| `_openid` | 唯一索引 | 默认已创建，确保每个用户只有一条设置记录 |

**创建方式**: 在微信开发者工具 → 云开发 → 数据库 → 点击「+」创建集合，名称填 `settings`，权限选择「仅创建者可读写」。

---

## 三、云函数设计

### 3.1 云函数列表

#### 云函数 1: `login`

**用途**: 用户微信授权登录，获取 OpenID

| 项目 | 内容 |
|------|------|
| 函数名 | `login` |
| 触发方式 | 前端调用 `wx.cloud.callFunction` |
| 输入参数 | 无 |
| 返回结果 | `{ openid: "oxxxxxx" }` |

```javascript
// index.js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  return { openid: wxContext.OPENID };
};
```

**创建方式**:
1. 在 `cloudfunctions/` 目录下右键 → 新建 Node.js 云函数
2. 函数名填 `login`
3. 在微信开发者工具中右键该云函数目录 → 选择「上传并部署：云端安装依赖」

---

#### 云函数 2: `courseCRUD`

**用途**: 课程的增删改查统一入口

| 项目 | 内容 |
|------|------|
| 函数名 | `courseCRUD` |
| 触发方式 | 前端调用 `wx.cloud.callFunction` |
| 输入参数 | `{ action: "create" | "update" | "delete" | "list", data: {...} }` |
| 返回结果 | `{ success: true, data: [...] }` 或 `{ success: false, error: "..." }` |

```javascript
// index.js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action, data } = event;
  
  try {
    switch (action) {
      // 创建课程
      case 'create': {
        const result = await db.collection('courses').add({
          data: {
            ...data,
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        });
        return { success: true, _id: result._id };
      }
      
      // 更新课程
      case 'update': {
        const { _id, ...updateData } = data;
        await db.collection('courses').doc(_id).update({
          data: { ...updateData, updateTime: db.serverDate() }
        });
        return { success: true };
      }
      
      // 删除课程
      case 'delete': {
        await db.collection('courses').doc(data._id).remove();
        return { success: true };
      }
      
      // 查询课程列表
      case 'list': {
        const { dayOfWeek } = data || {};
        let query = db.collection('courses');
        if (dayOfWeek !== undefined) {
          query = query.where({ dayOfWeek });
        }
        const result = await query.orderBy('startSection', 'asc').get();
        return { success: true, data: result.data };
      }
      
      default:
        return { success: false, error: '未知操作' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};
```

**创建方式**:
1. 在 `cloudfunctions/` 目录下右键 → 新建 Node.js 云函数
2. 函数名填 `courseCRUD`
3. 在微信开发者工具中右键该云函数目录 → 选择「上传并部署：云端安装依赖」

---

#### 云函数 3: `settingsCRUD`

**用途**: 用户学期设置的读写

| 项目 | 内容 |
|------|------|
| 函数名 | `settingsCRUD` |
| 触发方式 | 前端调用 `wx.cloud.callFunction` |
| 输入参数 | `{ action: "get" | "set", data: {...} }` |
| 返回结果 | `{ success: true, data: {...} }` 或 `{ success: false, error: "..." }` |

```javascript
// index.js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action, data } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  try {
    if (action === 'get') {
      const result = await db.collection('settings')
        .where({ _openid: openid })
        .get();
      return { 
        success: true, 
        data: result.data.length > 0 ? result.data[0] : null 
      };
    }
    
    if (action === 'set') {
      const existResult = await db.collection('settings')
        .where({ _openid: openid })
        .get();
      
      if (existResult.data.length > 0) {
        await db.collection('settings').doc(existResult.data[0]._id).update({
          data: { ...data, updateTime: db.serverDate() }
        });
      } else {
        await db.collection('settings').add({
          data: { ...data, updateTime: db.serverDate() }
        });
      }
      return { success: true };
    }
    
    return { success: false, error: '未知操作' };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
```

**创建方式**:
1. 在 `cloudfunctions/` 目录下右键 → 新建 Node.js 云函数
2. 函数名填 `settingsCRUD`
3. 在微信开发者工具中右键该云函数目录 → 选择「上传并部署：云端安装依赖」

---

## 四、页面结构设计

### 4.1 页面列表

根据 `app.json` 的 `pages` 数组顺序，页面路由如下：

| 序号 | 页面路径 | 页面说明 | TabBar 图标 |
|------|----------|----------|-------------|
| 1 | `pages/index/index` | **课程表首页**（日历视图 + 本周课程概览） | 是 - 首页图标 |
| 2 | `pages/courseList/courseList` | **课程列表页**（按周切换的课程清单） | 是 - 课程图标 |
| 3 | `pages/courseForm/courseForm` | **添加/编辑课程页**（表单页面） | 否 |
| 4 | `pages/courseDetail/courseDetail` | **课程详情页**（单门课程详情） | 否 |
| 5 | `pages/profile/profile` | **个人中心/设置页** | 是 - 设置图标 |

### 4.2 TabBar 配置

```json
{
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#4CAF50",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "课表",
        "iconPath": "images/icons/schedule.png",
        "selectedIconPath": "images/icons/schedule-active.png"
      },
      {
        "pagePath": "pages/courseList/courseList",
        "text": "课程",
        "iconPath": "images/icons/course.png",
        "selectedIconPath": "images/icons/course-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "images/icons/profile.png",
        "selectedIconPath": "images/icons/profile-active.png"
      }
    ]
  }
}
```

---

## 五、页面详细设计

### 5.1 首页 — `pages/index/index`（课表日历视图）

**功能**:
- 显示当前周次（如「第 5 周」）
- 以周历网格展示本周课程
- 支持左右滑动切换周次
- 点击课程格子跳转到课程详情页
- 右上角「+」按钮跳转到添加课程页

**页面结构**:
```
─────────────────────────┐
│  课表                  [+]│  ← 导航栏
├─────────────────────────┤
│   ←  第5周  →            │  ← 周次切换
├──┬──┬──┬──┬──┬──┬──┬───┤
│  │  │  │  │  │  │  │   │
│周│周│周│周│周│周│周│   │  ← 星期头
│一│二│三│四│五│六│日│   │
├──┼──┼──┼──┼──┼──┼──┼───┤
│高│  │  │体│  │  │  │ 0 │
│数│  │  │育│  │  │  │ 8 │
│  │  │  │课│  │  │  │ : │
│A │  │  │  │  │  │  │ 0 │
│3 │  │  │  │  │  │  │ 0 │
│0 │  │  │  │  │  │  │ - │
│1 │  │  │  │  │  │  │ 0 │
│  │  │  │  │  │  │  │ 8 │
│  │  │  │  │  │  │  │ : │
│  │  │  │  │  │  │  │ 4 │
│  │  │  │  │  │  │  │ 5 │
├──┼──┼──┼──┼──┼──┼──┼───┤
│... 更多时间段行 ...    │
└─────────────────────────┘
```

**数据流**:
1. 页面 `onLoad` → 调用 `settingsCRUD` 获取当前周次
2. 调用 `courseCRUD` 查询本周所有课程
3. 按 `dayOfWeek` + `startSection` 分组渲染到网格
4. 用户切换周次时，更新周次参数重新查询

---

### 5.2 课程列表页 — `pages/courseList/courseList`

**功能**:
- 列表形式展示所有课程
- 支持按周切换显示/隐藏不在当前周的课程
- 点击课程项进入课程详情页
- 下拉刷新

**页面结构**:
```
┌─────────────────────────┐
│  课程列表        [刷新] │
├─────────────────────────┤
│ ←  第5周  →              │  ← 周切换器
├─────────────────────────
│ ┌─────────────────────┐ │
│ │ 📚 高等数学          │ │  ← 课程卡片
│ │ 👤 张老师            │ │
│ │  教学楼A301        │ │
│ │ ⏰ 周一 1-2节 08:00  │ │
│ │ 📅 第1-16周          │ │
│ │         [编辑][删除]  │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📚 大学英语          │ │
│ │ ...                  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

### 5.3 添加/编辑课程页 — `pages/courseForm/courseForm`

**功能**:
- 表单填写课程信息
- 新建模式/编辑模式复用同一页面
- 表单校验（必填字段检查）
- 提交时调用云函数写入数据库

**表单字段**:
| 字段 | 组件类型 | 说明 |
|------|----------|------|
| 课程名称 | input | 必填 |
| 授课教师 | input | 必填 |
| 教室 | input | 必填 |
| 星期几 | picker (range) | 周一~周日，必填 |
| 开始节次 | picker (range) | 1~12节，必填 |
| 结束节次 | picker (range) | 必填，需 ≥ 开始节次 |
| 开始周次 | input (number) | 必填 |
| 结束周次 | input (number) | 必填，需 ≥ 开始周次 |
| 备注 | textarea | 可选 |

**页面结构**:
```
┌─────────────────────────┐
│  添加课程          [保存]│
─────────────────────────┤
│ 课程名称: [___________] │
│ 授课教师: [___________] │
│ 教  室: [___________]   │
│ 星  期: [周一 ▼]         │
│ 开始节次:[1节 ▼]         │
│ 结束节次:[2节 ▼]         │
│ 开始周次:[  1  ]         │
│ 结束周次:[ 16  ]         │
│ 备  注: [___________]   │
│         [___________]   │
└─────────────────────────┘
```

---

### 5.4 课程详情页 — `pages/courseDetail/courseDetail`

**功能**:
- 展示单门课程的完整信息
- 提供「编辑」和「删除」操作
- 编辑跳转到表单页（编辑模式）
- 删除二次确认后删除

**页面结构**:
```
┌─────────────────────────┐
│  课程详情               │
├─────────────────────────
│                         │
│     📚 高等数学          │
│                         │
│ ─────────────────────┐ │
│ │ 👤 教师: 张老师      │ │
│ │ 📍 教室: 教学楼A301  │ │
│ │ ⏰ 时间: 周一 1-2节  │ │
│ │    08:00-09:35       │ │
│ │ 📅 周次: 第1-16周    │ │
│ │ 📝 备注: 期中考试    │ │
│ └─────────────────────┘ │
│                         │
│  [编辑课程]  [删除课程]   │
│                         │
└─────────────────────────┘
```

---

### 5.5 个人中心页 — `pages/profile/profile`

**功能**:
- 显示用户头像、昵称
- 学期设置（开学日期、学期名称、总周数）
- 退出登录（清除本地缓存）

**页面结构**:
```
┌─────────────────────────┐
│  我的                   │
─────────────────────────┤
│      [头像]             │
│      微信用户            │
│                         │
│ ─────────────────────── │
│                         │
│ 学期设置                 │
│ ─────────────────────┐ │
│ │ 学期名称: [2025秋季] │ │
│ │ 开学日期: [2025-09- │ │
│ │             01]     │ │
│ │ 总周数:   [18]       │ │
│ │      [保存设置]       │ │
│ └─────────────────────┘ │
│                         │
│ 关于                    │
│ 版本: v1.0.0            │
│                         │
└─────────────────────────┘
```

---

## 六、app.json 完整配置

```json
{
  "pages": [
    "pages/index/index",
    "pages/courseList/courseList",
    "pages/courseForm/courseForm",
    "pages/courseDetail/courseDetail",
    "pages/profile/profile"
  ],
  "window": {
    "backgroundColor": "#F6F6F6",
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#4CAF50",
    "navigationBarTitleText": "课程表",
    "navigationBarTextStyle": "white"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#4CAF50",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "课表",
        "iconPath": "images/icons/schedule.png",
        "selectedIconPath": "images/icons/schedule-active.png"
      },
      {
        "pagePath": "pages/courseList/courseList",
        "text": "课程",
        "iconPath": "images/icons/course.png",
        "selectedIconPath": "images/icons/course-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "images/icons/profile.png",
        "selectedIconPath": "images/icons/profile-active.png"
      }
    ]
  },
  "sitemapLocation": "sitemap.json",
  "style": "v2",
  "lazyCodeLoading": "requiredComponents"
}
```

---

## 七、app.js 配置（已正确配置）

当前 `app.js` 中的云环境 ID 已正确配置为 `cloud1-d4g49nkkyd53a1417`，无需修改。

```javascript
// app.js
App({
  onLaunch: function () {
    this.globalData = {
      env: "cloud1-d4g49nkkyd53a1417",
      openid: "",        // 登录后存储
      currentWeek: 1,    // 当前周次
      settings: null     // 学期设置
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
  },
});
```

---

## 八、项目文件结构

```
miniprogram-1/
├── miniprogram/
│   ├── app.js                        # 小程序入口（云初始化）
│   ├── app.json                      # 全局配置（页面路由、TabBar、窗口样式）
│   ├── app.wxss                      # 全局样式
│   ├── sitemap.json
│   ├── pages/
│   │   ├── index/                    # 首页（课表日历视图）
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   ── index.wxss
│   │   ├── courseList/               # 课程列表页
│   │   │   ├── courseList.js
│   │   │   ├── courseList.json
│   │   │   ├── courseList.wxml
│   │   │   └── courseList.wxss
│   │   ├── courseForm/               # 添加/编辑课程页
│   │   │   ├── courseForm.js
│   │   │   ├── courseForm.json
│   │   │   ├── courseForm.wxml
│   │   │   └── courseForm.wxss
│   │   ├── courseDetail/             # 课程详情页
│   │   │   ├── courseDetail.js
│   │   │   ├── courseDetail.json
│   │   │   ├── courseDetail.wxml
│   │   │   └── courseDetail.wxss
│   │   └── profile/                  # 个人中心页
│   │       ├── profile.js
│   │       ├── profile.json
│   │       ├── profile.wxml
│   │       └── profile.wxss
│   └── images/
│       └── icons/
│           ├── schedule.png / schedule-active.png
│           ├── course.png / course-active.png
│           └── profile.png / profile-active.png
├── cloudfunctions/
│   ├── login/                        # 登录云函数
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json
│   ├── courseCRUD/                   # 课程增删改查云函数
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json
│   └── settingsCRUD/                 # 设置读写云函数
│       ├── index.js
│       ├── package.json
│       └── config.json
└── project.config.json               # 项目配置
```

---

## 九、执行清单

按照以下顺序执行：

### 阶段一：准备工作
- [ ] 1. 在微信开发者工具中打开云开发控制台
- [ ] 2. 确认云环境 `cloud1-d4g49nkkyd53a1417` 已开通且正常
- [ ] 3. 创建数据库集合 `courses`（权限：仅创建者可读写）
- [ ] 4. 创建数据库集合 `settings`（权限：仅创建者可读写）

### 阶段二：云函数部署
- [ ] 5. 在 `cloudfunctions/` 下创建 `login` 云函数并上传部署
- [ ] 6. 在 `cloudfunctions/` 下创建 `courseCRUD` 云函数并上传部署
- [ ] 7. 在 `cloudfunctions/` 下创建 `settingsCRUD` 云函数并上传部署

### 阶段三：页面开发
- [ ] 8. 修改 `app.json`（页面路由 + TabBar 配置）
- [ ] 9. 修改 `app.js`（补充 globalData 字段）
- [ ] 10. 开发首页 `pages/index/index`（课表日历视图）
- [ ] 11. 开发课程列表页 `pages/courseList/courseList`
- [ ] 12. 开发添加/编辑课程页 `pages/courseForm/courseForm`
- [ ] 13. 开发课程详情页 `pages/courseDetail/courseDetail`
- [ ] 14. 开发个人中心页 `pages/profile/profile`
- [ ] 15. 准备 TabBar 图标资源

### 阶段四：测试
- [ ] 16. 测试登录流程
- [ ] 17. 测试课程 CRUD 全流程
- [ ] 18. 测试周次切换
- [ ] 19. 测试跨设备数据同步

---

## 十、技术要点总结

| 技术点 | 实现方式 |
|--------|----------|
| 云环境 ID | `cloud1-d4g49nkkyd53a1417`（已在 app.js 配置） |
| 数据库集合 | `courses`（课程数据）+ `settings`（学期设置） |
| 数据权限 | 仅创建者可读写（通过 `_openid` 自动隔离） |
| 云函数 | `login`（登录）+ `courseCRUD`（课程操作）+ `settingsCRUD`（设置操作） |
| 页面数 | 5 个页面（首页 + 列表 + 表单 + 详情 + 个人中心） |
| TabBar | 3 个 Tab（课表 / 课程 / 我的） |
| 小程序 AppID | `wx0bef6a0716fa29a2` |
