import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash, Copy } from "lucide-react";

export function StructureFieldItem({ 
  field, 
  index, 
  removeField,
  duplicateField
}: { 
  field: any, 
  index: number, 
  removeField: (idx: number) => void,
  duplicateField: (idx: number) => void
}) {
  const sortableId = `structure-${field.id}`;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? {
      position: 'relative',
      zIndex: 50,
      opacity: 0.9,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    } : {})
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style as React.CSSProperties} 
      className={`flex items-center gap-2 p-2 rounded-md bg-white dark:bg-gray-900 border shadow-sm group hover:border-blue-300 dark:hover:border-blue-700 transition-colors ${isDragging ? 'ring-2 ring-blue-500 scale-105 cursor-grabbing' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="flex-1 truncate text-sm font-medium">
        {field.label || "Untitled Field"}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => duplicateField(index)}
          className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
          title="Duplicate Field"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button 
          onClick={() => removeField(index)}
          className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
          title="Delete Field"
        >
          <Trash className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
