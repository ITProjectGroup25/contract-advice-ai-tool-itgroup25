# RAG模块实现指南

## 1. 目标

实现一个RAG系统，根据用户表单答案自动生成个性化合同指导。

输入：用户表单答案（13-37个问题）

输出：结构化的指导建议（格式由你设计）

---

## 2. 当前状态

已完成：
- API接口框架已创建
- 从数据库获取问题定义
- 构建问答上下文的函数
- 占位符响应

待实现：
- 向量数据库设置
- 文档嵌入生成
- 向量搜索功能
- LLM生成逻辑

---

## 3. 如何获取用户答案

### 函数签名

RAG模块接收一个参数对象：

```typescript
interface GuidanceParams {
  formAnswers: Record<string, any>;     // 用户答案字典
  questions: Array<{                    // 问题定义数组
    id: string;
    label: string;
    q_type: string;
  }>;
  formId?: string;
  submissionId?: string;
}

async function generateGuidance(params: GuidanceParams) {
  const { formAnswers, questions } = params;
  // 实现RAG逻辑
}
```

### 获取问答上下文

系统已提供 `buildContextFromQA` 函数，将问题和答案组合成文本：

```typescript
const userContext = buildContextFromQA(questions, formAnswers);

// userContext 格式：
// "Question: Your Name
//  Answer: Dr. Sarah Chen
//  
//  Question: Grants Scheme
//  Answer: NHMRC, ARC
//  
//  Question: What type of clause requires review?
//  Answer: Background IP, Liability
//  
//  Question: Please explain your request
//  Answer: 需要审查合作协议中的背景IP条款..."
```

### 示例数据

```typescript
// formAnswers 示例
{
  "q1": "Dr. Sarah Chen",
  "q2": "sarah@university.edu.au",
  "q5": ["nhmrc", "arc"],
  "q8": ["background-ip", "liability"],
  "q11": "需要审查合作协议中的背景IP条款...",
  "q12": "yes",
  "q13": "2025-10-20"
}

// questions 示例
[
  { id: "q1", label: "Your Name", q_type: "text" },
  { id: "q2", label: "Your Email", q_type: "email" },
  { id: "q5", label: "Grants Scheme", q_type: "checkbox-group" },
  { id: "q8", label: "What type of clause requires review?", q_type: "checkbox-group" },
  { id: "q11", label: "Please explain your request", q_type: "textarea" },
  { id: "q12", label: "Is there urgency?", q_type: "radio-group" },
  { id: "q13", label: "Deadline date", q_type: "date" }
]
```

---

## 4. 返回格式

你可以返回任何你设计的JSON结构。

建议包含的内容：

```typescript
return {
  // 你的自定义结构
  guidance: "生成的指导文本",
  sections: [
    {
      topic: "Background IP",
      recommendation: "...",
      sampleClause: "...",
      warnings: [...]
    }
  ],
  resources: [...],
  metadata: {
    ragEnabled: true
  }
};
```

当前占位符返回：

```typescript
return {
  userContext,              // 完整的问答文本
  questionsCount,           // 问题数量
  answersCount,             // 答案数量
  message: 'RAG not implemented yet. Implement your own response structure.'
};
```

---

## 5. 实现位置

文件：`frontend/src/app/api/v1/guidance/generate/route.ts`

第84-112行的 `generateGuidance` 函数：

```typescript
async function generateGuidance(params: GuidanceParams) {
  const { formAnswers, questions } = params;
  
  // 1. 构建问答上下文
  const userContext = buildContextFromQA(questions, formAnswers);
  
  // 2. TODO: 实现RAG逻辑
  // const relevantDocs = await vectorSearch(userContext);
  // const llmResponse = await generateWithLLM(userContext, relevantDocs);
  // 3. 返回你设计的结构
  
  return {
    // 你的返回结构
  };
}
```

---


