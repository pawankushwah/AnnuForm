import { useDraggable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

export function DraggableFieldButton({ type }: { type: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: {
      type: "new-field",
      fieldType: type,
    },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 p-3 w-full border rounded-lg text-sm font-medium transition-colors cursor-grab active:cursor-grabbing ${
        isDragging 
          ? "opacity-50 bg-blue-50 border-blue-200" 
          : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
        <Plus className="h-4 w-4" />
      </div>
      <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
    </button>
  );
}
