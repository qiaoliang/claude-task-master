# Task Master AI - Agent Integration Guide

## 项目概述

Task Master AI 是一个专为 AI 驱动开发设计的任务管理系统，旨在与 Claude Code、Cursor 等 AI 编辑器无缝集成。系统通过 MCP (Model Control Protocol) 协议提供强大的任务管理功能，支持从 PRD（产品需求文档）解析到任务生成、执行和跟踪的完整工作流程。

### 核心技术栈

- **语言**: TypeScript/JavaScript (ES Modules)
- **运行时**: Node.js >= 20.0.0
- **架构**: Monorepo (使用 npm workspaces)
- **构建工具**: tsdown, Turbo
- **测试框架**: Vitest, Jest
- **代码质量**: Biome (格式化 + linting)
- **包管理**: npm 10.9.2
- **AI SDK**: Vercel AI SDK (支持多个 AI 提供商)

### 支持的 AI 提供商

- Anthropic (Claude)
- OpenAI (GPT)
- Google (Gemini)
- Perplexity (研究模型)
- xAI (Grok)
- OpenRouter
- Mistral
- Azure OpenAI
- Ollama
- Claude Code CLI (无需 API key)
- Codex CLI

## 项目结构

```
claude-task-master/
├── apps/                          # 应用程序
│   ├── cli/                       # CLI 应用程序
│   ├── mcp/                       # MCP 服务器应用
│   ├── docs/                      # 文档站点 (Mintlify)
│   └── extension/                 # VS Code 扩展 (未来)
├── packages/                      # 共享包
│   ├── tm-core/                   # 核心业务逻辑
│   ├── tm-bridge/                 # 桥接层
│   ├── tm-profiles/               # 配置文件
│   ├── build-config/              # 构建配置
│   ├── claude-code-plugin/        # Claude Code 插件
│   └── ai-sdk-provider-grok-cli/  # Grok AI SDK 提供商
├── src/                           # 根目录源代码
│   ├── task-master.js            # 路径管理核心
│   ├── ai-providers/             # AI 提供商集成
│   ├── constants/                # 常量定义
│   ├── profiles/                 # 配置文件
│   ├── progress/                 # 进度跟踪
│   ├── prompts/                  # AI 提示词
│   ├── provider-registry/        # 提供商注册
│   ├── schemas/                  # 数据模式
│   ├── telemetry/                # 遥测数据
│   ├── ui/                       # UI 组件
│   └── utils/                    # 工具函数
├── mcp-server/                    # MCP 服务器入口
│   ├── server.js                 # MCP 服务器启动文件
│   └── src/                      # MCP 实现代码
├── bin/                           # 可执行文件
│   └── task-master.js            # CLI 入口点
├── tests/                         # 测试文件
│   ├── unit/                     # 单元测试
│   ├── integration/              # 集成测试
│   ├── e2e/                      # 端到端测试
│   ├── manual/                   # 手动测试
│   └── fixtures/                 # 测试固件
├── .taskmaster/                   # Task Master 配置目录
│   ├── CLAUDE.md                 # Claude Code 集成指南
│   ├── config.json               # AI 模型配置
│   ├── state.json                # 项目状态
│   ├── docs/                     # 文档目录
│   ├── reports/                  # 分析报告
│   ├── tasks/                    # 任务数据
│   └── templates/                # 模板文件
├── .claude/                       # Claude Code 配置
│   └── commands/                 # 自定义命令
├── .cursor/                       # Cursor IDE 配置
│   ├── commands/                 # 自定义命令
│   └── rules/                    # IDE 规则
├── docs/                          # 项目文档
├── assets/                        # 资源文件
├── scripts/                       # 脚本工具
└── context/                       # 上下文文档
```

## 架构原则

### 业务逻辑分离

**核心规则**：所有业务逻辑必须位于 `@tm/core` 包中，而不是在表现层。

- **`@tm/core`** (`packages/tm-core/`)
  - 包含所有业务逻辑、领域模型、服务和工具
  - 通过领域对象（tasks、auth、workflow、git、config）提供清晰的门面 API
  - 处理所有复杂性：解析、验证、转换、计算等
  - 示例：任务 ID 解析、子任务提取、状态验证、依赖解析

- **`@tm/cli`** (`apps/cli/`)
  - 仅作为薄表现层
  - 调用 tm-core 方法并显示结果
  - 处理 CLI 特定关注点：参数解析、输出格式化、用户提示
  - **不包含**业务逻辑、数据转换、计算

- **`@tm/mcp`** (`apps/mcp/`)
  - 仅作为薄表现层
  - 调用 tm-core 方法并返回 MCP 格式化的响应
  - 处理 MCP 特定关注点：工具模式、参数验证、响应格式化
  - **不包含**业务逻辑、数据转换、计算

### 代码质量原则

- **DRY (Don't Repeat Yourself)**：将出现 2 次以上的模式提取为可重用组件或工具
- **YAGNI (You Aren't Gonna Need It)**：不要过度设计。在重复出现时创建抽象，而不是之前
- **可维护性**：单一真实来源。更改一次，更新所有地方
- **可读性**：清晰的命名、适当的结构、从索引文件导出
- **灵活性**：接受具有合理默认值的配置选项

## 构建和运行

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
# 构建所有包
npm run build

# 使用 Turbo 构建
npm run turbo:build

# 开发模式（监视更改）
npm run dev

# Turbo 开发模式
npm run turbo:dev
```

### 运行测试

```bash
# 运行所有测试
npm test

# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 端到端测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage

# 持续集成测试
npm run test:ci

# 监视模式
npm run test:watch
```

### 代码质量检查

```bash
# 格式化代码
npm run format

# 检查格式
npm run format-check

# Lint 检查
biome check .

# Lint 修复
biome check . --write

# 类型检查
npm run turbo:typecheck
```

### 运行 CLI

```bash
# 全局安装后
task-master <command>

# 本地运行
npx task-master <command>

# 或使用 node
node dist/task-master.js <command>
```

### 运行 MCP 服务器

```bash
# 直接运行
npm run mcp-server

# 使用 MCP Inspector
npm run inspector
```

### 特定包操作

```bash
# 在特定工作区中运行命令
npm run <command> -w @tm/core
npm run <command> -w @tm/cli
npm run <command> -w @tm/mcp

# 示例：测试核心包
npm run test -w @tm/core

# 示例：构建 CLI
npm run build -w @tm/cli
```

## 核心命令

### 项目设置

```bash
task-master init                    # 初始化 Task Master
task-master parse-prd <path>        # 从 PRD 生成任务
task-master models --setup          # 交互式配置 AI 模型
```

### 日常开发工作流

```bash
task-master list                    # 显示所有任务
task-master next                    # 获取下一个可用任务
task-master show <id>               # 查看任务详情（支持多个 ID：1,3,5）
task-master set-status --id=<id> --status=done  # 标记任务完成
```

### 任务管理

```bash
task-master add-task --prompt="description" --research  # 添加新任务
task-master expand --id=<id> --research --force          # 将任务分解为子任务
task-master update-task --id=<id> --prompt="changes"     # 更新特定任务
task-master update --from=<id> --prompt="changes"        # 从 ID 开始更新多个任务
task-master update-subtask --id=<id> --prompt="notes"    # 添加实现笔记到子任务
```

### 分析和规划

```bash
task-master analyze-complexity --research    # 分析任务复杂度
task-master complexity-report                # 查看复杂度分析
task-master expand --all --research          # 展开所有符合条件的任务
```

### 依赖和组织

```bash
task-master add-dependency --id=<id> --depends-on=<id>   # 添加任务依赖
task-master move --from=<id> --to=<id>                   # 重新组织任务层次结构
task-master validate-dependencies                        # 检查依赖问题
```

### 标签管理

```bash
# 跨标签移动任务
task-master move --from=5 --from-tag=backlog --to-tag=in-progress
task-master move --from=5,6,7 --from-tag=backlog --to-tag=done --with-dependencies
task-master move --from=5 --from-tag=backlog --to-tag=in-progress --ignore-dependencies
```

### 研究

```bash
task-master research "查询内容"  # 研究最新信息
```

## 关键文件说明

### 核心配置文件

- **`.taskmaster/tasks/tasks.json`** - 主任务数据文件（自动管理）
- **`.taskmaster/config.json`** - AI 模型配置（使用 `task-master models` 修改）
- **`.taskmaster/state.json`** - 项目状态（当前标签等）
- **`.taskmaster/docs/prd.md`** - 产品需求文档（推荐使用 `.md` 扩展名）
- **`.env`** - API 密钥（CLI 使用）

### 集成文件

- **`CLAUDE.md`** - Claude Code 自动加载的上下文
- **`.claude/settings.json`** - Claude Code 工具允许列表和首选项
- **`.claude/commands/`** - 自定义斜杠命令
- **`.mcp.json`** - MCP 服务器配置（项目特定）

### PRD 文件格式

虽然 `.txt` 和 `.md` 扩展名都可以使用，但**推荐使用 `.md`**，因为：
- 编辑器中的 Markdown 语法高亮提高了可读性
- 在 VS Code、GitHub 或其他工具中预览时正确渲染
- 通过格式化文档实现更好的协作

## MCP 集成

### MCP 配置

在 `.mcp.json` 中配置：

```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "TASK_MASTER_TOOLS": "core",
        "ANTHROPIC_API_KEY": "your_key_here",
        "PERPLEXITY_API_KEY": "your_key_here",
        "OPENAI_API_KEY": "OPENAI_API_KEY_HERE",
        "GOOGLE_API_KEY": "GOOGLE_API_KEY_HERE",
        "XAI_API_KEY": "XAI_API_KEY_HERE",
        "OPENROUTER_API_KEY": "OPENROUTER_API_KEY_HERE",
        "MISTRAL_API_KEY": "MISTRAL_API_KEY_HERE",
        "AZURE_OPENAI_API_KEY": "AZURE_OPENAI_API_KEY_HERE",
        "OLLAMA_API_KEY": "OLLAMA_API_KEY_HERE"
      }
    }
  }
}
```

### MCP 工具层级

Task Master 使用分层工具加载来优化上下文窗口使用：

| 层级 | 工具数 | 用例 |
|------|--------|------|
| `core` | 7 | 最小日常工作流工具（默认） |
| `standard` | 14 | 常见任务管理 |
| `all` | 44+ | 完整套件，包括研究、自动驾驶、依赖 |

**核心工具（7 个）**：`get_tasks`, `next_task`, `get_task`, `set_task_status`, `update_subtask`, `parse_prd`, `expand_task`

**标准工具（额外 7 个）**：`initialize_project`, `analyze_project_complexity`, `expand_all`, `add_subtask`, `remove_task`, `add_task`, `complexity_report`

**所有层级工具**：依赖管理、标签管理、研究、自动驾驶 TDD 工作流、范围调整、模型、规则

**升级层级**：在 `.mcp.json` 中将 `TASK_MASTER_TOOLS` 从 `"core"` 更改为 `"standard"` 或 `"all"`，然后重启 MCP 连接。

### 核心 MCP 工具映射

```javascript
help; // = 显示可用的 taskmaster 命令

// 项目设置
initialize_project; // = task-master init
parse_prd; // = task-master parse-prd

// 日常工作流
get_tasks; // = task-master list
next_task; // = task-master next
get_task; // = task-master show <id>
set_task_status; // = task-master set-status

// 任务管理
add_task; // = task-master add-task
expand_task; // = task-master expand
update_task; // = task-master update-task
update_subtask; // = task-master update-subtask
update; // = task-master update

// 分析
analyze_project_complexity; // = task-master analyze-complexity
complexity_report; // = task-master complexity-report
```

## 开发约定

### 测试指南

#### 测试文件放置

- **包和测试**：放置在 `packages/<package-name>/src/<module>/<file>.spec.ts` 或 `apps/<app-name>/src/<module>/<file.spec.ts>`，与源代码并列
- **包集成测试**：放置在 `packages/<package-name>/tests/integration/<module>/<file>.test.ts` 或 `apps/<app-name>/tests/integration/<module>/<file>.test.ts`，与源代码并列
- **隔离的单元测试**：仅在无法并行放置时使用 `tests/unit/packages/<package-name>/`
- **测试扩展**：始终对 TypeScript 测试使用 `.ts`，从不使用 `.js`

#### 同步测试

- **除非测试实际的异步操作，否则不要在测试函数中使用 async/await**
- 使用同步顶级导入而不是动态 `await import()`
- 测试主体应尽可能同步

示例：

```typescript
// ✅ 正确 - 使用 .ts 扩展名的同步导入
import { MyClass } from '../src/my-class.js';

it('should verify behavior', () => {
  expect(new MyClass().property).toBe(value);
});

// ❌ 错误 - 异步导入
it('should verify behavior', async () => {
  const { MyClass } = await import('../src/my-class.js');
  expect(new MyClass().property).toBe(value);
});
```

#### 何时编写测试

**始终为以下内容编写测试**：

- **Bug 修复**：添加一个可以捕获 bug 的回归测试
- **业务逻辑**：复杂计算、验证、转换
- **边缘情况**：边界条件、错误处理、null/undefined 情况
- **公共 API**：其他代码依赖的方法
- **集成点**：数据库、文件系统、外部 API

**跳过测试**：

- 简单的 getter/setter：`getX() { return this.x; }`
- 没有逻辑的简单传递函数
- 纯配置对象
- 只是委托给另一个已测试函数的代码

#### 测试指南

**原则**：FIRST（快速、独立、可重复、自验证、及时）
**结构**：AAA（安排、执行、断言）
**覆盖率**：Right-BICEP（正确结果、边界、反向、交叉检查、错误条件、性能）

#### 要模拟的内容

**单元测试**（`.spec.ts` - 隔离测试单个单元）：
- **@tm/core**：仅模拟外部 I/O（Supabase、API、文件系统）。使用真实的内部服务。
- **apps/cli**：模拟 tm-core 响应。使用真实的 Commander/chalk/inquirer/其他 npm 包（测试显示逻辑）。
- **apps/mcp**：模拟 tm-core 响应。使用真实的 MCP 框架（测试响应格式化）。

**集成测试**（`tests/integration/` - 一起测试多个单元）：
- **所有包**：使用真实的 tm-core，仅模拟外部边界（API、数据库、文件系统）。

**从不模拟**：
- 同一包中的内部工具/助手
- 标准框架（Commander、Express）- 让它们运行
- 标准库

**经验法则**：模拟你**不**测试的内容。CLI 单元测试测试显示 → 模拟 tm-core。核心单元测试测试逻辑 → 模拟 I/O。集成测试测试完整流程 → 仅模拟外部 API。

**危险信号**：在单元测试中模拟 3 个以上依赖意味着代码做得太多或在错误的层。

**反模式**：大量模拟的测试不验证真实行为——它们验证你是否正确连接了模拟。你最终编写编排代码来满足测试，而不是验证实际实现的测试。如果测试很难，将逻辑移动到自然可测试的地方。

### 文档指南

- **文档位置**：在 `apps/docs/`（Mintlify 站点源）中编写文档，而不是 `docs/`
- **文档 URL**：在 <https://docs.task-master.dev> 引用文档，而不是本地文件路径

### Changeset 指南

- **为代码更改添加 changeset** - 在进行代码更改后运行 `npx changeset`（文档仅 PR 不需要）
- 创建 changeset 时，请记住它是面向用户的，这意味着我们不必深入了解代码的细节，而是提到用户从这个 changeset 中获得或修复了什么
- 推送前运行 `npm run turbo:typecheck` 以确保 TypeScript 类型检查通过
- 运行 `npm run test -w <package-name>` 来测试包

### Git 工作流

```bash
# 查看状态
git status

# 查看更改
git diff HEAD

# 提交更改（使用有意义的提交消息）
git commit -m "feat: 添加新功能"

# 推送到远程
git push
```

## 任务结构和 ID

### 任务 ID 格式

- 主任务：`1`, `2`, `3` 等
- 子任务：`1.1`, `1.2`, `2.1` 等
- 子子任务：`1.1.1`, `1.1.2` 等

### 任务状态值

- `pending` - 准备工作
- `in-progress` - 正在工作中
- `done` - 已完成并验证
- `deferred` - 已推迟
- `cancelled` - 不再需要
- `blocked` - 等待外部因素

### 任务字段

```json
{
  "id": "1.2",
  "title": "实现用户认证",
  "description": "设置基于 JWT 的认证系统",
  "status": "pending",
  "priority": "high",
  "dependencies": ["1.1"],
  "details": "使用 bcrypt 进行哈希，JWT 用于令牌...",
  "testStrategy": "认证函数的单元测试，登录流的集成测试",
  "subtasks": []
}
```

## Claude Code 最佳实践

### 上下文管理

- 在不同任务之间使用 `/clear` 以保持专注
- 此 CLAUDE.md 文件自动加载上下文
- 需要时使用 `task-master show <id>` 拉取特定任务上下文

### 迭代实现

1. `task-master show <subtask-id>` - 了解需求
2. 探索代码库并计划实现
3. `task-master update-subtask --id=<id> --prompt="详细计划"` - 记录计划
4. `task-master set-status --id=<id> --status=in-progress` - 开始工作
5. 按照记录的计划实现代码
6. `task-master update-subtask --id=<id> --prompt="什么有效/无效"` - 记录进度
7. `task-master set-status --id=<id> --status=done` - 完成任务

### 复杂工作流与清单

对于大型迁移或多步骤流程：

1. 创建描述新更改的 markdown PRD 文件：`touch task-migration-checklist.md`（PRD 可以是 .txt 或 .md）
2. 使用 Taskmaster 通过 `task-master parse-prd --append` 解析新的 PRD（也在 MCP 中可用）
3. 使用 Taskmaster 将新生成的任务扩展为子任务。考虑使用带有正确 --to 和 --from ID（新 ID）的 `analyze-complexity` 来识别每个任务的理想子任务数量。然后展开它们。
4. 系统地处理项目，完成后勾选它们
5. 使用 `task-master update-subtask` 记录每个任务/子任务的进度，如果在实现期间卡住，则更新/研究它们

### Git 集成

Task Master 与 `gh` CLI 配合良好：

```bash
# 为完成的任务创建 PR
gh pr create --title "完成任务 1.2：用户认证" --body "按照任务 1.2 的规范实现 JWT 认证系统"

# 在提交中引用任务
git commit -m "feat: 实现 JWT 认证（任务 1.2）"
```

### 使用 Git Worktrees 进行并行开发

```bash
# 为并行任务开发创建 worktrees
git worktree add ../project-auth feature/auth-system
git worktree add ../project-api feature/api-refactor

# 在每个 worktree 中运行 Claude Code
cd ../project-auth && claude    # 终端 1：认证工作
cd ../project-api && claude     # 终端 2：API 工作
```

## 故障排除

### AI 命令失败

```bash
# 检查是否配置了 API 密钥
cat .env                           # 用于 CLI 使用

# 验证模型配置
task-master models

# 使用不同的模型测试
task-master models --set-fallback gpt-4o-mini
```

### MCP 连接问题

- 检查 `.mcp.json` 配置
- 验证 Node.js 安装
- 启动 Claude Code 时使用 `--mcp-debug` 标志
- 如果 MCP 不可用，使用 CLI 作为后备

### 任务文件同步问题

```bash
# 修复依赖问题
task-master fix-dependencies
```

**不要重新初始化**。除了重新添加相同的 Taskmaster 核心文件外，这不会有任何作用。

## 重要说明

### AI 驱动操作

这些命令进行 AI 调用，可能需要长达一分钟：

- `parse_prd` / `task-master parse-prd`
- `analyze_project_complexity` / `task-master analyze-complexity`
- `expand_task` / `task-master expand`
- `expand_all` / `task-master expand --all`
- `add_task` / `task-master add-task`
- `update` / `task-master update`
- `update_task` / `task-master update-task`
- `update_subtask` / `task-master update-subtask`

### 文件管理

- 永远不要手动编辑 `tasks.json` - 使用命令代替
- 永远不要手动编辑 `.taskmaster/config.json` - 使用 `task-master models`

### Claude Code 会话管理

- 经常使用 `/clear` 以保持专注的上下文
- 为重复的 Task Master 工作流创建自定义斜杠命令
- 配置工具允许列表以简化权限
- 使用无头模式进行自动化：`claude -p "task-master next"`

### 多任务更新

- 使用 `update --from=<id>` 更新多个未来任务
- 使用 `update-task --id=<id>` 进行单个任务更新
- 使用 `update-subtask --id=<id>` 进行实现日志记录

### 研究模式

- 添加 `--research` 标志以进行基于研究的 AI 增强
- 需要研究模型 API 密钥，如环境中的 Perplexity (`PERPLEXITY_API_KEY`)
- 提供更明智的任务创建和更新
- 推荐用于复杂的技术任务

## 工作区路径别名

项目使用 TypeScript 路径别名来简化导入：

```typescript
// 核心包
import { TasksDomain } from '@tm/core';
import { ConfigManager } from '@tm/core/config';
import { StorageService } from '@tm/core/storage';

// CLI 应用
import { CLICommand } from '@tm/cli';

// MCP 应用
import { MCPServer } from '@tm/mcp';

// 桥接
import { TaskMasterBridge } from '@tm/bridge';

// 构建配置
import { buildConfig } from '@tm/build-config';
```

## 贡献指南

1. 遵循现有的代码风格和约定
2. 为所有更改编写测试
3. 使用 Biome 格式化代码
4. 运行类型检查：`npm run turbo:typecheck`
5. 运行测试：`npm test`
6. 为代码更改添加 changeset
7. 提交前确保所有测试通过

## 许可证

Task Master 在 MIT 许可证下获得许可，带有 Commons Clause。这意味着：

✅ **允许**：
- 将 Task Master 用于任何目的（个人、商业、学术）
- 修改代码
- 分发副本
- 创建和销售使用 Task Master 构建的产品

❌ **不允许**：
- 出售 Task Master 本身
- 将 Task Master 作为托管服务提供
- 基于 Task Master 创建竞争产品

有关完整的许可证文本和更多详细信息，请参阅 `LICENSE` 文件。

---

_本指南确保 Claude Code 能够立即访问 Task Master 的基本功能，用于代理开发工作流程。_