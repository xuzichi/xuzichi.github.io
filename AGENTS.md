# xuzichi.github.io — 项目说明（AI 助手工作指南）

个人 GitHub Pages 静态站点（<https://xuzichi.github.io/>），用纯 HTML/CSS/JS 托管了几个彼此独立的玩具项目。**无构建工具、无包管理器、无框架**（仅用 CDN 引入 Tailwind / FontAwesome / jQuery）。修改后直接 push 到 `main` 分支即自动部署，无需其他发布步骤。

## 目录结构与模块

```
index.html                      # 导航首页（跳转各项目入口）
blackmyth_wukong.html           # ① 黑神话悟空展票务监控页面
blackmyth_wukong.json           # ① Apifox API 集合导出（接口定义，仅供查阅）
BLACKMYTH_WUKONG.md             # ① 抢票平台设计文档（含 V1 监控系统实现说明）
mygo_avemujica2025.html         # ② 鸡狗对邦场贩数据展示页（~380KB，数据内嵌）
JR/
  orangeSpeedCheck_v3.js        # ③ 赛博新干线测速 Tampermonkey 脚本
  CyberShinKansen.js            # ③ 赛博新干线表单自动填写脚本
oshi-tabi/                      # ④ 「推し旅」Bang Dream 10周年×JR东海活动页镜像
  bang-dream-10th/poppin_party/ # ④ 页面主体：index.html、certificate/、certificate_used/
  jsConfig/config.js            # ④ voistock API 配置（API_KEY / API_SECRET / API_SERVER）
  jsConfig/commonFunction.js    # ④ cookie 与通用工具函数
  css/ js/ jquery/ w3css/ vendor/ font/ icon/ img/ logo/ photo/ svg/ ui/ gtag/ ajax/  # ④ 静态资源
  view/event/bang-dream-10th/   # ④ 活动样式与图片（mygo/、poppin_party/ 两个乐队主题）
```

## 各模块要点

### ① 黑神话悟空展票务监控（blackmyth_wukong.html）
- 纯前端轮询监控 zhongzhiyou.cn 票务接口（无需鉴权），Tailwind CDN 样式。
- 数据流：`/product/month/priceList?month=&scenicProductId=` 拿到可售日期 → 遍历 enabled 日期 id → `/product/getSessionList/{dayId}` 拿各时段库存。
- 默认每 60s 轮询，页面可调频率、勾选产品类型（10396/10397）。产品 id 范围 10396-10399（全价/半价/儿童/老人）。
- 扩展思路（详见 `BLACKMYTH_WUKONG.md`）：监听模式 + 集中抢票模式 + 持久化 + 表单输入。

### ② 鸡狗场贩数据展示（mygo_avemujica2025.html）
- 单文件数据快照页，**内嵌 JSON 数据截止于 2025/04/29 08:47:00**，更新数据时同步修改表格底部的截止时间文案。
- 数据含 Authentication 登录凭据（faker 账号），属公开占位，勿复用。

### ③ JR/ Tampermonkey 脚本（赛博新干线）
- `orangeSpeedCheck_v3.js`：测速后满足条件（时间/速度/区域/方向）时自动开启问卷，`import orangeModule from "/js/orangeModule.js"` —— **orangeModule.js 不在仓库内**（托管于外部站点），改脚本时注意别破坏其调用契约（`getRideHistoryFromOrange()` 返回 `{data:{ride_histories:[...]}}`）。
- `CyberShinKansen.js`：`@match https://oshi-tabi.voistock.com/bang-dream-10th/voice/*`，依赖 jQuery，document-start 注入。
- 测试方式：在浏览器 Tampermonkey 中直接加载本地文件验证，仓库内无测试设施。

### ④ oshi-tabi/ 活动页镜像
- 从 oshi-tabi.voistock.com 复刻的静态资源，本地可直接打开，HTML 内资源路径为**根绝对路径**（如 `/oshi-tabi/css/style.css`），部署在 GitHub Pages 根路径下可用；若要部署到子路径需全局改写。
- `jsConfig/config.js` 中 `API_KEY` / `API_SECRET` 为仓库既有内容（镜像自带），属敏感凭据：**不要新增、更换或外泄更多凭据**；改动时保持 `DEV=false`、`devmode=""` 的线上模式。
- poppin_party 下 `certificate/`（证书生成）与 `certificate_used/`（已用证书）是两个独立页面，链接回跳逻辑曾出过 bug（见提交 24342b8）。

## 约定与注意事项

- **提交信息**：沿用仓库现有风格 —— Conventional Commits 前缀（`feat:` / `fix:` / `style:` / `update:`），中英混合描述，单行简洁即可。
- **语言**：页面注释与文档用中文；oshi-tabi 页面文案保留日文原样，不要翻译。
- **时间敏感数据**：票务库存、场贩数据均为历史快照，更新时务必标注/同步截止时间。
- **敏感信息**：黑神话页面监控接口虽无需鉴权，但若后续加抢票功能需要 Authorization 头，**不要硬编码真实凭据进仓库**。
- **不要动第三方依赖**：oshi-tabi/jquery、w3css、vendor 等是从上游站点原样拉取的，除非必要否则不修改、不升级。
- 仓库曾使用 CNAME（已删除），域名相关变更需谨慎。

## 快速操作

- 本地预览：直接用浏览器打开 HTML 文件即可（oshi-tabi 用 `python -m http.server` 起本地服务效果更好）。
- 发布：`git add -A && git commit -m "update: 说明" && git push origin main`，GitHub Pages 自动部署。
