import React from 'react';
import { PlanTask } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { calculateWorkingDays } from '@/lib/ganttUtils';
interface GanttGridProps {
  tasks: PlanTask[];
  selectedTask: PlanTask | null;
  onSelectTask: (task: PlanTask) => void;
  onAddTask: (parentId?: string) => void;
  onDeleteTask: (taskId: string) => void;
  gridRef: React.RefObject<HTMLDivElement>;
}
const GridRow = ({ task, level, selectedTask, onSelectTask, onAddTask, onDeleteTask }: {
  task: PlanTask;
  level: number;
  selectedTask: PlanTask | null;
  onSelectTask: (task: PlanTask) => void;
  onAddTask: (parentId?: string) => void;
  onDeleteTask: (taskId: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasSubtasks = task.subTasks && task.subTasks.length > 0;
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "flex border-b border-border text-sm hover:bg-muted/50 cursor-pointer",
            selectedTask?.id === task.id && "bg-blue-100 dark:bg-blue-900/50"
          )}
          onClick={() => onSelectTask(task)}
        >
          <div className="w-12 flex-shrink-0 border-r p-2 text-center">{task.wbs}</div>
          <div className="w-24 flex-shrink-0 border-r p-2 truncate">{task.projectCase}</div>
          <div className="w-48 flex-shrink-0 border-r p-2 flex items-center" style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}>
            {hasSubtasks && (
              <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="mr-2 p-0.5 rounded-sm hover:bg-muted">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
            <span className="truncate">{task.name}</span>
          </div>
          <div className="w-48 flex-shrink-0 border-r p-2 truncate">{task.description}</div>
          <div className="w-32 flex-shrink-0 border-r p-2 truncate">{task.assignees.join(', ')}</div>
          <div className="w-24 flex-shrink-0 border-r p-2">
            <StatusBadge type={`priority-${task.priority}`}>{task.priority}</StatusBadge>
          </div>
          <div className="w-28 flex-shrink-0 border-r p-2">
            <StatusBadge type={`status-${task.status}`}>{task.status}</StatusBadge>
          </div>
          <div className="w-24 flex-shrink-0 border-r p-2 text-center">{format(parseISO(task.startDate), 'dd-MMM-yy')}</div>
          <div className="w-24 flex-shrink-0 border-r p-2 text-center">{format(parseISO(task.endDate), 'dd-MMM-yy')}</div>
          <div className="w-20 flex-shrink-0 border-r p-2 text-right">{calculateWorkingDays(task.startDate, task.endDate)}</div>
          <div className="w-20 flex-shrink-0 border-r p-2 text-right">{task.estHours}</div>
          <div className="w-20 flex-shrink-0 border-r p-2 text-right">{task.usedHours}</div>
          <div className="w-20 flex-shrink-0 p-2 text-right font-medium">{task.estHours - task.usedHours}</div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onAddTask()}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAddTask(task.id)}>
          <Plus className="mr-2 h-4 w-4" /> Add Subtask
        </ContextMenuItem>
        <ContextMenuItem className="text-red-600" onClick={() => onDeleteTask(task.id)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete Task
        </ContextMenuItem>
      </ContextMenuContent>
      {isExpanded && hasSubtasks && task.subTasks?.map(subTask => (
        <GridRow
          key={subTask.id}
          task={subTask}
          level={level + 1}
          selectedTask={selectedTask}
          onSelectTask={onSelectTask}
          onAddTask={onAddTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </ContextMenu>
  );
};
export function GanttGrid({ tasks, selectedTask, onSelectTask, onAddTask, onDeleteTask, gridRef }: GanttGridProps) {
  return (
    <div ref={gridRef} className="w-[89rem] flex-shrink-0 border-r bg-card overflow-x-hidden">
      <div className="sticky top-0 z-10 flex bg-muted font-semibold text-sm">
        <div className="w-12 flex-shrink-0 border-b border-r p-2 text-center">WBS</div>
        <div className="w-24 flex-shrink-0 border-b border-r p-2">Project Case</div>
        <div className="w-48 flex-shrink-0 border-b border-r p-2">Task Name</div>
        <div className="w-48 flex-shrink-0 border-b border-r p-2">Description</div>
        <div className="w-32 flex-shrink-0 border-b border-r p-2">Assigned To</div>
        <div className="w-24 flex-shrink-0 border-b border-r p-2">Priority</div>
        <div className="w-28 flex-shrink-0 border-b border-r p-2">Status</div>
        <div className="w-24 flex-shrink-0 border-b border-r p-2 text-center">Start</div>
        <div className="w-24 flex-shrink-0 border-b border-r p-2 text-center">End</div>
        <div className="w-20 flex-shrink-0 border-b border-r p-2 text-right">Days</div>
        <div className="w-20 flex-shrink-0 border-b border-r p-2 text-right">EST</div>
        <div className="w-20 flex-shrink-0 border-b border-r p-2 text-right">USED</div>
        <div className="w-20 flex-shrink-0 border-b p-2 text-right">REM</div>
      </div>
      <div>
        {tasks.map(task => (
          <GridRow
            key={task.id}
            task={task}
            level={0}
            selectedTask={selectedTask}
            onSelectTask={onSelectTask}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}