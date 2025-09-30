import React from 'react';
import { PlanTask } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { calculateWorkingDays } from '@/lib/ganttUtils';
import { useDraggable } from '@dnd-kit/core';
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

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `grid-${task.id}`,
    data: { task, type: 'grid-to-timeline' },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            "flex border-b border-border text-xs hover:bg-muted/50 cursor-pointer relative",
            selectedTask?.id === task.id && "bg-blue-100 dark:bg-blue-900/50",
            isDragging && "opacity-50 z-50"
          )}
          onClick={() => onSelectTask(task)}
        >
          <div className="w-10 flex-shrink-0 border-r p-1 text-center flex items-center justify-center">
            <div
              {...listeners}
              {...attributes}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted-foreground/20 rounded"
            >
              <GripVertical size={12} />
            </div>
          </div>
          <div className="w-20 flex-shrink-0 border-r p-1 truncate">{task.projectCase}</div>
          <div className="w-32 flex-shrink-0 border-r p-1 flex items-center" style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}>
            {hasSubtasks && (
              <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="mr-1 p-0.5 rounded-sm hover:bg-muted">
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            )}
            <span className="truncate">{task.name}</span>
          </div>
          <div className="w-28 flex-shrink-0 border-r p-1 truncate">{task.description}</div>
          <div className="w-24 flex-shrink-0 border-r p-1 truncate">{task.assignees.join(', ')}</div>
          <div className="w-20 flex-shrink-0 border-r p-1">
            <StatusBadge type={`priority-${task.priority}`}>{task.priority}</StatusBadge>
          </div>
          <div className="w-24 flex-shrink-0 border-r p-1">
            <StatusBadge type={`status-${task.status}`}>{task.status}</StatusBadge>
          </div>
          <div className="w-20 flex-shrink-0 border-r p-1 text-center">{format(parseISO(task.startDate), 'dd-MMM-yy')}</div>
          <div className="w-20 flex-shrink-0 border-r p-1 text-center">{format(parseISO(task.endDate), 'dd-MMM-yy')}</div>
          <div className="w-16 flex-shrink-0 border-r p-1 text-right">{calculateWorkingDays(task.startDate, task.endDate)}</div>
          <div className="w-16 flex-shrink-0 border-r p-1 text-right">{task.estHours}</div>
          <div className="w-16 flex-shrink-0 border-r p-1 text-right">{task.usedHours}</div>
          <div className="w-16 flex-shrink-0 p-1 text-right font-medium">{task.estHours - task.usedHours}</div>
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
    <div ref={gridRef} className="w-[35rem] flex-shrink-0 border-r bg-card overflow-x-hidden">
      <div className="sticky top-0 z-10 flex bg-muted font-semibold text-xs">
        <div className="w-10 flex-shrink-0 border-b border-r p-1 text-center">WBS</div>
        <div className="w-20 flex-shrink-0 border-b border-r p-1">Project Case</div>
        <div className="w-32 flex-shrink-0 border-b border-r p-1">Task Name</div>
        <div className="w-28 flex-shrink-0 border-b border-r p-1">Description</div>
        <div className="w-24 flex-shrink-0 border-b border-r p-1">Assigned To</div>
        <div className="w-20 flex-shrink-0 border-b border-r p-1">Priority</div>
        <div className="w-24 flex-shrink-0 border-b border-r p-1">Status</div>
        <div className="w-20 flex-shrink-0 border-b border-r p-1 text-center">Start</div>
        <div className="w-20 flex-shrink-0 border-b border-r p-1 text-center">End</div>
        <div className="w-16 flex-shrink-0 border-b border-r p-1 text-right">Days</div>
        <div className="w-16 flex-shrink-0 border-b border-r p-1 text-right">EST</div>
        <div className="w-16 flex-shrink-0 border-b border-r p-1 text-right">USED</div>
        <div className="w-16 flex-shrink-0 border-b p-1 text-right">REM</div>
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