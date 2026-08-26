export interface OrcaHostAPI {
  call: (method: string, params?: Record<string, any>) => Promise<any>;
}

export interface OrcaCommandsAPI {
  register: (commandId: string, handler: (args?: any) => Promise<any> | any) => void;
}

export interface OrcaEventsAPI {
  on: (event: string, handler: (payload: any) => Promise<void> | void) => void;
}

export interface OrcaPluginContext {
  host: OrcaHostAPI;
  commands: OrcaCommandsAPI;
  events: OrcaEventsAPI;
  grantedCapabilities: string[];
  log: (message: string) => void;
}

export interface ScheduledTask {
  id: string;
  name: string;
  command: string;
  intervalSec: number;
  enabled: boolean;
  targetTerminalId?: string; // specific terminal or null for active/first
  lastRunAt?: number;
  runCount?: number;
}

const STORAGE_KEY = 'scheduled_tasks_v1';
const activeTimers = new Map<string, NodeJS.Timeout>();
let pluginContext: OrcaPluginContext | null = null;
let tasksState: ScheduledTask[] = [];

async function loadTasks(host: OrcaHostAPI): Promise<ScheduledTask[]> {
  try {
    const res = await host.call('storage.get', { key: STORAGE_KEY });
    if (res && Array.isArray(res.value)) {
      return res.value;
    }
  } catch {
    // If not found, use default empty list
  }
  return [];
}

async function saveTasks(host: OrcaHostAPI, tasks: ScheduledTask[]): Promise<void> {
  try {
    await host.call('storage.set', { key: STORAGE_KEY, value: tasks });
  } catch (err) {
    pluginContext?.log(`Failed to save tasks to storage: ${String(err)}`);
  }
}

async function executeTask(task: ScheduledTask): Promise<boolean> {
  if (!pluginContext) return false;
  try {
    const workspace = await pluginContext.host.call('workspace.readContext');
    const terminals: Array<{ id: string }> = workspace?.terminals || [];

    if (terminals.length === 0) {
      pluginContext.log(`[Scheduler] No active terminals found for task "${task.name}".`);
      return false;
    }

    let targetId = task.targetTerminalId;
    // If no target specified or target no longer valid, target first available terminal in active workspace
    if (!targetId || !terminals.some((t) => t.id === targetId)) {
      targetId = terminals[0].id;
    }

    pluginContext.log(`[Scheduler] Sending "${task.command}" to terminal ${targetId}...`);
    const sendResult = await pluginContext.host.call('terminal.sendText', {
      terminalId: targetId,
      text: task.command,
      enter: true,
    });

    task.lastRunAt = Date.now();
    task.runCount = (task.runCount || 0) + 1;
    await saveTasks(pluginContext.host, tasksState);

    return Boolean(sendResult?.accepted);
  } catch (err: any) {
    pluginContext.log(`[Scheduler Error] Failed to execute task "${task.name}": ${err?.message || err}`);
    return false;
  }
}

function startTimer(task: ScheduledTask) {
  stopTimer(task.id);
  if (!task.enabled || task.intervalSec < 1) return;

  const timer = setInterval(() => {
    void executeTask(task);
  }, task.intervalSec * 1000);

  activeTimers.set(task.id, timer);
}

function stopTimer(taskId: string) {
  const existing = activeTimers.get(taskId);
  if (existing) {
    clearInterval(existing);
    activeTimers.delete(taskId);
  }
}

export default async function activate(context: OrcaPluginContext): Promise<void> {
  pluginContext = context;
  context.log('Orca Terminal Scheduler Plugin activated.');

  // Load persisted tasks
  tasksState = await loadTasks(context.host);

  // Resume enabled tasks
  for (const task of tasksState) {
    if (task.enabled) {
      startTimer(task);
    }
  }

  // Register scheduler.start
  context.commands.register('scheduler.start', async (args?: {
    id?: string;
    name?: string;
    command?: string;
    intervalSec?: number;
    targetTerminalId?: string;
  }) => {
    const id = args?.id || `task-${Date.now()}`;
    const intervalSec = Math.max(args?.intervalSec || 60, 5);
    const command = args?.command || "echo 'Orca scheduler ping'";
    const name = args?.name || `Task (${intervalSec}s)`;

    let task = tasksState.find((t) => t.id === id);
    if (task) {
      task.name = name;
      task.command = command;
      task.intervalSec = intervalSec;
      task.enabled = true;
      task.targetTerminalId = args?.targetTerminalId;
    } else {
      task = {
        id,
        name,
        command,
        intervalSec,
        enabled: true,
        targetTerminalId: args?.targetTerminalId,
        runCount: 0,
      };
      tasksState.push(task);
    }

    startTimer(task);
    await saveTasks(context.host, tasksState);

    await context.host.call('notifications.show', {
      title: 'Scheduler Task Started',
      body: `"${name}" will run every ${intervalSec}s.`,
    });

    return { ok: true, task };
  });

  // Register scheduler.stop
  context.commands.register('scheduler.stop', async (args?: { id?: string }) => {
    if (args?.id) {
      const task = tasksState.find((t) => t.id === args.id);
      if (task) {
        task.enabled = false;
        stopTimer(task.id);
        await saveTasks(context.host, tasksState);
      }
    } else {
      // Stop all
      for (const task of tasksState) {
        task.enabled = false;
        stopTimer(task.id);
      }
      await saveTasks(context.host, tasksState);
    }

    await context.host.call('notifications.show', {
      title: 'Scheduler Stopped',
      body: args?.id ? `Task ${args.id} stopped.` : 'All scheduled tasks stopped.',
    });

    return { ok: true };
  });

  // Register scheduler.status
  context.commands.register('scheduler.status', async () => {
    return {
      ok: true,
      tasks: tasksState.map((t) => ({
        ...t,
        active: activeTimers.has(t.id),
      })),
      activeCount: activeTimers.size,
    };
  });
}

export async function deactivate(): Promise<void> {
  for (const timer of activeTimers.values()) {
    clearInterval(timer);
  }
  activeTimers.clear();
  pluginContext = null;
}
