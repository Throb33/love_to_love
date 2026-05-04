# 相亲 Web 平台开发文档

## 1. 项目定位

### 1.1 产品目标

开发一个面向城市白领的相亲 Web 平台，首版以“真实资料、条件匹配、互相喜欢后聊天”为核心闭环，帮助用户高效发现合适对象并建立初步沟通。

### 1.2 首版形态

- 产品形态：Web 平台
- 目标人群：城市白领
- 业务模式：平台自助匹配
- MVP 范围：资料填写、资料审核、匹配推荐、互相喜欢、站内聊天
- 收费策略：首版免费验证，预留会员能力但不实现付费
- 信任机制：手机号注册 + 后台人工审核

### 1.3 首版成功标准

- 用户能完成手机号注册、登录、资料填写和提交审核。
- 审核通过用户能进入推荐列表，浏览异性或目标匹配对象资料。
- 用户能对推荐对象执行“喜欢”或“跳过”。
- 双方互相喜欢后自动建立匹配关系，并开启 1 对 1 站内文字聊天。
- 管理员能审核用户资料、处理举报、禁用违规账号。

## 2. 用户角色与核心流程

### 2.1 用户角色

- 访客：浏览介绍页，注册或登录。
- 普通用户：填写资料、等待审核、浏览推荐、喜欢/跳过、聊天、举报。
- 管理员：审核资料、查看用户、处理举报、禁用账号。

### 2.2 用户端主流程

1. 用户使用手机号和验证码注册/登录。
2. 首次进入后填写基本资料、择偶偏好、头像和个人介绍。
3. 提交资料后进入“审核中”状态。
4. 管理员审核通过后，用户进入推荐页。
5. 系统按筛选条件和匹配分推荐候选人。
6. 用户对候选人选择“喜欢”或“跳过”。
7. 如果双方互相喜欢，系统创建匹配关系并开启聊天。
8. 用户在聊天页进行文字沟通，可举报或解除匹配。

### 2.3 管理端主流程

1. 管理员登录后台。
2. 查看待审核用户资料。
3. 审核头像、昵称、职业、个人介绍、择偶偏好等内容。
4. 选择通过、驳回并填写原因，或直接禁用明显违规账号。
5. 查看举报列表，处理聊天骚扰、虚假资料、违规图片等问题。

## 3. 功能需求

### 3.1 注册与登录

- 使用手机号 + 短信验证码登录。
- 首版可在开发环境使用固定验证码或控制台模拟短信发送。
- 登录后根据用户状态跳转：
  - 未建档：资料填写页
  - 审核中：审核等待页
  - 审核驳回：资料修改页
  - 审核通过：推荐页
  - 禁用：账号禁用提示页

### 3.2 用户资料

用户资料字段：

- 基本信息：昵称、性别、出生年份、所在城市、身高、学历、职业、年收入区间
- 婚恋信息：婚姻状态、是否有子女、计划结婚时间
- 生活方式：兴趣标签、作息偏好、是否吸烟、是否饮酒
- 展示内容：头像、个人介绍、理想对象描述
- 择偶偏好：年龄范围、城市范围、学历要求、身高范围、婚姻状态要求

资料规则：

- 昵称、头像、性别、出生年份、城市、学历、职业、个人介绍为必填。
- 个人介绍最少 20 字，最多 300 字。
- 头像首版只支持上传 1 张主图。
- 用户资料修改后，关键字段变更需要重新审核。

### 3.3 审核机制

用户状态：

- `draft`：未提交资料
- `pending_review`：待审核
- `approved`：审核通过
- `rejected`：审核驳回
- `banned`：账号禁用

审核要求：

- 只有 `approved` 用户可被推荐、查看推荐、喜欢别人和聊天。
- 审核驳回需要保存驳回原因。
- 后台保留审核记录，包括审核人、审核时间、审核结果和备注。

### 3.4 匹配推荐

首版使用“条件筛选 + 打分排序”。

硬性筛选：

- 排除自己。
- 排除未审核通过、禁用或已跳过的用户。
- 排除已匹配或已喜欢但未产生新状态变化的用户。
- 默认按用户性别和择偶性别匹配。
- 满足双方基础择偶偏好，例如年龄、城市、学历、身高范围。

匹配打分：

- 同城：+25
- 年龄处于偏好中位区间：+15
- 学历满足或高于偏好：+15
- 兴趣标签重合：每个 +5，最多 +20
- 近期活跃：+10
- 资料完整度高：+10
- 被举报或资料风险标记：降低排序

推荐展示：

- 卡片展示头像、昵称、年龄、城市、学历、职业、兴趣标签、个人介绍摘要。
- 用户可点击查看完整资料。
- 操作按钮：喜欢、跳过、举报。

### 3.5 喜欢与匹配

- 用户对候选人点击“喜欢”后记录一条喜欢关系。
- 如果对方此前也喜欢了当前用户，则创建匹配关系。
- 匹配成功后双方可在“匹配”列表看到对方。
- 匹配成功后自动开启聊天会话。
- 用户可解除匹配；解除后聊天不可继续发送消息。

### 3.6 聊天

聊天规则：

- 只有互相喜欢并处于有效匹配关系的双方可以聊天。
- 首版只支持文字消息。
- 消息按时间正序展示。
- 支持已读状态可选；MVP 可先实现未读数，不强制做逐条已读。
- 支持举报聊天对象。

消息限制：

- 单条消息最多 500 字。
- 禁止发送空消息。
- 后端校验发送者是否属于该匹配会话。

### 3.7 举报与风控

举报类型：

- 虚假资料
- 骚扰辱骂
- 广告营销
- 诈骗风险
- 其他

处理动作：

- 管理员可标记已处理、警告用户、禁用用户。
- 被多次举报的用户在推荐排序中降权。
- 禁用用户无法登录核心功能，且不再出现在推荐中。

### 3.8 管理后台

后台模块：

- 数据概览：注册用户数、待审核数、通过率、匹配数、举报数
- 用户管理：搜索、查看资料、状态筛选、禁用/解禁
- 资料审核：待审核列表、审核详情、通过/驳回
- 举报处理：举报列表、聊天上下文查看、处理结果记录

后台权限：

- 首版只做单一管理员角色。
- 管理端路由必须校验管理员身份。

## 4. 技术方案

### 4.1 推荐技术栈

- 前端/全栈框架：Next.js
- 语言：TypeScript
- UI：React + CSS Modules 或 Tailwind CSS
- 数据库：PostgreSQL
- ORM：Prisma
- 鉴权：手机号验证码登录 + 服务端 Session 或 JWT Cookie
- 文件存储：本地开发使用本地目录，生产使用对象存储
- 实时聊天：MVP 可先用轮询，后续升级 WebSocket

### 4.2 页面结构

用户端页面：

- `/`：产品入口和登录入口
- `/login`：手机号登录
- `/profile/setup`：资料填写
- `/profile/reviewing`：审核等待
- `/profile/rejected`：审核驳回修改
- `/matches/recommendations`：推荐列表
- `/matches`：已匹配列表
- `/chat/[matchId]`：聊天页
- `/me`：我的资料

管理端页面：

- `/admin/login`：管理员登录
- `/admin`：后台概览
- `/admin/reviews`：资料审核
- `/admin/users`：用户管理
- `/admin/reports`：举报处理

### 4.3 核心数据表

`users`

- id
- phone
- role: `user | admin`
- status: `draft | pending_review | approved | rejected | banned`
- created_at
- updated_at
- last_active_at

`profiles`

- user_id
- nickname
- gender
- birth_year
- city
- height_cm
- education
- occupation
- income_range
- marital_status
- has_children
- marriage_timeline
- bio
- ideal_partner
- avatar_url
- interests
- lifestyle fields

`partner_preferences`

- user_id
- min_age
- max_age
- preferred_cities
- min_height_cm
- max_height_cm
- education_requirement
- marital_statuses

`review_records`

- id
- user_id
- reviewer_id
- result: `approved | rejected`
- reason
- created_at

`likes`

- id
- from_user_id
- to_user_id
- created_at

`skips`

- id
- from_user_id
- to_user_id
- created_at

`matches`

- id
- user_a_id
- user_b_id
- status: `active | closed`
- created_at
- closed_at

`messages`

- id
- match_id
- sender_id
- content
- created_at
- read_at

`reports`

- id
- reporter_id
- reported_user_id
- match_id
- type
- description
- status: `open | resolved`
- admin_note
- created_at
- resolved_at

### 4.4 API 设计

认证：

- `POST /api/auth/send-code`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

资料：

- `GET /api/profile/me`
- `PUT /api/profile/me`
- `POST /api/profile/submit-review`

推荐与匹配：

- `GET /api/recommendations`
- `POST /api/recommendations/:userId/like`
- `POST /api/recommendations/:userId/skip`
- `GET /api/matches`
- `POST /api/matches/:matchId/close`

聊天：

- `GET /api/matches/:matchId/messages`
- `POST /api/matches/:matchId/messages`

举报：

- `POST /api/reports`

后台：

- `GET /api/admin/overview`
- `GET /api/admin/reviews`
- `POST /api/admin/reviews/:userId/approve`
- `POST /api/admin/reviews/:userId/reject`
- `GET /api/admin/users`
- `POST /api/admin/users/:userId/ban`
- `POST /api/admin/users/:userId/unban`
- `GET /api/admin/reports`
- `POST /api/admin/reports/:reportId/resolve`

## 5. 非功能需求

### 5.1 隐私与安全

- 手机号不得在普通用户端公开展示。
- 聊天和资料接口必须校验当前登录用户权限。
- 管理端接口必须校验管理员角色。
- 头像上传限制文件类型和大小。
- 用户删除或禁用后不得继续出现在推荐结果中。

### 5.2 性能要求

- 推荐列表接口默认分页，每页 20 条。
- 聊天消息分页加载，每页 30 条。
- 推荐算法首版可同步计算，后续用户量增长后改为离线预计算。

### 5.3 可运营性

- 后台可以快速看到待审核和举报数量。
- 所有审核、禁用和举报处理动作要保留记录。
- 推荐排序需要保留可调整权重，方便运营后续优化。

## 6. 开发里程碑

### 阶段 1：项目基础

- 搭建 Next.js + TypeScript 项目。
- 接入 PostgreSQL + Prisma。
- 建立用户、资料、偏好、审核、喜欢、匹配、消息、举报数据模型。
- 完成基础布局、登录态和路由保护。

### 阶段 2：用户资料与审核

- 实现手机号登录。
- 实现资料填写、保存草稿、提交审核。
- 实现审核状态页。
- 实现管理端资料审核。

### 阶段 3：推荐与匹配

- 实现推荐筛选和打分排序。
- 实现喜欢、跳过、互相喜欢生成匹配。
- 实现匹配列表。

### 阶段 4：聊天与举报

- 实现匹配后文字聊天。
- 实现未读数。
- 实现举报入口和后台举报处理。

### 阶段 5：验收与优化

- 补齐端到端核心流程测试。
- 优化移动端 Web 适配。
- 完成基础风控、空状态、错误提示和加载状态。

## 7. 测试计划

### 7.1 核心场景

- 新用户手机号登录后进入资料填写页。
- 用户提交资料后进入审核中状态。
- 审核通过后可看到推荐列表。
- 审核未通过或禁用用户不能进入推荐和聊天。
- A 喜欢 B、B 喜欢 A 后自动创建匹配。
- 非匹配用户不能发送聊天消息。
- 用户举报后，管理员能在后台看到并处理。

### 7.2 权限测试

- 普通用户不能访问管理端接口。
- 用户不能查看或发送不属于自己的 match 消息。
- 禁用用户不能被推荐，也不能继续发送消息。

### 7.3 数据测试

- 推荐结果不会包含自己。
- 推荐结果不会包含已跳过用户。
- 推荐结果只包含审核通过用户。
- 双向喜欢只创建一条有效匹配关系。

## 8. 暂不实现内容

- 原生 iOS/Android App
- 微信小程序
- 实名认证
- 会员订阅和支付
- 音视频聊天
- 多图相册
- AI 红娘
- 复杂心理问卷匹配
- 线下活动报名

## 9. 默认假设

- 首版只支持中国大陆手机号。
- 首版只做异性匹配；后续如需支持多元性别和取向，需要扩展资料与推荐规则。
- 首版聊天使用轮询实现，降低实时系统复杂度。
- 首版后台只有一个管理员角色，不做细粒度 RBAC。
- 首版免费，数据库和接口为后续会员能力预留扩展空间。
