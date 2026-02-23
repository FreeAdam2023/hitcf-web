import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "免责声明 · 内容来源与考试结果声明",
  description:
    "HiTCF 免责声明：本平台为独立第三方练习平台，与 TCF 官方无关。CLB 等级估算仅供参考，不保证实际考试成绩。内容来源于公开资料。",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>免责声明</h1>
      <p className="text-sm text-muted-foreground">
        最后更新：2026 年 2 月 23 日
      </p>

      <h2>1. 非官方平台</h2>
      <p>
        HiTCF 是一个<strong>独立运营的第三方练习平台</strong>
        。本平台与法国国际教育研究中心（France Éducation international，原
        CIEP）、TCF 官方考试机构、加拿大移民局（IRCC）或任何政府机构
        <strong>无任何关联、合作或授权关系</strong>。
      </p>
      <p>
        &ldquo;TCF&rdquo;（Test de connaissance du français）和 &ldquo;TCF Canada&rdquo; 是 France
        Éducation international 的注册商标，本平台对其引用仅为说明练习内容的对标方向。
      </p>

      <h2>2. 不保证考试结果</h2>
      <p>
        <strong>
          使用本平台不保证您将通过 TCF Canada 考试或达到任何特定的 CLB 等级。
        </strong>
      </p>
      <ul>
        <li>
          本平台展示的&ldquo;CLB 等级估算&rdquo;、&ldquo;准备度评估&rdquo;和&ldquo;预计等级&rdquo;均基于您在练习中的答题数据统计分析，
          <strong>仅供参考</strong>，不等于也不预示实际 TCF 考试评分。
        </li>
        <li>
          实际 TCF 考试成绩取决于众多因素，包括但不限于考试当天的状态、出题范围、评分标准等，这些均超出本平台的控制范围。
        </li>
        <li>
          &ldquo;CLB 7，练出来的&rdquo;等宣传用语旨在鼓励用户坚持练习，
          <strong>不构成任何形式的成绩承诺或结果保证</strong>。
        </li>
      </ul>

      <h2>3. 内容来源与准确性</h2>
      <ul>
        <li>
          本平台的练习题目、音频及相关素材<strong>来源于互联网公开资料的收集、整理和编辑</strong>，相关原始内容的知识产权归其原始权利人所有。
        </li>
        <li>
          题目经过整理和审核，但我们
          <strong>不保证内容 100% 准确、完整或无误</strong>
          ，也不保证与实际 TCF 考试的格式、难度或内容一致。
        </li>
        <li>
          如有权利人认为本平台内容侵犯了其合法权益，请联系{" "}
          <a href="mailto:support@hitcf.com">support@hitcf.com</a>
          ，我们将在核实后及时处理（包括删除相关内容）。
        </li>
        <li>
          如发现内容错误，也欢迎通过上述邮箱反馈，我们将尽快修正。
        </li>
      </ul>

      <h2>4. 非移民建议</h2>
      <p>
        本平台提供的任何信息（包括 CLB
        等级说明、移民相关术语解释等）均
        <strong>不构成移民建议、法律建议或专业咨询</strong>
        。移民申请涉及复杂的法规和政策，建议咨询持牌移民顾问（RCIC）或移民律师。
      </p>

      <h2>5. 第三方链接</h2>
      <p>
        本平台可能包含指向第三方网站或服务的链接（如
        ChatGPT、Telegram、微信等）。我们对第三方内容不承担任何责任，访问这些链接的风险由用户自行承担。
      </p>

      <h2>6. 用户评价与推荐</h2>
      <p>
        平台上展示的用户评价和成绩分享代表个人经历，
        <strong>不代表所有用户都能获得相同结果</strong>
        。每位用户的学习基础、投入时间和学习方法不同，结果因人而异。
      </p>

      <h2>7. 服务可用性</h2>
      <p>
        我们尽力保障平台 24/7
        可用，但不保证服务不间断或无错误。因维护、升级、网络问题或不可抗力导致的服务中断，我们不承担责任。
      </p>

      <h2>8. 责任限制</h2>
      <p>
        在法律允许的最大范围内，HiTCF
        及其运营方对因使用或依赖本平台内容而产生的任何损失不承担责任，包括但不限于：
      </p>
      <ul>
        <li>考试未通过或未达到预期等级；</li>
        <li>移民申请被拒或延迟；</li>
        <li>基于平台估算数据做出的任何决策后果。</li>
      </ul>

      <h2>9. 联系方式</h2>
      <p>
        如对本免责声明有任何疑问，请联系：
        <a href="mailto:support@hitcf.com">support@hitcf.com</a>
      </p>

      <p className="mt-8 text-sm text-muted-foreground">
        其他法律文件：
        <Link href="/terms-of-service">服务条款</Link> ·{" "}
        <Link href="/privacy-policy">隐私政策</Link> ·{" "}
        <Link href="/refund-policy">退款政策</Link>
      </p>
    </article>
  );
}
