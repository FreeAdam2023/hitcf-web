import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.refund");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/refund-policy" },
  };
}

export default async function RefundPolicyPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
        <h1>Refund Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: February 23, 2026</p>

        <p>Thank you for choosing HiTCF. This refund policy applies to all paid subscription services purchased through the Platform.</p>

        <h2>1. Free Trial</h2>
        <ul>
          <li>All new users are eligible for a free trial (<strong>2 months for the yearly plan</strong>, 7 days for monthly/quarterly plans). No charges during the trial period.</li>
          <li>You may cancel at any time during the trial at no cost.</li>
          <li>After the trial ends, if not cancelled, you will be automatically charged according to your selected plan.</li>
          <li>Each user (per email address) is eligible for one free trial only.</li>
        </ul>

        <h2>2. Subscription Cancellation</h2>
        <ul>
          <li>You may cancel your subscription at any time via the &ldquo;Manage Subscription&rdquo; button on the <Link href="/pricing">Pricing page</Link>, which opens the Stripe customer portal.</li>
          <li>After cancellation, your Pro access remains active until the end of the current billing period, after which you will be downgraded to a free user.</li>
          <li>Cancelling a subscription <strong>does not</strong> automatically generate a refund.</li>
        </ul>

        <h2>3. Refund Conditions</h2>
        <p>The following situations are eligible for a refund:</p>

        <h3>3.1 Full Refund</h3>
        <ul>
          <li>Within <strong>48 hours</strong> of your first payment, if you are unsatisfied with the service.</li>
          <li>If a Platform technical issue (such as prolonged login failures or widespread feature outages) prevents you from using the service, and we fail to resolve it within 72 hours.</li>
          <li>Duplicate or erroneous charges.</li>
        </ul>

        <h3>3.2 Prorated Refund</h3>
        <ul>
          <li>Quarterly or yearly subscribers who request a refund within <strong>14 days</strong> of payment may receive a prorated refund for unused days.</li>
        </ul>

        <h3>3.3 Non-Refundable</h3>
        <ul>
          <li>Monthly subscribers requesting a refund after the initial 48 hours.</li>
          <li>Quarterly/yearly subscribers requesting a refund after 14 days.</li>
          <li>Non-use due to personal reasons (e.g., forgetting to cancel auto-renewal, personal scheduling).</li>
          <li>Refund requests based on unsatisfactory exam results (the Platform does not guarantee exam outcomes — see our <Link href="/disclaimer">Disclaimer</Link>).</li>
          <li>Account suspension or termination due to violation of <Link href="/terms-of-service">Terms of Service</Link>.</li>
        </ul>

        <h2>4. Refund Process</h2>
        <ol>
          <li>
            Send an email to <a href="mailto:support@hitcf.com">support@hitcf.com</a> with:
            <ul>
              <li>Your registered email address</li>
              <li>Subscription plan and payment date</li>
              <li>Reason for refund</li>
            </ul>
          </li>
          <li>We will review and respond within <strong>3 business days</strong>.</li>
          <li>Once approved, the refund will be processed via Stripe to your original payment method, typically arriving within <strong>5–10 business days</strong>.</li>
        </ol>

        <h2>5. Stripe Disputes</h2>
        <p>
          If you initiate a dispute (chargeback) through your bank or credit card company, we will provide transaction records and service usage evidence in response. <strong>We recommend contacting us before initiating a dispute</strong> — we prefer to resolve issues through friendly communication.
        </p>

        <h2>6. Contact</h2>
        <p>
          For refund-related questions, please contact: <a href="mailto:support@hitcf.com">support@hitcf.com</a>
        </p>
      </article>
    );
  }

  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>退款政策</h1>
      <p className="text-sm text-muted-foreground">最后更新：2026 年 2 月 23 日</p>

      <p>感谢选择 HiTCF。本退款政策适用于通过本平台购买的所有付费订阅服务。</p>

      <h2>1. 免费试用</h2>
      <ul>
        <li>所有新用户可享受免费试用（<strong>年付方案 2 个月</strong>，月付/季付方案 7 天），试用期间不收取任何费用。</li>
        <li>试用期内随时可以取消，不会产生任何费用。</li>
        <li>试用期结束后，如未取消，将自动按所选方案收费。</li>
        <li>每个用户（每个邮箱地址）仅可享受一次免费试用。</li>
      </ul>

      <h2>2. 订阅取消</h2>
      <ul>
        <li>您可以随时通过 <Link href="/pricing">定价页面</Link> 的&ldquo;管理订阅&rdquo;按钮进入 Stripe 客户门户取消订阅。</li>
        <li>取消后，您的 Pro 权限将保留至当前付费周期结束，之后自动降级为免费用户。</li>
        <li>取消订阅<strong>不会</strong>自动产生退款。</li>
      </ul>

      <h2>3. 退款条件</h2>
      <p>以下情况可以申请退款：</p>

      <h3>3.1 全额退款</h3>
      <ul>
        <li>首次付款后 <strong>48 小时内</strong>，如您对服务不满意，可申请全额退款。</li>
        <li>因平台技术故障（如长时间无法登录、大范围功能失效）导致无法使用服务，且我们未能在 72 小时内解决的情况。</li>
        <li>重复扣费或错误扣费。</li>
      </ul>

      <h3>3.2 按比例退款</h3>
      <ul>
        <li>季付或年付用户在付款后 <strong>14 天内</strong> 申请退款，可获得未使用天数的按比例退款。</li>
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
          发送邮件至 <a href="mailto:support@hitcf.com">support@hitcf.com</a>，注明：
          <ul>
            <li>注册邮箱地址</li>
            <li>订阅方案和付款日期</li>
            <li>退款原因</li>
          </ul>
        </li>
        <li>我们将在 <strong>3 个工作日</strong> 内审核并回复。</li>
        <li>审核通过后，退款将通过 Stripe 原路返回至您的支付方式，预计 <strong>5-10 个工作日</strong> 到账。</li>
      </ol>

      <h2>5. Stripe 争议</h2>
      <p>
        如您通过银行或信用卡公司发起争议（chargeback），我们将提供交易记录和服务使用证据进行回应。<strong>建议您在发起争议前先联系我们</strong>，我们更愿意通过友好协商解决问题。
      </p>

      <h2>6. 联系方式</h2>
      <p>
        退款相关问题，请联系：<a href="mailto:support@hitcf.com">support@hitcf.com</a>
      </p>
    </article>
  );
}
