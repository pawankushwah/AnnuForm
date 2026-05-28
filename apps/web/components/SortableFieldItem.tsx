import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash, Copy, Plus, X } from "lucide-react";

export function SortableFieldItem({ 
  field, 
  index, 
  updateField, 
  removeField 
}: { 
  field: any, 
  index: number, 
  updateField: (idx: number, updates: any) => void, 
  removeField: (idx: number) => void,
  duplicateField: (idx: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? {
      position: 'relative',
      zIndex: 50,
      opacity: 0.9,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    } : {})
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style as React.CSSProperties} 
      className={`bg-white dark:bg-gray-900 p-6 rounded-xl border shadow-sm group relative ${isDragging ? 'ring-2 ring-blue-500 scale-[1.02] cursor-grabbing' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="pl-6">
        <div className="flex items-start justify-between mb-4">
          <input 
            type="text" 
            value={field.label} 
            onChange={(e) => updateField(index, { label: e.target.value })}
            className="font-medium text-lg w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none px-1 py-0.5"
            placeholder="Question Title"
          />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button 
              onClick={() => duplicateField(index)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
              title="Duplicate Field"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button 
              onClick={() => removeField(index)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
              title="Delete Field"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 opacity-70 cursor-not-allowed">
          {field.type === 'shortText' && <div className="h-10 border-b-2 border-gray-300 w-full" />}
          {field.type === 'longText' && <div className="h-24 border-2 border-gray-300 rounded w-full" />}
          {field.type === 'email' && <div className="h-10 border-b-2 border-gray-300 w-full flex items-center text-gray-400 px-2">@</div>}
          {field.type === 'number' && <div className="h-10 border-b-2 border-gray-300 w-full flex items-center text-gray-400 px-2">123</div>}
          {field.type === 'singleSelect' && (
            <div className="space-y-2">
              {field.options?.map((opt: string, optIdx: number) => (
                <div key={optIdx} className="flex items-center gap-2 group/opt">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400 shrink-0" />
                  <input 
                    type="text" 
                    value={opt} 
                    onChange={(e) => {
                      const newOpts = [...field.options];
                      newOpts[optIdx] = e.target.value;
                      updateField(index, { options: newOpts });
                    }}
                    className="bg-transparent border-b border-dashed border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none text-sm flex-1"
                  />
                  <button 
                    onClick={() => {
                      const newOpts = field.options.filter((_: any, i: number) => i !== optIdx);
                      updateField(index, { options: newOpts });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => updateField(index, { options: [...(field.options||[]), `Option ${(field.options?.length||0)+1}`] })} 
                className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add Option
              </button>
            </div>
          )}
          {field.type === 'checkbox' && (
            <div className="space-y-2">
              {field.options?.map((opt: string, optIdx: number) => (
                <div key={optIdx} className="flex items-center gap-2 group/opt">
                  <div className="w-4 h-4 rounded border-2 border-gray-400 shrink-0" />
                  <input 
                    type="text" 
                    value={opt} 
                    onChange={(e) => {
                      const newOpts = [...field.options];
                      newOpts[optIdx] = e.target.value;
                      updateField(index, { options: newOpts });
                    }}
                    className="bg-transparent border-b border-dashed border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none text-sm flex-1"
                  />
                  <button 
                    onClick={() => {
                      const newOpts = field.options.filter((_: any, i: number) => i !== optIdx);
                      updateField(index, { options: newOpts });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => updateField(index, { options: [...(field.options||[]), `Option ${(field.options?.length||0)+1}`] })} 
                className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add Option
              </button>
            </div>
          )}
          {field.type === 'rating' && (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
          {field.type === 'date' && (
            <div className="h-10 border-b-2 border-gray-300 w-full flex items-center justify-between text-gray-400 px-2">
              <span>MM/DD/YYYY</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
          )}
          {field.type === 'url' && (
            <div className="h-10 border-b-2 border-gray-300 w-full flex items-center text-gray-400 px-2">https://</div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input 
              type="checkbox" 
              checked={field.required} 
              onChange={(e) => updateField(index, { required: e.target.checked })}
            />
            Required
          </label>
        </div>
      </div>
    </div>
  );
}
