# Love to Love

相亲 Web 平台 MVP，基于 Next.js、TypeScript 和 Prisma。

## 功能

- 手机号验证码登录，开发验证码固定为 `123456`
- 用户资料填写、保存草稿、提交审核
- 管理后台资料审核、用户禁用/解禁、举报处理
- 推荐匹配：条件筛选 + 打分排序
- 互相喜欢后创建匹配并开启文字聊天

## 本地运行

```powershell
npm install
Copy-Item .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

访问 `http://127.0.0.1:3000`。

本地 PostgreSQL 连接默认使用 `DATABASE_URL`。开发环境可使用本机 PostgreSQL 17 服务，端口 `54329`，建议使用独立 schema `love_to_love`。

演示账号：

- 普通用户：`18600000002`
- 管理员：`19999999999`
- 验证码：`123456`
