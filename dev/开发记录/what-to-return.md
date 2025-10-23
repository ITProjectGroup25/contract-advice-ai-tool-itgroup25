# 系统应该返回什么 - 简化说明

## 核心概念

这是一个**咨询建议系统**，不是协议生成系统。

用户来问：
> "我需要审查一个NHMRC合作协议，涉及Background IP和Liability条款，应该怎么办？"

系统不是生成一份协议给用户，而是**告诉用户怎么处理**。

---

## 系统返回的内容

### 1️⃣ **建议和指导** (主要内容)

```markdown
## Background IP条款 - 处理建议

### 你应该怎么做：
✓ 确保大学保留所有权
✓ 只授予有限的使用权
✓ 限制在"项目目的"范围内

### 推荐的条款应该这样写：
"Party A retains ownership of all Background IP. 
Party B is granted a non-exclusive license..."

### 注意事项：
- 避免"完全访问"这样的宽泛表述
- 禁止商业使用
- 禁止转让给第三方
```

### 2️⃣ **风险提示**

```markdown
## 需要注意的风险

🔴 高风险：无限责任
- 问题：与大学政策冲突
- 必须修改：设置责任上限

🟡 中风险：访问范围
- 问题：可能影响未来商业化
- 建议：明确列出具体工具
```

### 3️⃣ **参考资源** (包括模板链接)

```markdown
## 相关资源

📄 推荐使用：Multi-Institutional Research Agreement (MIRA)
   [下载模板](link-to-template)

📖 参考文档：
   - EAAC Guide 第42-43页：Background IP
   - EAAC Guide 第55-57页：Liability

📧 需要帮助联系：
   - Grants Team: grants@university.edu.au
```

### 4️⃣ **示例条款文本** (供参考)

```markdown
## 推荐条款语言

### Background IP条款示例：
```
Each party retains ownership of its Background IP. 
The University grants Collaborator a non-exclusive, 
royalty-free license to use Background IP solely 
for purposes of this Project.
```

### Liability条款示例：
```
Each party's liability is limited to direct damages 
only and capped at the lower of (a) grant amount 
or (b) AUD $1,000,000.
```

**注意：** 这些是示例条款，实际使用前请联系Legal Services审核
```

### 5️⃣ **行动检查清单**

```markdown
## 你需要做的事情

审查协议时检查：
- [ ] Background IP所有权归属大学
- [ ] 访问权限有明确限制
- [ ] 责任条款有上限设置
- [ ] 符合NHMRC资助要求

接下来的步骤：
1. 使用检查清单审查协议草案
2. 标记不符合的条款
3. 使用提供的示例条款提出修改建议
4. 如需要，联系grants团队协助
```

---

## 总结：返回什么

### ✅ 应该返回

1. **建议** - 告诉用户应该怎么做
2. **风险提示** - 哪些地方有问题
3. **示例条款** - 推荐的条款应该怎么写（供参考）
4. **模板链接** - 哪里可以下载标准模板
5. **检查清单** - 需要检查哪些点
6. **联系人** - 需要帮助找谁

### ❌ 不返回

1. ~~完整的协议文档~~ (不是协议生成器)
2. ~~可以直接签署的协议~~ (用户还需要Legal Services审核)
3. ~~法律意见~~ (这是指导，不是法律建议)

---

## 类比

### 像是：
🏥 **医生给你的就诊建议**
- 诊断：你的情况是什么
- 建议：应该怎么治疗
- 处方：吃什么药（条款示例）
- 注意事项：哪些要避免
- 复诊：如果不行找谁

### 不是：
❌ 直接给你做手术
❌ 直接给你配好的药

---

## 实际例子

### 用户表单
```json
{
  "grants-scheme": ["nhmrc"],
  "clause-type": ["background-ip"],
  "explanation": "合作方要求访问我们的研究工具"
}
```

### 系统返回 (简化版)

```json
{
  "guidanceType": "advisory",
  "summary": "NHMRC Background IP咨询",
  
  "recommendations": [
    {
      "topic": "Background IP",
      "advice": "大学应保留研究工具所有权，仅授予项目所需的有限访问权",
      "sampleClause": "Party A retains ownership...",
      "risks": ["避免转让所有权", "限制商业使用"],
      "actions": [
        "列出需要共享的具体工具",
        "明确'项目目的'的定义",
        "考虑签署MTA"
      ]
    }
  ],
  
  "recommendedResources": [
    {
      "type": "template",
      "title": "MIRA Template",
      "url": "/templates/mira.docx",
      "description": "标准多机构研究协议模板"
    },
    {
      "type": "guide",
      "title": "EAAC Guide",
      "url": "/guides/eaac-guide.pdf",
      "pages": "42-43",
      "description": "Background IP政策说明"
    }
  ],
  
  "checklist": [
    { "item": "确认大学保留所有权", "category": "ownership" },
    { "item": "访问权限限制在项目范围", "category": "access" },
    { "item": "禁止商业使用", "category": "restrictions" }
  ],
  
  "nextSteps": [
    "审查协议草案，使用检查清单",
    "标记需要修改的条款",
    "如需协助，联系grants团队"
  ],
  
  "contacts": [
    {
      "team": "Grants Team",
      "email": "grants@university.edu.au"
    }
  ]
}
```

---

## RAG的作用

RAG帮助生成上述内容中的：

1. **"advice"字段** - 从指南中检索相关建议
2. **"sampleClause"字段** - 从模板库中检索示例条款
3. **"risks"字段** - 基于政策识别风险点
4. **个性化组合** - 根据用户选择的条款类型组合建议

### 不是：
- ❌ 生成完整的法律协议文档
- ❌ 替代律师的法律意见

### 而是：
- ✅ 提供基于政策和指南的建议
- ✅ 给出示例条款供参考
- ✅ 指导用户自己审查协议
- ✅ 告知何时需要升级到人工

---

## 用户体验流程

```
用户填写表单
   ↓
提交
   ↓
系统返回【建议指导】
   ↓
用户阅读建议
   ↓
用户自己审查协议草案
   ↓
用户使用示例条款提出修改
   ↓
(如果复杂) 联系grants团队协助
   ↓
Legal Services最终审核
   ↓
签署协议
```

系统只是**第一步的自助指导**，不是最终的协议生成。

---

## 简单总结

### 返回内容 = 咨询报告

包含：
- 📋 你的情况分析
- 💡 处理建议
- ⚠️ 风险提示
- 📝 示例条款（供参考）
- 📄 模板链接（去哪下载）
- ✅ 检查清单
- 📞 联系人（需要帮助找谁）

**核心：告诉用户"应该怎么做"，而不是"直接给你做好"**
