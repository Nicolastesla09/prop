import React from 'react';
import { PlanTask } from '@/types';
import { generateDateHeaders } from '@/lib/ganttUtils';
import { format, differenceInDays, parseISO, isToday, isWeekend, addDays, startOfWeek, getISOWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { DndContext, useDraggable, useDroppable, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
const DAY_WIDTH = 32; // width of a day column in pixels
interface GanttTimelineProps {
  tasks: PlanTask[];
  startDate: Date;
  endDate: Date;
  onTaskUpdate: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  timelineRef: React.RefObject<HTMLDivElement>;
  headerRef: React.RefObject<HTMLDivElement>;
}
const flattenTasks = (tasks: PlanTask[]): PlanTask[] => {
  const allTasks: PlanTask[] = [];
  const recurse = (task: PlanTask) => {
    allTasks.push(task);
    if (task.subTasks) {
      task.subTasks.forEach(recurse);
    }
  };
  tasks.forEach(recurse);
  return allTasks;
};
function TaskBar({ task, startDate, top }: { task: PlanTask; startDate: Date; top: number; }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task, startDate, type: 'move' },
  });
  const { setNodeRef: setLeftHandleRef, listeners: leftListeners } = useDraggable({
    id: `${task.id}-left`,
    data: { task, startDate, type: 'resize-left' },
  });
  const { setNodeRef: setRightHandleRef, listeners: rightListeners } = useDraggable({
    id: `${task.id}-right`,
    data: { task, startDate, type: 'resize-right' },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  const taskStart = parseISO(task.startDate);
  const taskEnd = parseISO(task.endDate);
  const left = differenceInDays(taskStart, startDate) * DAY_WIDTH;
  const width = (differenceInDays(taskEnd, taskStart) + 1) * DAY_WIDTH - 4;
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, left, width, top, position: 'absolute' }}
      className="h-6 bg-blue-500 border border-blue-600 rounded-md flex items-center px-2 text-white text-xs z-10 group shadow-sm"
      title={`${task.name} (${task.usedHours}/${task.estHours}h)`}
    >
      <div ref={setLeftHandleRef} {...leftListeners} className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize" />
      <div {...listeners} {...attributes} className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-between gap-2">
        <span className="truncate flex-shrink">{task.name}</span>
        <span className="flex-shrink-0 font-mono text-white/80">({task.usedHours}/{task.estHours}h)</span>
      </div>
      <div ref={setRightHandleRef} {...rightListeners} className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize" />
    </div>
  );
}
export function GanttTimeline({ tasks, startDate, endDate, onTaskUpdate, timelineRef, headerRef }: GanttTimelineProps) {
  const { days, months } = generateDateHeaders(startDate, endDate);
  const flatTasks = flattenTasks(tasks);
  const { setNodeRef } = useDroppable({ id: 'gantt-droppable-area' });
  const [draggedTask, setDraggedTask] = React.useState<PlanTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Early return if no data
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex-1 bg-muted/20 flex items-center justify-center text-muted-foreground border-l">
        <div className="text-center">
          <p>No tasks to display</p>
          <p className="text-sm mt-2">Tasks: {tasks?.length || 0}</p>
        </div>
      </div>
    );
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const task = active.data.current?.task as PlanTask;
    const type = active.data.current?.type as string;
    if (!task) return;
    const daysDragged = Math.round(delta.x / DAY_WIDTH);
    if (daysDragged === 0) return;
    const originalStartDate = parseISO(task.startDate);
    const originalEndDate = parseISO(task.endDate);
    let newStartDate = originalStartDate;
    let newEndDate = originalEndDate;
    if (type === 'move') {
      const duration = differenceInDays(originalEndDate, originalStartDate);
      newStartDate = addDays(originalStartDate, daysDragged);
      newEndDate = addDays(newStartDate, duration);
    } else if (type === 'resize-right') {
      newEndDate = addDays(originalEndDate, daysDragged);
      if (differenceInDays(newEndDate, newStartDate) < 0) newEndDate = newStartDate;
    } else if (type === 'resize-left') {
      newStartDate = addDays(originalStartDate, daysDragged);
      if (differenceInDays(newEndDate, newStartDate) < 0) newStartDate = newEndDate;
    }
    onTaskUpdate(task.id, newStartDate, newEndDate);
  };
  return (
    <div ref={timelineRef} className="flex-grow overflow-x-auto bg-background">
      <div ref={headerRef} className="sticky top-0 z-20 bg-muted">
        {/* Weeks row */}
        <div className="flex">
          {(() => {
            const weeks: { key: number; count: number; start: Date; weekNo: number }[] = [];
            days.forEach((day) => {
              const start = startOfWeek(day, { weekStartsOn: 1 });
              const key = start.getTime();
              const last = weeks[weeks.length - 1];
              if (!last || last.key !== key) {
                weeks.push({ key, count: 1, start, weekNo: getISOWeek(day) });
              } else {
                last.count += 1;
              }
            });
            return weeks.map((w) => (
              <div
                key={w.key}
                className="border-b border-r text-center text-xs leading-tight h-10 flex flex-col items-center justify-center"
                style={{ width: w.count * DAY_WIDTH }}
              >
                <div className="font-medium">Week {w.weekNo}</div>
                <div className="text-[10px] opacity-70">{format(w.start, 'd MMM yyyy')}</div>
              </div>
            ));
          })()}
        </div>
        {/* Days row */}
        <div className="flex">
          {days.map(day => (
            <div
              key={day.toString()}
              className={cn(
                "flex-shrink-0 border-b border-r text-center text-xs h-8 flex items-center justify-center",
                isWeekend(day) && "bg-muted-foreground/10"
              )}
              style={{ width: DAY_WIDTH }}
            >
              <div className={cn("", isToday(day) && "bg-blue-500 text-white rounded-full w-6 h-6 mx-auto flex items-center justify-center")}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        {/* Weekday letters row (bottom, aligned with grid titles) */}
        <div className="flex">
          {days.map(day => (
            <div
              key={`dow-${day.toString()}`}
              className={cn(
                "flex-shrink-0 border-b border-r text-center text-xs h-8 flex items-center justify-center",
                isWeekend(day) && "bg-muted-foreground/10"
              )}
              style={{ width: DAY_WIDTH }}
            >
              <div className="uppercase">{format(day, 'EEEEE')}</div>
            </div>
          ))}
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          ref={setNodeRef}
          className="relative bg-background"
          style={{
            height: `${Math.max(flatTasks.length * 41, 200)}px`,
            width: `${days.length * DAY_WIDTH}px`,
            minWidth: '400px',
            backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: `${DAY_WIDTH}px 41px`,
          }}
        >
          {/* Task Bars */}
          {flatTasks.map((task, index) => (
            <TaskBar key={task.id} task={task} startDate={startDate} top={index * 41 + 8} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}