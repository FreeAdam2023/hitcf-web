# 个性化口语脚本生成器 (Personalized Speaking Script Generator)

> 创建日期: 2026-03-04
> 状态: 待开发

## 核心理念

> 模版人人能背，但你的人生只有你知道。把用户的真实经历变成考试武器。

TCF 口语 Tâche 1 每个人都在讲自己的生活，但大量考生背通用模版 → 考官一听就知道 → 低分。
**个性化句子 = 高分 + 好记**，因为：
- 内容是用户自己的真实想法，记忆成本极低
- 不同人生成不同句子，避免模版雷同被扣分
- 按 CLB 等级控制语法/词汇复杂度，精准匹配目标分数

---

## 用户旅程

1. 选目标等级（默认 CLB 7，可选 5-10）
2. 填个人信息（中文输入）：职业、城市、家庭、爱好、移民原因等
3. AI 生成 **符合目标等级语法/词汇复杂度** 的个性化法语句子（10-15 句 + 中文对照）
4. 预览 → 微调（"换一批" / "更口语化" / "更正式"）
5. 导出 Anki / 翻卡复习
6. 配合 TTS 听发音，配合口语对话练说

---

## Phase 1: Tâche 1 — 自我介绍（MVP）

### 输入表单

| 字段 | 示例 | 必填 |
|------|------|------|
| 目标等级 | CLB 7（默认） | 是 |
| 职业 | 软件工程师 | 是 |
| 城市/国家 | 上海 / 中国 | 是 |
| 家庭情况 | 已婚，一个孩子 | 否 |
| 爱好 | 读书、旅行、摄影 | 否 |
| 移民原因 | 为了孩子教育和生活质量 | 否 |
| 学法语多久 | 一年半 | 否 |
| 补充信息 | 自由输入 | 否 |

### 输出格式

```
🎯 CLB 7 · Tâche 1 自我介绍

1. Bonjour, je m'appelle [name]. Je suis ingénieur en informatique.
   你好，我叫[name]。我是一名软件工程师。

2. J'habite actuellement à Shanghai, en Chine.
   我目前住在中国上海。

3. Je suis marié(e) et j'ai un enfant de trois ans.
   我已婚，有一个三岁的孩子。

... (10-15 句)
```

### 微调选项

- **换一批**: 同样输入，重新生成不同表达
- **更口语化**: 使用更自然的口语表达
- **更正式**: 使用更正式的书面表达
- **提高等级**: 用更复杂的语法和词汇（CLB 7 → 8）
- **降低等级**: 用更简单的表达（CLB 7 → 6）

### 导出

- **Anki 导出**: 每句一张卡片，正面法语，背面中文 + 音标
- **翻卡模式**: 复用现有词汇翻卡组件
- **TTS 播放**: 每句可点击听发音（Azure TTS）
- **复制全文**: 一键复制所有法语句子

---

## Phase 2: Tâche 2 — 角色扮演

### 常见场景库

- 租房（询问房东、签合同）
- 投诉（产品/服务质量问题）
- 预约（医生、行政手续）
- 购物（退换货、询价）
- 出行（买票、问路）

### 用户可以

- 选择场景 + 自定义背景（"我是来加拿大的新移民，需要租公寓"）
- AI 生成双方对话脚本
- 按等级调整复杂度

---

## Phase 3: Tâche 3 — 观点表达

### 热门话题库

- 远程办公 vs 办公室
- 社交媒体对青少年的影响
- 移民融入
- 环境保护
- 科技与教育

### 用户可以

- 选择话题 + 输入自己的立场
- AI 生成结构化论述（观点 → 论据 → 例子 → 总结）
- 按等级调整

---

## 技术方案

### 后端

- `POST /api/speaking-scripts/generate` — 生成个性化脚本
  - 入参: `{ level: "CLB7", tache: 1, inputs: {...}, style: "conversational" }`
  - 出参: `{ sentences: [{ fr: "...", zh: "...", level_tag: "B2" }] }`
- `GET /api/speaking-scripts/{id}` — 获取已保存脚本
- `GET /api/speaking-scripts/` — 用户脚本列表
- `POST /api/speaking-scripts/{id}/export/anki` — 导出 Anki

### LLM Prompt 设计要点

- 明确 CLB/NCLC 等级对应的语法结构和词汇范围
- CLB 5-6: 简单句为主，常用词汇，基础时态（现在/过去/将来）
- CLB 7: 复合句，条件句，虚拟式初步，B2 词汇
- CLB 8-9: 让步/假设从句，虚拟式，成语表达，C1 词汇
- 要求输出自然口语化，非书面语
- 包含连接词和过渡词（d'abord, ensuite, en fait, par ailleurs...）

### 前端

- 新路由: `/speaking-scripts`（脚本列表）、`/speaking-scripts/new`（生成页）
- 复用现有组件: 翻卡、Anki 导出、TTS 播放
- 输入表单 → 加载动画 → 结果展示 → 导出操作

### 数据模型

```python
class SpeakingScript(Document):
    user_id: PydanticObjectId
    tache: int  # 1, 2, 3
    target_level: str  # "CLB5" ~ "CLB10"
    inputs: dict  # 用户输入的个人信息
    style: str  # "conversational" | "formal"
    sentences: list[SpeakingScriptSentence]
    created_at: datetime

class SpeakingScriptSentence(BaseModel):
    fr: str
    zh: str
    level_tag: str  # "A2", "B1", "B2", "C1"
    audio_url: Optional[str]  # TTS 生成后缓存
```

---

## 付费策略

- **免费用户**: 每月 1 次生成（体验价值）
- **Pro 用户**: 无限生成 + 导出 Anki + TTS 播放
- 这是强付费转化点 — 用户生成一次就能感受到个性化价值

---

## 竞品分析

目前 TCF 备考工具市场：
- **无竞品** 做"按 CLB 等级生成个性化口语素材"
- 最接近的是 ChatGPT 手动 prompt，但没有等级控制、Anki 导出、TTS 集成
- **差异化明显，护城河在于产品化体验**

---

## 优先级

- **开发量**: 中等（~1-2 天 MVP，后端 prompt + API + 前端表单/展示）
- **感知价值**: 极高
- **付费转化**: 强
- **建议**: 排入下一个迭代，Phase 1 (Tâche 1) 优先
