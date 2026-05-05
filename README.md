# Love to Love

相亲 Web 平台 MVP，基于 Next.js、TypeScript、Prisma 和 PostgreSQL。

## 功能

- 手机号短信验证码登录，开发环境支持 console provider，生产环境预留 HTTP 短信供应商配置。
- 用户资料填写、草稿保存、提交审核，以及管理员资料审核。
- 相册照片独立审核：新照片默认待审核，通过后才会在推荐和资料展示中出现。
- 推荐匹配：条件筛选、双向偏好校验、匹配分、推荐理由和跳过原因记录。
- 互相喜欢后创建匹配，支持文字聊天、分页加载、未读数、发送失败重试和举报表单。
- 管理后台：概览指标、资料审核、照片审核、用户搜索/禁用、举报处理和风控日志。

## 本地运行

```powershell
npm install
Copy-Item .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

访问 `http://127.0.0.1:3000`。

演示账号：

- 普通用户：`18600000002`
- 管理员：`19999999999`

开发环境默认使用 `SMS_PROVIDER=console`，点击“获取验证码”后会显示并自动填入验证码。

## 生产短信配置

需要人工补充 `.env` 中这些值：

```env
SMS_PROVIDER="generic_http"
SMS_CODE_SECRET=""
SMS_HTTP_ENDPOINT=""
SMS_HTTP_TOKEN=""
SMS_TEMPLATE_ID=""
SMS_SIGN_NAME=""
```

`SMS_HTTP_ENDPOINT` 需要接入你选择的短信服务商或自建网关。当前代码会向该地址 POST：`phone`、`code`、`templateId`、`signName`、`scene`。
