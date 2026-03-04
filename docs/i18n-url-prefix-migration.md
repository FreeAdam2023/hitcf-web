# HiTCF i18n URL 前缀路由迁移计划

> 创建日期: 2026-03-04
> 状态: 待执行

## 背景

当前 HiTCF 使用 cookie-based i18n（`NEXT_LOCALE` cookie），所有页面共享同一 URL（`/tests`）。
SEO 要求每种语言有独立 URL（`/zh/tests`、`/en/tests`、`/ar/tests`、`/fr/tests`），让搜索引擎为不同语言市场分别索引。

**技术栈**: Next.js 14 App Router + next-intl v4.8.3
**策略**: `localePrefix: "always"` — 所有语言（包括默认 zh）都带前缀，SEO 最清晰

---

## Phase 1: 基础文件（不破坏现有功能）

### Step 1.1: 创建路由配置

**新建** `src/i18n/routing.ts`

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en", "fr", "ar"],
  defaultLocale: "zh",
  localePrefix: "always",
  localeCookie: { name: "NEXT_LOCALE" },
  localeDetection: true,
});
```

### Step 1.2: 创建导航工具

**新建** `src/i18n/navigation.ts`

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, useRouter, usePathname, redirect, getPathname } =
  createNavigation(routing);
```

### Step 1.3: 更新 request.ts

**修改** `src/i18n/request.ts` — 从 cookie 读取改为 `requestLocale` 参数

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    timeZone: "America/Toronto",
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

---

## Phase 2: 目录重构（大迁移）

### Step 2.1: 创建 `src/app/[locale]/layout.tsx`

- 从现有 `src/app/layout.tsx` 移入全部内容
- 接收 `params.locale`，设置 `<html lang dir>`
- hreflang 指向 `/zh`、`/en`、`/fr`、`/ar`
- 调用 `setRequestLocale(locale)` + `generateStaticParams()`
- 字体路径改为 `../fonts/`，CSS 改为 `../globals.css`

```ts
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as any)) notFound();
  setRequestLocale(locale);

  const htmlLang = locale === "en" ? "en" : locale === "fr" ? "fr" : locale === "ar" ? "ar" : "zh-CN";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={htmlLang} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="alternate" hrefLang="zh" href="https://www.hitcf.com/zh" />
        <link rel="alternate" hrefLang="en" href="https://www.hitcf.com/en" />
        <link rel="alternate" hrefLang="fr" href="https://www.hitcf.com/fr" />
        <link rel="alternate" hrefLang="ar" href="https://www.hitcf.com/ar" />
        <link rel="alternate" hrefLang="x-default" href="https://www.hitcf.com/zh" />
      </head>
      <body>
        {/* Providers + children 保持不变 */}
        {children}
      </body>
    </html>
  );
}
```

### Step 2.2: 根 layout 精简

**修改** `src/app/layout.tsx` → 仅 pass-through children（不含 `<html>/<body>`）

```ts
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### Step 2.3: 移动路由目录

```
src/app/(main)/          → src/app/[locale]/(main)/
src/app/(auth)/           → src/app/[locale]/(auth)/
src/app/disclaimer/       → src/app/[locale]/disclaimer/
src/app/privacy-policy/   → src/app/[locale]/privacy-policy/
src/app/refund-policy/    → src/app/[locale]/refund-policy/
src/app/terms-of-service/ → src/app/[locale]/terms-of-service/
src/app/resources/        → src/app/[locale]/resources/
src/app/page.tsx          → src/app/[locale]/page.tsx
src/app/landing-page.tsx  → src/app/[locale]/landing-page.tsx
src/app/not-found.tsx     → src/app/[locale]/not-found.tsx
src/app/opengraph-image.tsx → src/app/[locale]/opengraph-image.tsx
```

**不移动**（保留在 `src/app/`）：
- `api/` — API 路由不需要 locale 前缀
- `fonts/`、`globals.css`
- `robots.ts`、`sitemap.ts`

---

## Phase 3: Middleware 重写

**修改** `src/middleware.ts`

```ts
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = [
  "/dashboard", "/wrong-answers", "/history", "/speed-drill",
  "/practice/", "/exam/", "/results/",
];

export function middleware(request: NextRequest) {
  // 1. www → non-www
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.replace("www.", "");
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // 2. i18n 路由
  const response = intlMiddleware(request);

  // 3. Auth 保护（开发环境跳过）
  if (process.env.NODE_ENV !== "development") {
    const pathname = request.nextUrl.pathname;
    const localeMatch = pathname.match(/^\/(zh|en|fr|ar)(\/.*)?$/);
    const pathWithoutLocale = localeMatch ? (localeMatch[2] || "/") : pathname;

    if (PROTECTED_PREFIXES.some((p) => pathWithoutLocale.startsWith(p))) {
      const sessionToken =
        request.cookies.get("__Secure-next-auth.session-token") ??
        request.cookies.get("next-auth.session-token");
      if (!sessionToken?.value) {
        const url = request.nextUrl.clone();
        const locale = localeMatch?.[1] || routing.defaultLocale;
        url.pathname = `/${locale}/login`;
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // 排除 /api、静态文件、Next.js 内部路由
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
```

---

## Phase 4: 批量更新导航 imports（~40 文件）

### Step 4.1: Link 替换（36 文件）

```diff
- import Link from "next/link";
+ import { Link } from "@/i18n/navigation";
```

Link 自动加 locale 前缀，`href="/tests"` 不用改。

### Step 4.2: useRouter/usePathname 替换（38 文件）

```diff
- import { useRouter, usePathname } from "next/navigation";
+ import { useRouter, usePathname } from "@/i18n/navigation";
```

- `usePathname()` 返回不含 locale 的路径（`/tests`），现有逻辑不用改
- `useRouter().push("/tests")` 自动加 locale 前缀
- **注意**: `useSearchParams` 保留从 `next/navigation` 导入（next-intl 不提供）

### 需要修改 imports 的文件

**布局组件**:
- `components/layout/navbar.tsx`
- `components/layout/footer.tsx`
- `components/layout/user-menu.tsx`
- `components/layout/main-container.tsx`
- `components/layout/conditional-footer.tsx`
- `components/layout/community-fab.tsx`

**共享组件**:
- `components/shared/continue-banner.tsx`
- `components/shared/recommended-banner.tsx`
- `components/shared/breadcrumb.tsx`
- `components/shared/upgrade-banner.tsx`

**页面组件**:
- `app/[locale]/(main)/tests/test-card.tsx`、`test-list.tsx`
- `app/[locale]/(main)/results/[attemptId]/results-view.tsx`
- `app/[locale]/(main)/dashboard/dashboard-view.tsx`
- `app/[locale]/(main)/pricing/pricing-view.tsx`
- `app/[locale]/(main)/account/account-view.tsx`
- `app/[locale]/(main)/vocabulary/**/*.tsx`
- `app/[locale]/(main)/speaking-*/**/*.tsx`
- `app/[locale]/(main)/writing-*/**/*.tsx`
- `app/[locale]/(main)/wrong-answers/*.tsx`
- `app/[locale]/(main)/history/*.tsx`
- `app/[locale]/(main)/speed-drill/*.tsx`
- `app/[locale]/(main)/payment/**/*.tsx`
- `app/[locale]/(auth)/login/page.tsx`
- `app/[locale]/(auth)/register/page.tsx`
- `app/[locale]/(auth)/forgot-password/page.tsx`
- `app/[locale]/landing-page.tsx`
- `app/[locale]/resources/resources-content.tsx`
- `app/[locale]/not-found.tsx`
- 等约 40 个文件

---

## Phase 5: Locale 切换 + Provider 更新

### Step 5.1: locale-toggle.tsx

从 cookie+reload 改为 `router.replace(pathname, { locale: target })`

```ts
import { useRouter, usePathname } from "@/i18n/navigation";

const handleSelect = async (target: Locale) => {
  if (target === locale) return;
  router.replace(pathname, { locale: target });
  // 登录用户同时更新后端
  if (isAuthenticated) {
    await updateProfile({ ui_language: target });
  }
};
```

### Step 5.2: locale-provider.tsx

- 去掉 cookie 写入逻辑和 `document.documentElement.lang` 设置
- locale 从 URL segment 读取（`useLocale()`）
- 保留 Arabic 懒加载
- 登录用户 ui_language 不匹配时自动导航到正确 locale URL

---

## Phase 6: SEO 更新

### Step 6.1: sitemap.ts — 每个页面生成 4 个 locale 变体

```ts
const LOCALES = ["zh", "en", "fr", "ar"];

function localizedEntry(path: string, opts) {
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
      ),
    },
    ...opts,
  }));
}
```

### Step 6.2: robots.ts

```ts
disallow: ["/api/", "/*/practice/", "/*/exam/", "/*/results/"],
```

### Step 6.3: generateMetadata

所有 page 的 metadata 添加：
```ts
alternates: {
  canonical: `/${locale}/tests`,
  languages: { zh: "/zh/tests", en: "/en/tests", fr: "/fr/tests", ar: "/ar/tests" },
},
```

---

## Phase 7: 边缘情况

1. **callbackUrl**: login 页的 callbackUrl 已含 locale 前缀，用 `next/navigation` 的 router 跳转避免双重前缀
2. **NextAuth pages.signIn = "/login"**: middleware 会自动重定向到 `/{locale}/login`
3. **signOut callbackUrl**: 用 `/login`，middleware 会处理重定向
4. **根级 not-found.tsx**: 需要一个 fallback 处理无效 locale slug

---

## 验证清单

- [ ] `npx tsc --noEmit` — 类型检查通过
- [ ] `npx next lint` — lint 通过
- [ ] `npm test` — 测试通过
- [ ] `npm run build` — 构建成功（4 locale × N 页面静态生成）
- [ ] 访问 `/` → 重定向到 `/zh/`
- [ ] 访问 `/tests` → 重定向到 `/zh/tests`
- [ ] 访问 `/en/tests` → 英文页面
- [ ] 访问 `/ar/tests` → RTL 阿拉伯语页面
- [ ] 切换语言 → URL 变化（`/zh/tests` → `/en/tests`）
- [ ] 登录流程正常
- [ ] API `/api/test-sets` 不受影响
- [ ] 受保护路由未登录跳转 `/{locale}/login`
- [ ] View Source 检查 hreflang 标签正确
- [ ] sitemap.xml 包含所有 locale 变体

---

## 执行顺序

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → 验证

预计工作量: ~2-3 小时（主要是 Phase 2 目录迁移 + Phase 4 批量替换 imports）
