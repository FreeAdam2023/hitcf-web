import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TCF Canada 考试指南 · 分数对照、学习资源、考场信息",
  description:
    "TCF Canada 考试全面指南：考试内容与格式、NCLC/CLB 分数对照表、免费法语学习资源推荐、中国及加拿大考场信息汇总。",
  keywords: [
    "TCF Canada 考试",
    "CLB 分数对照",
    "NCLC 对照表",
    "TCF 考场",
    "法语学习资源",
    "TCF Canada 报名",
    "加拿大移民法语考试",
  ],
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>TCF Canada 考试指南</h1>
      <p className="lead">
        备考 TCF Canada 你需要知道的一切：考试内容、分数对照、学习资源和考场信息。
      </p>

      {/* ── 1. 考试简介 ── */}
      <h2 id="introduction">什么是 TCF Canada</h2>
      <p>
        TCF Canada（Test de connaissance du français pour le Canada）是由法国国际教育研究中心
        <strong>France Éducation international</strong>（原 CIEP）开发的法语能力测试，专为加拿大移民和公民申请设计。
      </p>
      <p>适用场景：</p>
      <ul>
        <li>联邦快速通道（Express Entry）移民</li>
        <li>省提名计划（PNP）</li>
        <li>加拿大公民入籍</li>
        <li>魁北克移民（CSQ / PEQ）</li>
      </ul>
      <p>
        成绩<strong>有效期 2 年</strong>，两次考试之间至少间隔 <strong>30 天</strong>。
      </p>

      {/* ── 2. 考试内容 ── */}
      <h2 id="exam-format">考试内容（4 个必考科目）</h2>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>科目</th>
              <th>题数 / 任务</th>
              <th>时长</th>
              <th>分数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>听力理解 (CO)</td>
              <td>39 题选择题</td>
              <td>35 分钟</td>
              <td>0–699</td>
            </tr>
            <tr>
              <td>阅读理解 (CE)</td>
              <td>39 题选择题</td>
              <td>60 分钟</td>
              <td>0–699</td>
            </tr>
            <tr>
              <td>写作表达 (EE)</td>
              <td>3 个写作任务</td>
              <td>60 分钟</td>
              <td>0–20</td>
            </tr>
            <tr>
              <td>口语表达 (EO)</td>
              <td>3 个口语任务</td>
              <td>12 分钟</td>
              <td>0–20</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>写作表达（EE）3 个 Tâche</h3>
      <ul>
        <li><strong>Tâche 1</strong>：短消息（60–120 词）</li>
        <li><strong>Tâche 2</strong>：正式信 / 文章（120–150 词）</li>
        <li><strong>Tâche 3</strong>：议论文（120–180 词）</li>
      </ul>

      <h3>口语表达（EO）3 个 Tâche</h3>
      <ul>
        <li><strong>Tâche 1</strong>：引导面试（2 分钟）</li>
        <li><strong>Tâche 2</strong>：角色扮演（5.5 分钟，含 2 分钟准备）</li>
        <li><strong>Tâche 3</strong>：观点论述（4.5 分钟）</li>
      </ul>

      {/* ── 3. NCLC/CLB 分数对照表 ── */}
      <h2 id="nclc-clb">NCLC / CLB 分数对照表</h2>
      <p>
        加拿大移民局（IRCC）使用 <strong>NCLC</strong>（Niveaux de compétence linguistique canadiens）/ <strong>CLB</strong> 等级评估语言能力。
        以下为 TCF Canada 分数与 NCLC 的对照：
      </p>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>NCLC</th>
              <th>听力 (CO)</th>
              <th>阅读 (CE)</th>
              <th>写作 (EE)</th>
              <th>口语 (EO)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>4</td>
              <td>331–368</td>
              <td>342–374</td>
              <td>4–5</td>
              <td>4–5</td>
            </tr>
            <tr>
              <td>5</td>
              <td>369–397</td>
              <td>375–405</td>
              <td>6</td>
              <td>6</td>
            </tr>
            <tr>
              <td>6</td>
              <td>398–457</td>
              <td>406–452</td>
              <td>7–9</td>
              <td>7–9</td>
            </tr>
            <tr className="bg-primary/10 font-semibold">
              <td>7 *</td>
              <td>458–502</td>
              <td>453–498</td>
              <td>10–11</td>
              <td>10–11</td>
            </tr>
            <tr>
              <td>8</td>
              <td>503–522</td>
              <td>499–523</td>
              <td>12–13</td>
              <td>12–13</td>
            </tr>
            <tr>
              <td>9</td>
              <td>523–548</td>
              <td>524–548</td>
              <td>14–15</td>
              <td>14–15</td>
            </tr>
            <tr>
              <td>10+</td>
              <td>549–699</td>
              <td>549–699</td>
              <td>16–20</td>
              <td>16–20</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        * NCLC 7 是大部分 Express Entry 和 PNP 项目的最低语言要求，也是多数考生的目标等级。
      </p>

      {/* ── 4. 学习资源 ── */}
      <h2 id="learning-resources">学习资源推荐</h2>
      <p>以下资源均为免费或官方渠道，帮助你从不同维度提升法语能力。</p>

      <h3>官方 &amp; 机构资源</h3>
      <ul>
        <li>
          <a href="https://apprendre.tv5monde.com" target="_blank" rel="noopener noreferrer">
            TV5MONDE
          </a>{" "}
          — 法国国际电视台旗下的免费法语学习平台，提供 A1–C1 全等级的视频课程和互动练习题。内容按主题分类（文化、社会、科学等），非常适合用来同时提升听力和阅读。
        </li>
        <li>
          <a href="https://savoirs.rfi.fr" target="_blank" rel="noopener noreferrer">
            RFI Savoirs
          </a>{" "}
          — 法国国际广播电台的学习频道，用真实的法语新闻音频配上练习题。语速从慢速到正常都有，是练习 TCF 听力理解（CO）的绝佳素材。
        </li>
        <li>
          <a href="https://savoirs.rfi.fr/fr/apprendre-enseigner/langue-francaise/journal-en-francais-facile" target="_blank" rel="noopener noreferrer">
            Journal en français facile
          </a>{" "}
          — RFI 出品的「简明法语新闻」，每天 10 分钟，用清晰缓慢的语速播报当日国际新闻。坚持每天听一期，一个月后听力会有明显进步。
        </li>
        <li>
          <a href="https://www.france-education-international.fr/hub/tcf" target="_blank" rel="noopener noreferrer">
            France Éducation international
          </a>{" "}
          — TCF 考试的官方出题机构网站，可以查看考试介绍、评分标准和官方样题。备考前务必先看一遍官方说明，了解考试的真实格式。
        </li>
        <li>
          <a href="https://www.francaisfacile.com" target="_blank" rel="noopener noreferrer">
            Français Facile
          </a>{" "}
          — 老牌法语学习网站，提供大量免费语法、词汇、听力和阅读练习，按难度分级。适合系统性地补语法基础。
        </li>
      </ul>

      <h3>YouTube 频道</h3>
      <ul>
        <li>
          <a href="https://www.youtube.com/@francaisauthentique" target="_blank" rel="noopener noreferrer">
            Français Authentique
          </a>{" "}
          — 百万粉丝的沉浸式法语频道，主播 Johan 用纯法语讲解日常话题。不教语法规则，而是通过大量自然输入培养语感，适合 B1 以上想突破「哑巴法语」的同学。
        </li>
        <li>
          <a href="https://www.youtube.com/@theperfectfrenchwithdylane" target="_blank" rel="noopener noreferrer">
            The perfect French with Dylane
          </a>{" "}
          — 法国人 Dylane 的教学频道，专注语法讲解和词汇扩展，每期视频短小精悍。讲解清晰有条理，适合想系统梳理法语语法的考生。
        </li>
        <li>
          <a href="https://www.youtube.com/@FrancaisavecPierre" target="_blank" rel="noopener noreferrer">
            Français avec Pierre
          </a>{" "}
          — 法语教师 Pierre 的综合教学频道，覆盖语法、词汇、发音、文化等。内容从 B1 到 C1 都有，法语 + 法语字幕的形式很适合备考中的精听练习。
        </li>
        <li>
          <a href="https://www.youtube.com/@innerFrench" target="_blank" rel="noopener noreferrer">
            InnerFrench
          </a>{" "}
          — Hugo 的纯法语播客频道，每期 20–30 分钟讨论一个文化或社会话题。语速适中偏慢，非常适合 B1–B2 阶段做泛听，也能积累口语和写作的论点素材。
        </li>
        <li>
          <a href="https://www.youtube.com/@EasyFrench" target="_blank" rel="noopener noreferrer">
            Easy French
          </a>{" "}
          — 法国街头随机采访系列，真实法国人用日常口语回答各种问题。配有法语 + 英语双字幕，能让你听到课本里学不到的地道表达和口语节奏。
        </li>
        <li>
          <a href="https://www.youtube.com/@leaboreal" target="_blank" rel="noopener noreferrer">
            Learn French with Alexa
          </a>{" "}
          — 英法双语教学频道，Alexa 用英语解释法语语法和发音规则。讲解节奏慢、例子多，特别适合零基础到 A2 阶段的初学者打基础。
        </li>
      </ul>

      <h3>中文法语资源</h3>
      <ul>
        <li>
          <a href="https://www.bilibili.com" target="_blank" rel="noopener noreferrer">
            B 站
          </a>{" "}
          — 搜索「你好法语 A1 教材音频」「TCF 备考」等关键词，能找到大量中文讲解的法语教学视频，包括教材配套音频、语法串讲和真题解析。对于习惯中文学习的同学来说是最容易上手的资源。
        </li>
      </ul>

      <h3>工具类</h3>
      <ul>
        <li>
          <a href="https://quizlet.com" target="_blank" rel="noopener noreferrer">
            Quizlet
          </a>{" "}
          — 电子闪卡工具，可以搜索其他用户创建的 TCF 词汇卡组，也可以自己制作。利用间隔重复算法帮你高效记忆单词，通勤时刷几分钟就行。
        </li>
        <li>
          <a href="https://www.duolingo.com" target="_blank" rel="noopener noreferrer">
            Duolingo
          </a>{" "}
          — 游戏化语言学习 App，每天 10–15 分钟的碎片时间就能完成一课。虽然达不到 TCF 的深度，但很适合保持每日法语接触、培养基础语感。
        </li>
        <li>
          <a href="https://www.logicieleducatif.fr" target="_blank" rel="noopener noreferrer">
            LogicielÉducatif
          </a>{" "}
          — 法国本土的教育游戏网站，通过小游戏练习法语拼写、语法和词汇。虽然面向法国学生设计，但对法语学习者同样有效，寓教于乐。
        </li>
        <li>
          <a href="https://www.lawlessfrench.com" target="_blank" rel="noopener noreferrer">
            Lawless French
          </a>{" "}
          — 全面的法语语法参考网站，按主题系统整理了从初级到高级的所有语法点，每个知识点都有例句和练习。遇到语法疑问时可以当字典查。
        </li>
      </ul>

      {/* ── 5. 中国考场 ── */}
      <h2 id="test-centers-china">中国考场信息</h2>
      <p>TCF Canada 在中国多个城市设有考点，主要由法语联盟（Alliance Française）和部分高校承办。</p>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>城市</th>
              <th>机构</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>北京</td>
              <td>北京语言大学 / 北京法盟</td>
              <td></td>
            </tr>
            <tr>
              <td>上海</td>
              <td>上海法语培训中心</td>
              <td>费用约 2,700 元</td>
            </tr>
            <tr>
              <td>广州</td>
              <td>暨南大学 / 广州法盟</td>
              <td></td>
            </tr>
            <tr>
              <td>成都</td>
              <td>电子科技大学 / 成都法盟</td>
              <td></td>
            </tr>
            <tr>
              <td>武汉</td>
              <td>武汉法盟</td>
              <td>微信报名</td>
            </tr>
            <tr>
              <td>大连</td>
              <td>大连外国语大学 / 大连法盟</td>
              <td></td>
            </tr>
            <tr>
              <td>昆明</td>
              <td>昆明法盟</td>
              <td>微信报名</td>
            </tr>
            <tr>
              <td>山东</td>
              <td>山东法盟</td>
              <td>2026 新增</td>
            </tr>
            <tr>
              <td>南京</td>
              <td>南京法盟</td>
              <td>2026 新增</td>
            </tr>
            <tr>
              <td>香港</td>
              <td>香港法盟</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        考场信息可能变动，请以各考点官方通知为准。全球考场查询：
        <a href="https://www.lefrancaisdesaffaires.fr" target="_blank" rel="noopener noreferrer">
          lefrancaisdesaffaires.fr
        </a>
      </p>

      {/* ── 6. 加拿大考场 ── */}
      <h2 id="test-centers-canada">加拿大考场信息</h2>
      <p>加拿大主要城市均设有 TCF Canada 考点，由当地法语联盟组织考试。</p>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>城市</th>
              <th>机构</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Toronto</td>
              <td>Alliance Française Toronto（4 个考点）</td>
            </tr>
            <tr>
              <td>Montréal</td>
              <td>Alliance Française de Montréal</td>
            </tr>
            <tr>
              <td>Vancouver</td>
              <td>Alliance Française Vancouver</td>
            </tr>
            <tr>
              <td>Calgary</td>
              <td>Alliance Française Calgary</td>
            </tr>
            <tr>
              <td>Ottawa</td>
              <td>Alliance Française Ottawa</td>
            </tr>
            <tr>
              <td>Halifax</td>
              <td>Alliance Française Halifax</td>
            </tr>
            <tr>
              <td>Edmonton</td>
              <td>Alliance Française Edmonton</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        费用约 CAD $390，每季度开放报名。具体日期请查看各 Alliance Française 官网。
      </p>

      {/* ── 7. 页面底部 ── */}
      <hr />
      <p className="text-sm text-muted-foreground">
        以上信息仅供参考，不构成移民建议。考试政策和考场安排可能随时调整，请以官方渠道为准。
      </p>
      <p className="text-sm text-muted-foreground">
        <Link href="/pricing">查看 HiTCF 定价</Link> ·{" "}
        <Link href="/disclaimer">免责声明</Link> ·{" "}
        <Link href="/tests">开始练习</Link>
      </p>
    </article>
  );
}
