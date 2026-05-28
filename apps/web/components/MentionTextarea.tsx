import { useState, useRef } from "react";

export const MentionTextarea = ({ value, onChange, fields, placeholder, className, rows = 3 }: any) => {
  const [mentionState, setMentionState] = useState({ active: false, cursorIndex: 0, query: '' });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);

    const match = textBeforeCursor.match(/\{\{([^}]*)$/);
    if (match) {
      setMentionState({
        active: true,
        cursorIndex: cursor,
        query: match[1] || ""
      });
    } else {
      setMentionState(s => ({ ...s, active: false }));
    }
  };

  const insertField = (label: string) => {
    const before = value.slice(0, mentionState.cursorIndex - mentionState.query.length - 2);
    const after = value.slice(mentionState.cursorIndex);
    const newVal = before + "{{" + label + "}}" + after;
    onChange(newVal);
    setMentionState(s => ({ ...s, active: false }));
    textareaRef.current?.focus();
  };

  const filteredFields = fields.filter((f: any) => f.label.toLowerCase().includes(mentionState.query.toLowerCase()));

  return (
    <div className="relative w-full h-full flex flex-col">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className={className}
        rows={rows}
        placeholder={placeholder}
      />
      {mentionState.active && (
        <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-900 border rounded-md shadow-xl max-h-48 overflow-y-auto" style={{ top: "100%", left: 0 }}>
          <div className="p-2 text-xs font-semibold text-gray-500 uppercase">Insert Dynamic Field</div>
          {filteredFields.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">No fields match "{mentionState.query}"</div>
          ) : (
            filteredFields.map((f: any) => (
              <button
                key={f.id}
                onClick={() => insertField(f.label)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none"
              >
                {f.label} <span className="text-xs text-gray-400 ml-2">({f.type})</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
