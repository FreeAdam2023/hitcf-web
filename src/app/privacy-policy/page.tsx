import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.privacy");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/privacy-policy" },
  };
}

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: February 23, 2026</p>

        <p>
          HiTCF (hereinafter referred to as &ldquo;the Platform&rdquo; or &ldquo;we&rdquo;) values your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information, in compliance with Canada&apos;s Personal Information Protection and Electronic Documents Act (PIPEDA).
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Authentication Information</h3>
        <p>Users register and log in via email. Through this process, we collect:</p>
        <ul>
          <li>Email address</li>
          <li>Name (provided during registration)</li>
        </ul>

        <h3>1.2 Payment Information</h3>
        <p>
          Paid subscriptions are processed through Stripe. We <strong>do not</strong> directly store your credit card numbers or bank card information. Stripe, as a PCI DSS Level 1 certified payment processor, independently manages your payment data. We only store:
        </p>
        <ul>
          <li>Stripe customer ID</li>
          <li>Subscription status and expiration date</li>
          <li>Payment event records (success/failure, no card numbers)</li>
        </ul>

        <h3>1.3 Usage Data</h3>
        <p>During your use of the Platform, we automatically collect:</p>
        <ul>
          <li>Practice and exam records (answers, scores, time spent)</li>
          <li>Wrong answer records</li>
          <li>Practice statistics (accuracy rates, streak days, etc.)</li>
        </ul>

        <h3>1.4 Cookies & Similar Technologies</h3>
        <p>The Platform uses the following cookies or similar technologies:</p>
        <ul>
          <li><strong>Authentication Token</strong>: Used for identity verification and maintaining login state (essential cookie)</li>
          <li><strong>Locale Preference</strong>: Used to remember your language preference (essential cookie)</li>
        </ul>
        <p>
          The Platform currently <strong>does not use</strong> third-party analytics tools (such as Google Analytics) or advertising tracking cookies. If introduced in the future, this policy will be updated and users will be notified.
        </p>

        <h2>2. Purpose of Information Use</h2>
        <p>Personal information we collect is used solely for:</p>
        <ul>
          <li>Providing and maintaining Platform services (authentication, practice records, performance statistics)</li>
          <li>Processing subscription payments and managing account status</li>
          <li>Sending you important account-related notifications (subscription changes, terms updates)</li>
          <li>Improving Platform features and user experience</li>
          <li>Preventing fraud and abuse</li>
        </ul>
        <p>We <strong>will not</strong> use your personal information for advertising or sell it to third parties.</p>

        <h2>3. Data Storage & Security</h2>
        <ul>
          <li>User data is stored in a MongoDB database deployed in a secure cloud server environment.</li>
          <li>Audio files are hosted on Microsoft Azure Blob Storage.</li>
          <li>All data transmission is encrypted via HTTPS/TLS.</li>
          <li>We take reasonable technical and organizational measures to protect your data, but no internet transmission or electronic storage is 100% secure.</li>
        </ul>

        <h2>4. Third-Party Services</h2>
        <p>The Platform uses the following third-party services, each with their own privacy policies:</p>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Purpose</th>
              <th>Data Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Stripe</td>
              <td>Payment processing</td>
              <td>Payment info, subscription status</td>
            </tr>
            <tr>
              <td>Azure Blob Storage</td>
              <td>Audio file storage</td>
              <td>Audio files (no personal info)</td>
            </tr>
            <tr>
              <td>Vercel</td>
              <td>Website hosting</td>
              <td>Access logs</td>
            </tr>
          </tbody>
        </table>

        <h2>5. Data Retention</h2>
        <ul>
          <li>Account information: Retained for the duration of your account.</li>
          <li>Practice records: Retained for the duration of your account. If you delete your account, related data will be deleted within 30 days.</li>
          <li>Payment records: May be retained for up to 7 years as required by tax and legal obligations.</li>
        </ul>

        <h2>6. Your Rights</h2>
        <p>Under PIPEDA and applicable laws, you have the right to:</p>
        <ul>
          <li><strong>Access</strong>: View the personal information we hold about you.</li>
          <li><strong>Correction</strong>: Request correction of inaccurate personal information.</li>
          <li><strong>Deletion</strong>: Request deletion of your personal information (subject to legal retention obligations).</li>
          <li><strong>Data Export</strong>: Obtain a copy of your practice data.</li>
          <li><strong>Withdraw Consent</strong>: Withdraw consent for data processing (which may result in inability to use certain services).</li>
        </ul>
        <p>
          To exercise these rights, please contact: <a href="mailto:support@hitcf.com">support@hitcf.com</a>. We will respond to your request within 30 days.
        </p>

        <h2>7. Minors</h2>
        <p>
          The Platform is not intended for individuals under 16 years of age. We do not knowingly collect personal information from minors. If we discover we have collected information from a minor, it will be immediately deleted.
        </p>

        <h2>8. Cross-Border Data Transfers</h2>
        <p>
          Your data may be stored and processed on servers outside of Canada (including but not limited to the United States, due to the use of Stripe, Azure, and similar services). We ensure that these service providers maintain adequate data protection measures.
        </p>

        <h2>9. Policy Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. Updated policies will be posted on this page with an updated &ldquo;Last updated&rdquo; date. For significant changes, we will notify you by email.
        </p>

        <h2>10. Contact</h2>
        <p>If you have any questions about this Privacy Policy or need to exercise your data rights, please contact:</p>
        <ul>
          <li>Email: <a href="mailto:support@hitcf.com">support@hitcf.com</a></li>
        </ul>
      </article>
    );
  }

  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>隐私政策</h1>
      <p className="text-sm text-muted-foreground">最后更新：2026 年 2 月 23 日</p>

      <p>
        HiTCF（以下简称&ldquo;本平台&rdquo;或&ldquo;我们&rdquo;）重视用户隐私。本隐私政策说明我们如何收集、使用、存储和保护您的个人信息，并符合加拿大《个人信息保护和电子文件法》（PIPEDA）的要求。
      </p>

      <h2>1. 我们收集的信息</h2>

      <h3>1.1 身份验证信息</h3>
      <p>用户通过邮箱注册登录。通过此过程，我们获取：</p>
      <ul>
        <li>电子邮箱地址</li>
        <li>姓名（注册时提供）</li>
      </ul>

      <h3>1.2 支付信息</h3>
      <p>
        付费订阅通过 Stripe 处理。我们<strong>不会</strong>直接存储您的信用卡号码或银行卡信息。Stripe 作为 PCI DSS Level 1 认证的支付处理商，独立管理您的支付数据。我们仅存储：
      </p>
      <ul>
        <li>Stripe 客户 ID</li>
        <li>订阅状态和到期时间</li>
        <li>支付事件记录（成功/失败，不含卡号）</li>
      </ul>

      <h3>1.3 使用数据</h3>
      <p>在您使用平台过程中，我们自动收集：</p>
      <ul>
        <li>练习和考试记录（答题情况、得分、用时）</li>
        <li>错题记录</li>
        <li>练习统计数据（正确率、连续打卡天数等）</li>
      </ul>

      <h3>1.4 Cookie 与类似技术</h3>
      <p>本平台使用以下 Cookie 或类似技术：</p>
      <ul>
        <li><strong>身份验证 Token</strong>：用于身份验证和维持登录状态（必要性 Cookie）</li>
        <li><strong>语言偏好</strong>：用于记住您的语言选择（必要性 Cookie）</li>
      </ul>
      <p>
        本平台目前<strong>不使用</strong>第三方分析工具（如 Google Analytics）或广告跟踪 Cookie。如未来引入，将更新本政策并通知用户。
      </p>

      <h2>2. 信息使用目的</h2>
      <p>我们收集的个人信息仅用于：</p>
      <ul>
        <li>提供和维护平台服务（身份验证、练习记录、成绩统计）</li>
        <li>处理订阅付款和管理账户状态</li>
        <li>向您发送与账户相关的重要通知（如订阅变更、条款更新）</li>
        <li>改进平台功能和用户体验</li>
        <li>防止欺诈和滥用行为</li>
      </ul>
      <p>我们<strong>不会</strong>将您的个人信息用于广告投放或出售给第三方。</p>

      <h2>3. 数据存储与安全</h2>
      <ul>
        <li>用户数据存储在 MongoDB 数据库中，部署于安全的云服务器环境。</li>
        <li>音频文件托管于 Microsoft Azure Blob Storage。</li>
        <li>所有数据传输通过 HTTPS/TLS 加密。</li>
        <li>我们采取合理的技术和组织措施保护您的数据，但互联网传输和电子存储无法保证 100% 安全。</li>
      </ul>

      <h2>4. 第三方服务</h2>
      <p>本平台使用以下第三方服务，这些服务有各自的隐私政策：</p>
      <table>
        <thead>
          <tr>
            <th>服务</th>
            <th>用途</th>
            <th>数据类型</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Stripe</td>
            <td>支付处理</td>
            <td>支付信息、订阅状态</td>
          </tr>
          <tr>
            <td>Azure Blob Storage</td>
            <td>音频文件存储</td>
            <td>音频文件（无个人信息）</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>网站托管</td>
            <td>访问日志</td>
          </tr>
        </tbody>
      </table>

      <h2>5. 数据保留</h2>
      <ul>
        <li>账户信息：在您的账户存续期间保留。</li>
        <li>练习记录：在您的账户存续期间保留。如您删除账户，相关数据将在 30 天内删除。</li>
        <li>支付记录：根据税务和法律要求，可能保留最长 7 年。</li>
      </ul>

      <h2>6. 您的权利</h2>
      <p>根据 PIPEDA 及相关法律，您有权：</p>
      <ul>
        <li><strong>访问</strong>：查看我们持有的关于您的个人信息。</li>
        <li><strong>更正</strong>：要求更正不准确的个人信息。</li>
        <li><strong>删除</strong>：要求删除您的个人信息（受法律保留义务限制）。</li>
        <li><strong>数据导出</strong>：获取您的练习数据副本。</li>
        <li><strong>撤回同意</strong>：撤回对数据处理的同意（可能导致无法继续使用部分服务）。</li>
      </ul>
      <p>
        如需行使上述权利，请联系：<a href="mailto:support@hitcf.com">support@hitcf.com</a>。我们将在 30 天内回复您的请求。
      </p>

      <h2>7. 未成年人</h2>
      <p>
        本平台不面向 16 岁以下的未成年人。我们不会故意收集未成年人的个人信息。如果我们发现已收集未成年人的信息，将立即删除。
      </p>

      <h2>8. 跨境数据传输</h2>
      <p>
        您的数据可能存储和处理在加拿大境外的服务器上（包括但不限于美国，因为使用了 Stripe、Azure 等服务）。我们确保这些服务提供商具备充分的数据保护措施。
      </p>

      <h2>9. 政策变更</h2>
      <p>
        我们可能不时更新本隐私政策。更新后的政策将在本页面发布并更新&ldquo;最后更新&rdquo;日期。对于重大变更，我们将通过邮件通知您。
      </p>

      <h2>10. 联系方式</h2>
      <p>如对本隐私政策有任何疑问或需要行使您的数据权利，请联系：</p>
      <ul>
        <li>邮箱：<a href="mailto:support@hitcf.com">support@hitcf.com</a></li>
      </ul>
    </article>
  );
}
