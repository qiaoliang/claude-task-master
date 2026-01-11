# FAQ - 常见问题解答

## 目录

- [模型配置](#模型配置)
  - [如何配置直接使用自己的大模型，而不是经过其他服务的中转？](#如何配置直接使用自己的大模型而不是经过其他服务的中转)
- [安装与设置](#安装与设置)
  - [如何从源代码构建并安装到本地？](#如何从源代码构建并安装到本地)
  - [如何设置自己的大模型服务并使用源代码在本地执行？](#如何设置自己的大模型服务并使用源代码在本地执行)
- [使用与操作](#使用与操作)
- [故障排除](#故障排除)
- [高级配置](#高级配置)

---

## 模型配置

### 如何配置直接使用自己的大模型，而不是经过其他服务的中转？

Task Master AI 支持多种方式直接使用自己的大模型，而不经过其他服务中转。以下是几种配置方式：

#### 1. Ollama（本地模型）- 推荐用于完全本地化

Ollama 允许你在本地运行开源大模型，完全不需要 API 密钥。

**配置步骤：**

```bash
# 1. 安装 Ollama
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# 2. 下载并运行模型
ollama pull qwen3:latest
ollama pull llama3.3:latest

# 3. 启动 Ollama 服务
ollama serve
```

**在 Task Master 中配置：**

编辑 `.taskmaster/config.json`：

```json
{
  "models": {
    "main": {
      "provider": "ollama",
      "modelId": "qwen3:latest",
      "maxTokens": 8192,
      "temperature": 0.7
    },
    "research": {
      "provider": "ollama",
      "modelId": "llama3.3:latest",
      "maxTokens": 8192,
      "temperature": 0.5
    },
    "fallback": {
      "provider": "ollama",
      "modelId": "qwen3:latest",
      "maxTokens": 8192,
      "temperature": 0.7
    }
  },
  "global": {
    "ollamaBaseURL": "http://localhost:11434/api"
  }
}
```

**环境变量（可选）：**

```bash
# .env 文件
OLLAMA_API_KEY=your-key-here  # 可以是任意值，Ollama 不实际使用
```

#### 2. OpenAI 兼容 API - 用于自定义端点

如果你有自己的 OpenAI 兼容 API 服务（如 vLLM、Text Generation WebUI、LocalAI 等），可以使用 `openai-compatible` 提供商。

**配置示例：**

```json
{
  "models": {
    "main": {
      "provider": "openai-compatible",
      "modelId": "your-model-name",
      "maxTokens": 8192,
      "temperature": 0.7,
      "baseURL": "http://your-custom-endpoint:8000/v1"
    }
  }
}
```

**环境变量：**

```bash
# .env 文件
OPENAI_COMPATIBLE_API_KEY=your-api-key-if-needed
```

#### 3. LM Studio - 本地 GUI 模型服务器

LM Studio 提供本地模型服务，支持 OpenAI 兼容 API。

**配置步骤：**

```bash
# 1. 下载并安装 LM Studio
# 2. 在 LM Studio 中下载模型
# 3. 启动本地服务器（默认端口 1234）
```

**配置：**

```json
{
  "models": {
    "main": {
      "provider": "lmstudio",
      "modelId": "your-model-name",
      "maxTokens": 8192,
      "temperature": 0.7
    }
  },
  "global": {
    "lmstudioBaseURL": "http://localhost:1234/v1"
  }
}
```

#### 4. 自定义 OpenAI 兼容提供商

如果你需要添加自己的 OpenAI 兼容服务，可以基于 `OpenAICompatibleProvider` 类创建自定义提供商。

**示例代码（需要添加到项目中）：**

```javascript
// src/ai-providers/my-custom-provider.js
import { OpenAICompatibleProvider } from './openai-compatible.js';

export class MyCustomProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: 'MyCustomProvider',
      apiKeyEnvVar: 'MY_CUSTOM_API_KEY',
      requiresApiKey: true,
      defaultBaseURL: 'http://localhost:8000/v1',
      supportsStructuredOutputs: true
    });
  }
}
```

#### 5. 使用命令行配置模型

```bash
# 设置主模型
node dist/task-master.js models --set-main ollama/qwen3:latest

# 设置研究模型
node dist/task-master.js models --set-research ollama/llama3.3:latest

# 设置备用模型
node dist/task-master.js models --set-fallback ollama/qwen3:latest

# 交互式配置
node dist/task-master.js models --setup
```

#### 支持的本地模型

Task Master 支持以下本地模型：

**Ollama 模型：**
- `gpt-oss:latest` (SWE Score: 0.607)
- `gpt-oss:20b` (SWE Score: 0.607)
- `gpt-oss:120b` (SWE Score: 0.624)
- `qwen3:latest`, `qwen3:14b`, `qwen3:32b`
- `llama3.3:latest`
- `phi4:latest`
- `mistral-small3.1:latest`
- `devstral:latest`

#### 完整配置示例

创建 `.taskmaster/config.json`：

```json
{
  "models": {
    "main": {
      "provider": "ollama",
      "modelId": "qwen3:32b",
      "maxTokens": 16384,
      "temperature": 0.7
    },
    "research": {
      "provider": "ollama",
      "modelId": "llama3.3:latest",
      "maxTokens": 8192,
      "temperature": 0.5
    },
    "fallback": {
      "provider": "ollama",
      "modelId": "qwen3:latest",
      "maxTokens": 8192,
      "temperature": 0.7
    }
  },
  "global": {
    "ollamaBaseURL": "http://localhost:11434/api",
    "logLevel": "info",
    "debug": false
  }
}
```

#### 验证配置

```bash
# 查看当前模型配置
node dist/task-master.js models

# 测试连接
node dist/task-master.js list
```

这样配置后，Task Master 将直接使用你的本地模型（Ollama）或自定义 API 端点，不会经过任何第三方服务中转。

---

## 安装与设置

### 如何从源代码构建并安装到本地？

如果你想要从源代码构建 Task Master 并在本地使用，请按照以下步骤操作：

#### 前置要求

- **Node.js >= 20.0.0**（必需）
- **npm 10.9.2**（推荐）
- **Git**（用于克隆仓库）

#### 方式一：克隆仓库并本地构建

**1. 克隆仓库**

```bash
# 克隆仓库
git clone https://github.com/eyaltoledano/claude-task-master.git

# 进入项目目录
cd claude-task-master
```

**2. 安装依赖**

```bash
# 安装所有依赖（包括工作区依赖）
npm install
```

**3. 构建项目**

```bash
# 构建所有包
npm run build

# 或使用 Turbo 进行更快的构建
npm run turbo:build
```

**4. 配置环境变量**

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，添加至少一个 API 密钥
# 你需要至少 ONE of: ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY, etc.
```

**5. 本地运行**

```bash
# 直接运行构建后的 CLI
node dist/task-master.js init

# 或者使用 npx（如果已全局链接）
npx task-master init
```

**6. 全局安装（可选）**

```bash
# 在项目根目录下，全局链接
npm link

# 现在可以在任何地方使用
task-master init
task-master list
task-master next
```

#### 方式二：开发模式运行

如果你想要在开发过程中实时看到更改：

```bash
# 使用监视模式运行（自动重新构建）
npm run dev

# 或使用 Turbo 开发模式
npm run turbo:dev
```

#### 方式三：全局安装 npm 包

如果你不想从源代码构建，可以直接安装已发布的包：

```bash
# 全局安装
npm install -g ztm-ai

# 或者在项目中本地安装
npm install ztm-ai

# 使用 npx 运行
npx task-master init
```

#### 验证安装

```bash
# 检查版本
task-master --version

# 或
node dist/task-master.js --version

# 查看帮助
task-master --help

# 测试基本功能
task-master list
```

#### 常用构建命令

```bash
# 完整构建
npm run build

# 仅构建特定工作区
npm run build -w @tm/core
npm run build -w @tm/cli
npm run build -w @tm/mcp

# 类型检查
npm run turbo:typecheck

# 代码格式化
npm run format

# 代码检查
biome check .

# 运行测试
npm test
npm run test:unit
npm run test:integration
```

#### 项目结构说明

构建后的主要文件：

- `dist/task-master.js` - CLI 可执行文件
- `dist/mcp-server.js` - MCP 服务器文件
- `apps/cli/` - CLI 应用源代码
- `apps/mcp/` - MCP 服务器源代码
- `packages/tm-core/` - 核心业务逻辑
- `packages/tm-bridge/` - 桥接层

#### 故障排除

**构建失败：**

```bash
# 清理缓存和重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

**类型错误：**

```bash
# 运行类型检查
npm run turbo:typecheck
```

**依赖问题：**

```bash
# 检查依赖
npm run deps:check

# 修复依赖
npm run deps:fix
```

#### 开发工作流建议

1. **使用开发模式**：运行 `npm run dev` 以获得自动重新构建
2. **运行测试**：在更改后运行 `npm test` 确保没有破坏任何功能
3. **类型检查**：提交前运行 `npm run turbo:typecheck`
4. **代码格式化**：使用 `npm run format` 保持代码风格一致

#### 更新到最新版本

如果你是从源代码构建的：

```bash
# 拉取最新更改
git pull origin main

# 重新构建
npm run build

# 重新链接（如果使用了 npm link）
npm link
```

如果你使用 npm 安装的：

```bash
# 更新到最新版本
npm update -g ztm-ai
```

### 如何设置自己的大模型服务并使用源代码在本地执行？

这是一个完整的端到端指南，教你如何设置自己的大模型服务（使用 Ollama）并从源代码运行 Task Master。

#### 完整步骤概览

1. 安装和配置 Ollama 本地模型服务
2. 克隆并构建 Task Master 源代码
3. 配置 Task Master 使用本地 Ollama
4. 初始化并使用 Task Master

#### 步骤 1：安装和配置 Ollama

**安装 Ollama：**

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 从 https://ollama.com/download 下载安装程序
```

**下载模型：**

```bash
# 下载推荐的开源模型
ollama pull qwen3:latest          # 通义千问 3（推荐）
ollama pull llama3.3:latest       # Llama 3.3
ollama pull phi4:latest           # Phi 4

# 查看已下载的模型
ollama list
```

**启动 Ollama 服务：**

```bash
# 启动服务（默认在后台运行）
ollama serve

# 验证服务是否运行
curl http://localhost:11434/api/tags
```

**测试模型：**

```bash
# 测试模型是否工作
ollama run qwen3:latest "你好，请用中文回答：什么是人工智能？"
```

#### 步骤 2：克隆并构建 Task Master

**克隆仓库：**

```bash
# 克隆 Task Master 仓库
git clone https://github.com/eyaltoledano/claude-task-master.git

# 进入项目目录
cd claude-task-master
```

**安装依赖：**

```bash
# 安装所有依赖
npm install
```

**构建项目：**

```bash
# 构建所有包
npm run build

# 验证构建是否成功
ls -la dist/task-master.js
```

#### 步骤 3：配置 Task Master 使用本地 Ollama

**创建配置目录：**

```bash
# Task Master 会在首次运行时自动创建 .taskmaster 目录
# 但我们可以先创建配置文件
```

**创建配置文件 `.taskmaster/config.json`：**

```json
{
  "models": {
    "main": {
      "provider": "ollama",
      "modelId": "qwen3:latest",
      "maxTokens": 8192,
      "temperature": 0.7
    },
    "research": {
      "provider": "ollama",
      "modelId": "llama3.3:latest",
      "maxTokens": 8192,
      "temperature": 0.5
    },
    "fallback": {
      "provider": "ollama",
      "modelId": "qwen3:latest",
      "maxTokens": 8192,
      "temperature": 0.7
    }
  },
  "global": {
    "ollamaBaseURL": "http://localhost:11434/api",
    "logLevel": "info",
    "debug": false,
    "defaultNumTasks": 10,
    "defaultSubtasks": 5,
    "defaultPriority": "medium",
    "responseLanguage": "Chinese"
  }
}
```

**创建环境变量文件 `.env`：**

```bash
# .env 文件
# Ollama 不需要真实的 API 密钥，但需要一个占位符
OLLAMA_API_KEY=ollama-local

# 如果将来需要其他提供商，可以添加：
# ANTHROPIC_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here
```

#### 步骤 4：初始化并使用 Task Master

**初始化项目：**

```bash
# 使用源代码构建的版本初始化
node dist/task-master.js init

# 按照提示输入项目信息
# - 项目名称
# - 项目描述
# - 技术栈
```

**验证配置：**

```bash
# 查看当前模型配置
node dist/task-master.js models

# 应该显示：
# Main: ollama/qwen3:latest
# Research: ollama/llama3.3:latest
# Fallback: ollama/qwen3:latest
```

**创建 PRD（产品需求文档）：**

```bash
# 创建 PRD 文件
mkdir -p .taskmaster/docs
cat > .taskmaster/docs/prd.md << 'EOF'
# 项目需求文档

## 项目概述
这是一个示例项目，演示如何使用 Task Master 管理开发任务。

## 功能需求
1. 用户认证系统
2. 数据库集成
3. API 接口开发
4. 前端界面

## 技术栈
- 后端: Node.js + Express
- 数据库: PostgreSQL
- 前端: React
EOF
```

**解析 PRD 并生成任务：**

```bash
# 解析 PRD 文件
node dist/task-master.js parse-prd .taskmaster/docs/prd.md

# 查看生成的任务
node dist/task-master.js list

# 获取下一个任务
node dist/task-master.js next

# 查看特定任务详情
node dist/task-master.js show 1
```

**全局链接（可选）：**

```bash
# 全局链接，方便在任何目录使用
npm link

# 现在可以直接使用命令
task-master list
task-master next
task-master show 1
```

#### 步骤 5：配置 MCP 集成（可选）

如果你想在 Cursor、VS Code 等 IDE 中使用：

**创建 `.mcp.json` 文件：**

```json
{
  "mcpServers": {
    "ztm-ai": {
      "command": "node",
      "args": ["/Users/qiaoliang/working/code/claude-task-master/dist/mcp-server.js"],
      "env": {
        "TASK_MASTER_TOOLS": "all",
        "OLLAMA_API_KEY": "ollama-local"
      }
    }
  }
}
```

**在 IDE 中使用：**

1. 重启你的 IDE（Cursor、VS Code 等）
2. 在 AI 聊天中输入："Initialize taskmaster-ai in my project"
3. 开始使用 Task Master 管理任务

#### 验证完整设置

**运行完整测试：**

```bash
# 1. 检查 Ollama 服务
curl http://localhost:11434/api/tags

# 2. 检查 Task Master 构建
node dist/task-master.js --version

# 3. 检查模型配置
node dist/task-master.js models

# 4. 初始化测试项目
mkdir -p /tmp/test-taskmaster
cd /tmp/test-taskmaster
node /Users/qiaoliang/working/code/claude-task-master/dist/task-master.js init

# 5. 创建测试 PRD
cat > .taskmaster/docs/prd.md << 'EOF'
# 测试项目
创建一个简单的待办事项应用。
EOF

# 6. 解析 PRD
node /Users/qiaoliang/working/code/claude-task-master/dist/task-master.js parse-prd .taskmaster/docs/prd.md

# 7. 查看任务
node /Users/qiaoliang/working/code/claude-task-master/dist/task-master.js list
```

#### 常见问题排查

**Ollama 服务未运行：**

```bash
# 检查 Ollama 是否运行
ps aux | grep ollama

# 如果没有运行，启动它
ollama serve
```

**Task Master 无法连接到 Ollama：**

```bash
# 检查 Ollama API 是否可访问
curl http://localhost:11434/api/tags

# 检查配置文件
cat .taskmaster/config.json

# 确保 ollamaBaseURL 正确
```

**模型下载失败：**

```bash
# 重新下载模型
ollama pull qwen3:latest

# 查看下载进度
ollama pull qwen3:latest --verbose
```

**构建失败：**

```bash
# 清理并重新构建
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

#### 性能优化建议

**1. 选择合适的模型大小：**

```json
{
  "models": {
    "main": {
      "provider": "ollama",
      "modelId": "qwen3:14b",  // 使用较小的模型以提高速度
      "maxTokens": 4096,       // 减少 token 数量
      "temperature": 0.7
    }
  }
}
```

**2. 启用 Ollama GPU 加速：**

```bash
# 确保 Ollama 使用 GPU（如果有）
# Ollama 会自动检测并使用可用的 GPU
```

**3. 调整并发设置：**

```json
{
  "global": {
    "logLevel": "warn",  // 减少日志输出
    "debug": false
  }
}
```

#### 下一步

现在你已经成功设置了自己的大模型服务并从源代码运行 Task Master，你可以：

1. 创建你的项目 PRD
2. 使用 Task Master 解析并生成任务
3. 开始使用 Task Master 管理你的开发工作流
4. 在 IDE 中通过 MCP 集成使用 Task Master

更多信息请参考：
- [完整文档](https://docs.task-master.dev)
- [命令参考](./command-reference.md)
- [教程](./tutorial.md)

---

## 使用与操作

<!-- 此部分保留用于将来的 FAQ 条目 -->

---

## 故障排除

<!-- 此部分保留用于将来的 FAQ 条目 -->

---

## 高级配置

<!-- 此部分保留用于将来的 FAQ 条目 -->