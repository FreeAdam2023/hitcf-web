import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "退款政策 · 免费试用与退款申请流程",
  description:
    "HiTCF 退款政策：7 天免费试用随时取消不扣费，首次付款 48 小时内全额退款，季付年付 14 天内按比例退款。通过 Stripe 原路返回。",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>退款政策</h1>
      <p className="text-sm text-muted-foreground">
        最后更新：2026 年 2 月 23 日
      </p>

      <p>
        感谢选择 HiTCF。本退款政策适用于通过本平台购买的所有付费订阅服务。
      </p>

      <h2>1. 免费试用</h2>
      <ul>
        <li>所有新用户可享受 <strong>7 天免费试用</strong>，试用期间不收取任何费用。</li>
        <li>试用期内随时可以取消，不会产生任何费用。</li>
        <li>试用期结束后，如未取消，将自动按所选方案收费。</li>
        <li>每个用户（每个邮箱地址）仅可享受一次免费试用。</li>
      </ul>

      <h2>2. 订阅取消</h2>
      <ul>
        <li>
          您可以随时通过 <Link href="/pricing">定价页面</Link> 的&ldquo;管理订阅&rdquo;按钮进入 Stripe 客户门户取消订阅。
        </li>
        <li>
          取消后，您的 Pro 权限将保留至当前付费周期结束，之后自动降级为免费用户。
        </li>
        <li>取消订阅<strong>不会</strong>自动产生退款。</li>
      </ul>

      <h2>3. 退款条件</h2>
      <p>以下情况可以申请退款：</p>

      <h3>3.1 全额退款</h3>
      <ul>
        <li>
          首次付款后 <strong>48 小时内</strong>，如您对服务不满意，可申请全额退款。
        </li>
        <li>
          因平台技术故障（如长时间无法登录、大范围功能失效）导致无法使用服务，且我们未能在
          72 小时内解决的情况。
        </li>
        <li>重复扣费或错误扣费。</li>
      </ul>

      <h3>3.2 按比例退款</h3>
      <ul>
        <li>
          季付或年付用户在付款后 <strong>14 天内</strong> 申请退款，可获得未使用天数的按比例退款。
        </li>
      </ul>

      <h3>3.3 不予退款</h3>
      <ul>
        <li>月付用户在首次 48 小时后申请退款。</li>
        <li>季付/年付用户在 14 天后申请退款。</li>
        <li>因用户自身原因导致的未使用（如忘记取消自动续订、个人时间安排等）。</li>
        <li>因考试成绩不理想而要求退款（本平台不保证考试结果，详见 <Link href="/disclaimer">免责声明</Link>）。</li>
        <li>违反 <Link href="/terms-of-service">服务条款</Link> 导致账户被暂停或终止。</li>
      </ul>

      <h2>4. 退款申请流程</h2>
      <ol>
        <li>
          发送邮件至{" "}
          <a href="mailto:support@hitcf.com">support@hitcf.com</a>
          ，注明：
          <ul>
            <li>注册邮箱地址</li>
            <li>订阅方案和付款日期</li>
            <li>退款原因</li>
          </ul>
        </li>
        <li>我们将在 <strong>3 个工作日</strong> 内审核并回复。</li>
        <li>
          审核通过后，退款将通过 Stripe 原路返回至您的支付方式，预计{" "}
          <strong>5-10 个工作日</strong> 到账。
        </li>
      </ol>

      <h2>5. Stripe 争议</h2>
      <p>
        如您通过银行或信用卡公司发起争议（chargeback），我们将提供交易记录和服务使用证据进行回应。
        <strong>建议您在发起争议前先联系我们</strong>
        ，我们更愿意通过友好协商解决问题。
      </p>

      <h2>6. 联系方式</h2>
      <p>
        退款相关问题，请联系：
        <a href="mailto:support@hitcf.com">support@hitcf.com</a>
      </p>
    </article>
  );
}
