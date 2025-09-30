import React from 'react';
import { PlanTask } from '@/types';
import { generateDateHeaders } from '@/lib/ganttUtils';
import { format, differenceInDays, parseISO, isToday, isWeekend, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { DndContext, useDraggable, useDroppable, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
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
      className="h-6 bg-blue-500 rounded-md flex items-center px-2 text-white text-xs z-10 group"
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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
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
    <div ref={timelineRef} className="flex-grow overflow-x-auto">
      <div ref={headerRef} className="sticky top-0 z-20 bg-muted">
        <div className="flex">
          {months.map((month) => (
            <div
              key={`${month.name}-${month.year}`}
              className="border-b border-r text-center font-semibold text-sm"
              style={{ width: month.dayCount * DAY_WIDTH }}
            >
              {month.name} {month.year}
            </div>
          ))}
        </div>
        <div className="flex">
          {days.map(day => (
            <div
              key={day.toString()}
              className={cn(
                "flex-shrink-0 border-b border-r text-center text-xs",
                isWeekend(day) && "bg-muted-foreground/10"
              )}
              style={{ width: DAY_WIDTH }}
            >
              <div className={cn("py-1", isToday(day) && "bg-blue-500 text-white rounded-full w-6 h-6 mx-auto flex items-center justify-center")}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          ref={setNodeRef}
          className="relative"
          style={{
            height: `${flatTasks.length * 41}px`,
            width: `${days.length * DAY_WIDTH}px`,
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