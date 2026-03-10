"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBoardStore } from "@/store/boardStore";
import { MessageSquare, Paperclip, CheckSquare, Calendar, User } from "lucide-react";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { Card } from "@/types";

const PRIORITY_DOTS: Record<string, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-blue-400",
};

interface CardItemProps { card: Card; isDragging?: boolean; }

export function CardItem({ card, isDragging }: CardItemProps) {
  const { openCardModal } = useBoardStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.3 : 1,
  };

  const overdue = card.dueDate && isOverdue(card.dueDate);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      onClick={() => openCardModal(card.id)}
      className={cn(
        "group bg-slate-800/80 hover:bg-slate-800 border border-white/5 hover:border-white/10 rounded-xl p-3 cursor-pointer transition-all",
        isDragging && "rotate-2 shadow-2xl scale-105",
      )}>
      {/* Cover */}
      {card.coverColor && (
        <div className="h-1.5 rounded-full mb-2" style={{ background: card.coverColor }} />
      )}

      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.slice(0, 4).map((label) => (
            <span key={label.id} className="h-1.5 w-10 rounded-full" style={{ background: label.color }} title={label.name} />
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm text-slate-100 font-medium leading-snug mb-2 group-hover:text-white">{card.title}</p>

      {/* Priority */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className={cn("w-2 h-2 rounded-full shrink-0", PRIORITY_DOTS[card.priority] || "bg-slate-500")} />
        <span className="text-xs text-slate-500 capitalize">{card.priority.toLowerCase()}</span>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2.5">
          {card.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MessageSquare className="w-3 h-3" />{card.commentCount}
            </span>
          )}
          {card.attachmentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Paperclip className="w-3 h-3" />{card.attachmentCount}
            </span>
          )}
          {card.checklistProgress != null && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <CheckSquare className="w-3 h-3" />{card.checklistProgress}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {card.dueDate && (
            <span className={cn("flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md",
              overdue ? "text-red-400 bg-red-500/10" : card.status === "DONE" ? "text-green-400 bg-green-500/10" : "text-slate-400 bg-slate-700/50")}>
              <Calendar className="w-3 h-3" />
              {formatDate(card.dueDate, "MMM d")}
            </span>
          )}
          {card.assignee && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold" title={card.assignee.name || ""}>
              {card.assignee.name?.slice(0, 1).toUpperCase() || <User className="w-3 h-3" />}
            </div>
          )}
        </div>
      </div>

      {/* Checklist progress bar */}
      {card.checklistProgress != null && card.checklistProgress > 0 && (
        <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${card.checklistProgress}%` }} />
        </div>
      )}
    </div>
  );
}
