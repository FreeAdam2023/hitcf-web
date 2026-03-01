import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.terms");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/terms-of-service" },
  };
}

export default async function TermsOfServicePage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: February 23, 2026</p>

        <p>
          Welcome to HiTCF (hereinafter referred to as &ldquo;the Platform&rdquo; or &ldquo;we&rdquo;). The Platform is operated by HiTCF, registered in Canada. By using the Platform, you agree to the following terms. If you do not agree, please stop using the Platform.
        </p>

        <h2>1. Service Description</h2>
        <p>
          HiTCF is a TCF Canada online practice platform that provides mock practice questions for listening, reading, speaking, and writing. The content provided is for practice and reference purposes only and <strong>does not represent or guarantee actual TCF Canada exam scores or results</strong>.
        </p>

        <h2>2. Account & Registration</h2>
        <ul>
          <li>Users authenticate via email-based registration. You are responsible for keeping your login credentials secure.</li>
          <li>Each account is for personal use only and may not be transferred, lent, or shared with others.</li>
          <li>If abnormal usage, abuse, or violation of these terms is detected, we reserve the right to suspend or terminate the account.</li>
        </ul>

        <h2>3. Subscription & Payment</h2>
        <ul>
          <li>The Platform offers free content and paid subscription (Pro) services. Payments are processed through Stripe.</li>
          <li>Subscriptions are <strong>auto-renewing</strong>. Unless you cancel before the end of the current billing cycle, you will be automatically charged for the next cycle.</li>
          <li>You may cancel your subscription at any time via the Stripe customer portal. After cancellation, your current period remains active.</li>
          <li>Prices may change. We will notify you by email before any price changes, which take effect at the next renewal.</li>
          <li>For refund details, please see our <Link href="/refund-policy">Refund Policy</Link>.</li>
        </ul>

        <h2>4. Free Trial</h2>
        <p>
          We may offer a free trial period. After the trial ends, if you have not cancelled, you will be automatically charged according to your selected plan. Each user is eligible for one free trial only.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use any automated means (crawlers, scripts, etc.) to scrape, copy, or download Platform content;</li>
          <li>Redistribute, sell, or commercially use Platform content (questions, audio, explanations, etc.);</li>
          <li>Attempt to bypass payment restrictions, tamper with data, or reverse-engineer or penetration-test the Platform;</li>
          <li>Interfere with the normal operation of the Platform or other users&apos; experience.</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <ul>
          <li>The Platform&apos;s website design, branding, user interface, and original code are owned by HiTCF and protected by copyright law. They may not be copied, modified, or distributed without written authorization.</li>
          <li>Practice questions, audio, and related materials are compiled and edited from publicly available sources. The intellectual property of the original content belongs to its respective rights holders. If any rights holder believes content on this Platform infringes their rights, please contact <a href="mailto:support@hitcf.com">support@hitcf.com</a> and we will address it promptly after verification.</li>
          <li>Users may not scrape, copy, or redistribute any content on this Platform for commercial purposes, regardless of its original source.</li>
        </ul>

        <h2>7. Disclaimer</h2>
        <ul>
          <li>Platform content is for learning and practice reference only and <strong>does not constitute any form of exam score guarantee, immigration advice, or legal advice</strong>.</li>
          <li>The &ldquo;CLB level estimates&rdquo; and &ldquo;readiness assessments&rdquo; provided are based on statistical analysis of practice data and are <strong>for reference only — they do not represent actual exam scores</strong>.</li>
          <li>We strive to ensure content accuracy but are not liable for any errors or omissions in question content.</li>
          <li>For the full disclaimer, please see our <Link href="/disclaimer">Disclaimer</Link> page.</li>
        </ul>

        <h2>8. Service Changes & Interruptions</h2>
        <p>
          We reserve the right to modify, suspend, or terminate all or part of the service without prior notice. We are not liable for any losses caused by service interruptions. We will make reasonable efforts to provide advance notice of significant changes.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, HiTCF and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use or inability to use the Platform, including but not limited to unsatisfactory exam results, immigration application outcomes, or data loss.
        </p>

        <h2>10. Governing Law & Dispute Resolution</h2>
        <p>
          These terms are governed by the laws of Canada. Any disputes arising from these terms or use of the Platform shall first be resolved through good-faith negotiation; if negotiation fails, they shall be submitted to a court of competent jurisdiction in Canada.
        </p>

        <h2>11. Modifications to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Updated terms will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Continued use of the Platform constitutes acceptance of the modified terms. We will notify you by email of significant changes.
        </p>

        <h2>12. Contact</h2>
        <p>
          If you have any questions about these terms, please contact: <a href="mailto:support@hitcf.com">support@hitcf.com</a>
        </p>
      </article>
    );
  }

  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>服务条款</h1>
      <p className="text-sm text-muted-foreground">最后更新：2026 年 2 月 23 日</p>

      <p>
        欢迎使用 HiTCF（以下简称&ldquo;本平台&rdquo;或&ldquo;我们&rdquo;）。本平台由 HiTCF
        运营，注册地为加拿大。使用本平台即表示您同意以下条款。如不同意，请停止使用。
      </p>

      <h2>1. 服务内容</h2>
      <p>
        HiTCF 是一个 TCF Canada
        在线练习平台，提供听力、阅读、口语、写作四个科目的模拟练习题。本平台提供的内容仅供练习和参考，
        <strong>不代表也不保证实际 TCF Canada 考试的成绩或结果</strong>。
      </p>

      <h2>2. 账户与注册</h2>
      <ul>
        <li>用户通过邮箱注册进行身份验证登录。您有责任保护自己的登录凭证安全。</li>
        <li>每个账户仅供个人使用，不得转让、出借或与他人共享。</li>
        <li>如发现账户存在异常使用、滥用或违反本条款的行为，我们有权暂停或终止该账户。</li>
      </ul>

      <h2>3. 订阅与付费</h2>
      <ul>
        <li>本平台提供免费内容和付费订阅（Pro）服务。付费订阅通过 Stripe 处理支付。</li>
        <li>订阅为<strong>自动续订</strong>。除非您在当前订阅周期结束前取消，否则将按原方案自动扣费。</li>
        <li>您可以随时通过 Stripe 客户门户取消订阅，取消后当前周期仍有效。</li>
        <li>价格可能调整。调整前我们会通过邮件通知您，新价格将在下一个续订周期生效。</li>
        <li>具体退款政策请参阅 <Link href="/refund-policy">退款政策</Link>。</li>
      </ul>

      <h2>4. 免费试用</h2>
      <p>
        我们可能提供免费试用期。试用期结束后，若未取消订阅，将自动按所选方案收费。每个用户仅可享受一次免费试用。
      </p>

      <h2>5. 使用规范</h2>
      <p>您同意不会：</p>
      <ul>
        <li>以任何自动化方式（爬虫、脚本等）抓取、复制或下载本平台内容；</li>
        <li>将平台内容（题目、音频、解析等）进行二次分发、出售或商业使用；</li>
        <li>尝试绕过付费限制、篡改数据，或对平台进行逆向工程、渗透测试等操作；</li>
        <li>以任何方式干扰平台的正常运行或其他用户的使用体验。</li>
      </ul>

      <h2>6. 知识产权</h2>
      <ul>
        <li>本平台的网站设计、品牌标识、用户界面及原创代码归 HiTCF 所有，受著作权法保护。未经书面授权，不得复制、修改或传播。</li>
        <li>本平台的练习题目、音频及相关素材来源于公开资料的整理和编辑。相关原始内容的知识产权归其原始权利人所有。如有权利人认为本平台内容侵犯了其合法权益，请联系 <a href="mailto:support@hitcf.com">support@hitcf.com</a>，我们将在核实后及时处理。</li>
        <li>用户不得以任何方式抓取、复制或再分发本平台上的内容（无论其原始来源）用于商业用途。</li>
      </ul>

      <h2>7. 免责声明</h2>
      <ul>
        <li>本平台内容仅供学习和练习参考，<strong>不构成任何形式的考试成绩保证、移民建议或法律建议</strong>。</li>
        <li>本平台所提供的&ldquo;CLB 等级估算&rdquo;和&ldquo;准备度评估&rdquo;基于练习数据的统计分析，<strong>仅供参考，不代表实际考试评分</strong>。</li>
        <li>我们尽力确保内容的准确性，但不对题目内容中可能存在的错误或遗漏承担责任。</li>
        <li>详细免责声明请参阅 <Link href="/disclaimer">免责声明</Link> 页面。</li>
      </ul>

      <h2>8. 服务变更与中断</h2>
      <p>
        我们保留在不另行通知的情况下修改、暂停或终止全部或部分服务的权利。对于因服务中断造成的任何损失，我们不承担责任。我们会尽力提前通知重大变更。
      </p>

      <h2>9. 责任限制</h2>
      <p>
        在法律允许的最大范围内，HiTCF 及其运营方对因使用或无法使用本平台而产生的任何直接、间接、偶然、特殊或后果性损害不承担责任，包括但不限于考试成绩不理想、移民申请结果、数据丢失等。
      </p>

      <h2>10. 适用法律与争议解决</h2>
      <p>
        本条款受加拿大法律管辖。任何因本条款或使用本平台产生的争议，应首先通过友好协商解决；协商不成的，提交加拿大有管辖权的法院裁决。
      </p>

      <h2>11. 条款修改</h2>
      <p>
        我们保留随时修改本条款的权利。修改后的条款将在本页面发布并更新&ldquo;最后更新&rdquo;日期。继续使用本平台即视为接受修改后的条款。对于重大修改，我们将通过邮件通知。
      </p>

      <h2>12. 联系方式</h2>
      <p>
        如对本条款有任何疑问，请联系：<a href="mailto:support@hitcf.com">support@hitcf.com</a>
      </p>
    </article>
  );
}
