# 基于表单答案的智能回复系统

## 核心概念

用户**不是自由提问**，而是通过表单**选择答案**，系统根据这些选择生成综合建议。

---

## 场景示例

### 用户填写的表单

```json
{
  "name": "Dr. Sarah Chen",
  "email": "sarah.chen@university.edu.au",
  "grants-team": ["health-medical"],           // 选择了：Health and Medical团队
  "stage-of-query": "pre-award",               // 选择了：Pre-Award阶段
  "query-type": "simple",                      // 选择了：Simple查询
  "simple-grants-scheme": ["nhmrc"],           // 选择了：NHMRC
  "simple-mri-involvement": "no",              // 选择了：不涉及MRI
  "simple-type-of-query": ["contractual"],     // 选择了：审查合同条款
  "simple-clause-type": ["background-ip", "liability"],  // 选择了：背景IP + 责任条款
  "simple-guide-check": "yes",                 // 选择了：已查看指南
  "simple-request-explanation": "我需要审查与XYZ大学的合作协议，他们要求访问我们的研究工具，并要求我们承担无限责任。",
  "simple-urgency": "yes",
  "simple-urgency-date": "2025-10-20"
}
```

### 系统应该返回什么？

**不仅仅是"应该用什么协议"**，而是一个**全面的行动指导**：

---

## 生成的回复内容结构

### 1️⃣ **情况总结**
根据用户选择的答案，总结他们的情况

```markdown
## 您的查询总结

基于您的表单提交，我们理解您的情况如下：

- 📋 项目类型: NHMRC资助项目
- 🏥 相关团队: Health and Medical
- 📅 阶段: Pre-Award (资助前)
- 📝 协议类型: 合作协议
- 🔍 关注条款: Background IP（背景知识产权）和 Liability（责任条款）
- ⏰ 紧急程度: 需在2025年10月20日前完成
```

### 2️⃣ **针对每个选择的具体建议**

因为用户选择了 **Background IP** 和 **Liability**，系统需要分别给出建议：

#### A. Background IP建议

```markdown
### 🔸 Background IP（背景知识产权）条款建议

根据EAAC指南和NHMRC政策：

**问题识别：**
您提到"他们要求访问我们的研究工具" - 这涉及Background IP授权

**标准立场：**
- ✅ 大学保留所有研究工具的所有权
- ✅ 可授予有限的访问权（仅限项目用途）
- ❌ 不能转让所有权给合作方

**推荐条款语言：**
```
The University of Melbourne retains ownership of all Background IP 
including research tools. XYZ University is granted a non-exclusive, 
royalty-free license to use specified research tools solely for the 
purposes of this NHMRC-funded collaborative project.
```

**具体行动：**
1. 列出需要共享的具体研究工具清单
2. 明确使用范围限制在"本项目目的"
3. 禁止商业使用和第三方转让
4. 考虑签署材料转让协议(MTA)
```

#### B. Liability建议

```markdown
### 🔸 Liability（责任条款）建议

根据EAAC指南和大学政策：

**问题识别：**
⚠️ 您提到"要求我们承担无限责任" - **这是不可接受的**

**大学政策：**
- ❌ 大学**不接受**无限责任
- ✅ 责任必须有上限
- ✅ 仅限直接损失（不包括间接损失）

**标准责任上限：**
- 方案A: 等于资助金额
- 方案B: 不超过$1,000,000
- 取两者中较低值

**推荐条款语言：**
```
Each party's liability under this Agreement shall be limited to direct 
damages only and capped at the lower of:
(a) the total grant funding amount; or
(b) AUD $1,000,000 per incident.

Neither party shall be liable for indirect, consequential, or punitive damages.
```

**关键行动：**
🚨 **必须修改** - 无限责任条款与大学政策冲突，必须协商修改
```

### 3️⃣ **协议类型建议**

根据用户的选择，推荐具体的协议类型和模板：

```markdown
## 推荐协议类型

基于您的情况（NHMRC资助 + 研究合作 + Pre-Award阶段），推荐：

### 主要协议: Multi-Institutional Research Agreement (MIRA)

**为什么选择MIRA：**
- ✓ 适用于NHMRC多机构合作项目
- ✓ 涵盖IP管理条款
- ✓ 包含责任和赔偿标准条款
- ✓ 大学有标准模板

**模板位置：**
📄 [MIRA Template - NHMRC Version](link-to-template)

**关键章节：**
- 第3条: Background IP定义和所有权
- 第4条: Project IP所有权和分配
- 第7条: 责任限制和赔偿
- 第8条: 保险要求
```

### 4️⃣ **风险提示**

基于用户的选择，标记潜在风险：

```markdown
## ⚠️ 风险提示

基于您的提交，我们识别出以下风险点：

### 🔴 高风险 - 需要立即处理
1. **无限责任条款**
   - 问题: 与大学政策直接冲突
   - 行动: 必须协商修改为有限责任
   - 紧急度: 高（截止日期: 2025-10-20）

### 🟡 中风险 - 需要注意
2. **研究工具访问范围**
   - 问题: 如果范围太宽可能影响未来商业化
   - 行动: 明确列出具体工具和使用限制
   - 建议: 与技术转移办公室确认

### 🟢 低风险 - 标准处理
3. **NHMRC合规要求**
   - 行动: 确保协议符合NHMRC资助协议条款
   - 参考: NHMRC Grant Guidelines Section 5.2
```

### 5️⃣ **检查清单**

```markdown
## ✅ 协议审查检查清单

在与XYZ大学签署协议前，请确认：

### Background IP部分
- [ ] 大学保留所有研究工具的所有权
- [ ] 访问权限限制在"项目目的"
- [ ] 包含商业使用限制
- [ ] 包含第三方转让限制
- [ ] 如需物理材料转移，准备MTA

### Liability部分  
- [ ] 责任有明确上限（不超过$1M或资助额）
- [ ] 仅限直接损失
- [ ] 排除间接和后果性损失
- [ ] 包含不可抗力免责条款
- [ ] ❌ 确认无"无限责任"表述

### NHMRC合规
- [ ] 协议不违反NHMRC资助条款
- [ ] IP条款符合NHMRC IP政策
- [ ] 出版权利符合NHMRC要求
- [ ] 数据共享条款符合NHMRC要求
```

### 6️⃣ **下一步行动**

```markdown
## 🎯 建议的后续步骤

根据您的紧急截止日期（2025-10-20，还剩4天），建议：

### 立即行动（今天）
1. **审查现有协议草案**
   - 使用上述检查清单逐项检查
   - 标记所有不符合大学政策的条款

2. **准备修改建议**
   - 使用提供的推荐条款语言
   - 准备替代方案说明

### 24小时内
3. **与XYZ大学沟通**
   - 发送修改建议和理由
   - 说明大学政策要求（特别是责任上限）
   - 提供推荐的标准条款

4. **内部审批准备**
   - 如果时间紧迫，同时启动内部审批流程
   - 联系Legal Services: legal@university.edu.au

### 如需升级
如果XYZ大学不接受修改建议，请立即联系：
- **Health and Medical Grants Team**: grants-health@university.edu.au
- **电话**: +61 3 9035 5511
- **引用**: 提交编号 SR-20251016-001
```

### 7️⃣ **相关资源**

```markdown
## 📚 相关资源和文档

### 必读文档
1. **EAAC Grants Training Guide**
   - 第42-43页: Background IP政策
   - 第55-57页: Liability条款标准
   - 📄 [下载指南](link)

2. **NHMRC IP Policy**
   - NHMRC对背景IP和项目IP的要求
   - 🔗 [NHMRC官方文档](link)

### 协议模板
3. **Multi-Institutional Research Agreement Template**
   - 大学标准MIRA模板
   - 📄 [下载模板](link)

4. **Material Transfer Agreement Template**
   - 用于研究工具物理转移
   - 📄 [下载MTA模板](link)

### 联系人
- **Grants Team (Health and Medical)**: grants-health@university.edu.au
- **Legal Services**: legal@university.edu.au  
- **Technology Transfer Office**: tto@university.edu.au
```

---

## RAG在这个过程中做什么？

### 输入（用户的表单选择）
```json
{
  "grants-scheme": ["nhmrc"],
  "clause-type": ["background-ip", "liability"],
  "stage": "pre-award",
  "explanation": "需要审查合作协议，涉及研究工具访问和无限责任"
}
```

### RAG的工作流程

```
Step 1: 理解用户选择
→ 识别关键点: NHMRC + Background IP + Liability + 研究工具 + 无限责任

Step 2: 搜索相关指南内容
→ 从EAAC Guide检索:
   - Background IP章节
   - Liability章节  
   - NHMRC特定要求
   - 研究工具处理方式
   - 大学责任政策

Step 3: 生成结构化回复
→ 针对每个选择的条款类型生成建议
→ 识别风险点（无限责任）
→ 推荐协议类型
→ 提供检查清单
→ 制定行动计划
```

### 输出（完整的指导文档）
包含上述1-7所有部分的综合建议

---

## 总结：系统回复包含什么

### ❌ 不仅仅是
- "应该使用MIRA协议"

### ✅ 而是完整的指导包
1. **情况总结** - 确认理解用户情况
2. **针对每个条款的具体建议** - Background IP怎么处理、Liability怎么处理
3. **推荐协议类型和模板** - 应该用什么协议，为什么，模板在哪里
4. **风险识别** - 哪些地方有问题（如：无限责任不可接受）
5. **检查清单** - 逐项确认要点
6. **行动计划** - 具体的下一步（今天做什么，明天做什么）
7. **相关资源** - 需要查看的文档、联系人

---

## 为什么需要RAG？

### 如果用简单规则

```typescript
if (clauseType.includes("background-ip")) {
  return "Background IP应保留在大学，参考EAAC Guide第42页";
}
if (clauseType.includes("liability")) {
  return "责任应有上限，参考EAAC Guide第55页";
}
```

**问题：**
- ❌ 无法组合多个条款的建议
- ❌ 无法识别"无限责任"这种具体风险点
- ❌ 无法根据grants scheme调整建议
- ❌ 无法生成个性化的检查清单

### 使用RAG

```
RAG能够：
✓ 理解用户选择的组合（NHMRC + Background IP + Liability）
✓ 从指南中提取所有相关内容
✓ 识别用户说明中的关键词（"无限责任"）
✓ 生成针对性的综合建议
✓ 提供具体的条款语言
✓ 制定紧急行动计划（因为用户标记为urgent）
```

---

## 实现示例

```typescript
// API endpoint
POST /api/v1/guidance

// 请求
{
  "formAnswers": {
    "grants-scheme": ["nhmrc"],
    "clause-type": ["background-ip", "liability"],
    "explanation": "需要审查合作协议..."
  }
}

// 响应
{
  "summary": "您的NHMRC Pre-Award协议审查...",
  "clauseGuidance": {
    "background-ip": {
      "title": "Background IP条款建议",
      "recommendation": "...",
      "clauseTemplate": "...",
      "actions": [...]
    },
    "liability": {
      "title": "Liability条款建议", 
      "recommendation": "...",
      "riskLevel": "high",
      "clauseTemplate": "...",
      "actions": [...]
    }
  },
  "recommendedAgreementType": "Multi-Institutional Research Agreement",
  "risks": [...],
  "checklist": [...],
  "nextSteps": [...],
  "resources": [...]
}
```
