# Task Master Command Reference

Comprehensive command structure for Task Master integration with Claude Code.

## Command Organization

Commands are organized hierarchically to match Task Master's CLI structure while providing enhanced Claude Code integration.

## Project Setup & Configuration

### `/ztm:init`
- `init-project` - Initialize new project (handles PRD files intelligently)
- `init-project-quick` - Quick setup with auto-confirmation (-y flag)

### `/ztm:models`
- `view-models` - View current AI model configuration
- `setup-models` - Interactive model configuration
- `set-main` - Set primary generation model
- `set-research` - Set research model
- `set-fallback` - Set fallback model

## Task Generation

### `/ztm:parse-prd`
- `parse-prd` - Generate tasks from PRD document
- `parse-prd-with-research` - Enhanced parsing with research mode

### `/ztm:generate`
- `generate-tasks` - Create individual task files from tasks.json

## Task Management

### `/ztm:list`
- `list-tasks` - Smart listing with natural language filters
- `list-tasks-with-subtasks` - Include subtasks in hierarchical view
- `list-tasks-by-status` - Filter by specific status

### `/ztm:set-status`
- `to-pending` - Reset task to pending
- `to-in-progress` - Start working on task
- `to-done` - Mark task complete
- `to-review` - Submit for review
- `to-deferred` - Defer task
- `to-cancelled` - Cancel task

### `/ztm:sync-readme`
- `sync-readme` - Export tasks to README.md with formatting

### `/ztm:update`
- `update-task` - Update tasks with natural language
- `update-tasks-from-id` - Update multiple tasks from a starting point
- `update-single-task` - Update specific task

### `/ztm:add-task`
- `add-task` - Add new task with AI assistance

### `/ztm:remove-task`
- `remove-task` - Remove task with confirmation

## Subtask Management

### `/ztm:add-subtask`
- `add-subtask` - Add new subtask to parent
- `convert-task-to-subtask` - Convert existing task to subtask

### `/ztm:remove-subtask`
- `remove-subtask` - Remove subtask (with optional conversion)

### `/ztm:clear-subtasks`
- `clear-subtasks` - Clear subtasks from specific task
- `clear-all-subtasks` - Clear all subtasks globally

## Task Analysis & Breakdown

### `/ztm:analyze-complexity`
- `analyze-complexity` - Analyze and generate expansion recommendations

### `/ztm:complexity-report`
- `complexity-report` - Display complexity analysis report

### `/ztm:expand`
- `expand-task` - Break down specific task
- `expand-all-tasks` - Expand all eligible tasks
- `with-research` - Enhanced expansion

## Task Navigation

### `/ztm:next`
- `next-task` - Intelligent next task recommendation

### `/ztm:show`
- `show-task` - Display detailed task information

### `/ztm:status`
- `project-status` - Comprehensive project dashboard

## Dependency Management

### `/ztm:add-dependency`
- `add-dependency` - Add task dependency

### `/ztm:remove-dependency`
- `remove-dependency` - Remove task dependency

### `/ztm:validate-dependencies`
- `validate-dependencies` - Check for dependency issues

### `/ztm:fix-dependencies`
- `fix-dependencies` - Automatically fix dependency problems

## Workflows & Automation

### `/ztm:workflows`
- `smart-workflow` - Context-aware intelligent workflow execution
- `command-pipeline` - Chain multiple commands together
- `auto-implement-tasks` - Advanced auto-implementation with code generation

## Utilities

### `/ztm:utils`
- `analyze-project` - Deep project analysis and insights

### `/ztm:setup`
- `install-taskmaster` - Comprehensive installation guide
- `quick-install-taskmaster` - One-line global installation

## Usage Patterns

### Natural Language
Most commands accept natural language arguments:
```
/ztm:add-task create user authentication system
/ztm:update mark all API tasks as high priority
/ztm:list show blocked tasks
```

### ID-Based Commands
Commands requiring IDs intelligently parse from $ARGUMENTS:
```
/ztm:show 45
/ztm:expand 23
/ztm:set-status/to-done 67
```

### Smart Defaults
Commands provide intelligent defaults and suggestions based on context.