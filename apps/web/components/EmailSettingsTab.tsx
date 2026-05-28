"use client";

import { useState, useEffect } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Save, FileText } from "lucide-react";
import { MentionTextarea } from "./MentionTextarea";

const PREDEFINED_TEMPLATES = {
  minimal: {
    name: "Minimal (Text)",
    subject: "Form Submission Received",
    body: "Hello,\n\nWe have received a new submission.\n\nDetails:\n{{All Fields}}\n\nThank you!"
  },
  professional: {
    name: "Professional (HTML)",
    subject: "New Entry: {{Form Name}}",
    body: "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaeb; border-radius: 8px; padding: 24px;\">\n  <h2 style=\"color: #111827; margin-bottom: 16px;\">New Submission</h2>\n  <p style=\"color: #4b5563; line-height: 1.5;\">A new response has been recorded. Here are the details:</p>\n  <table style=\"width: 100%; border-collapse: collapse; margin-top: 24px;\">\n    {{HTML Table of Fields}}\n  </table>\n</div>"
  },
  friendly: {
    name: "Friendly (HTML)",
    subject: "🎉 We got your response!",
    body: "<div style=\"font-family: 'Comic Sans MS', cursive, sans-serif; background-color: #f3f4f6; padding: 32px; border-radius: 16px; text-align: center;\">\n  <h1 style=\"color: #2563eb;\">Thanks for reaching out!</h1>\n  <p style=\"font-size: 16px; color: #374151;\">We've received your information and will be in touch soon.</p>\n  <hr style=\"border: none; border-top: 2px dashed #d1d5db; margin: 24px 0;\" />\n  <div style=\"text-align: left; background: white; padding: 16px; border-radius: 8px;\">\n    {{All Fields}}\n  </div>\n</div>"
  }
};

export function EmailSettingsTab({ formId, fields }: { formId: string, fields: any[] }) {
  const [activeSubTab, setActiveSubTab] = useState<"CREATOR" | "RESPONDENT">("CREATOR");
  
  const utils = trpc.useUtils();
  const { data: templates, isLoading } = trpc.emailTemplates.listByForm.useQuery({ formId });
  const saveTemplate = trpc.emailTemplates.save.useMutation({
    onSuccess: () => {
      toast.success("Email template saved!");
      utils.emailTemplates.listByForm.invalidate({ formId });
    },
    onError: (e) => {
      toast.error(e.message || "Failed to save template");
    }
  });

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isActive, setIsActive] = useState(true);

  // When sub tab or templates change, populate fields
  useEffect(() => {
    if (templates) {
      const template = templates.find((t: any) => t.type === activeSubTab);
      if (template) {
        setSubject(template.subject);
        setBody(template.body);
        setIsActive(template.isActive || false);
      } else {
        setSubject(activeSubTab === "CREATOR" ? "New submission received!" : "Thank you for your submission");
        setBody(activeSubTab === "CREATOR" ? "You have a new response for your form.\n\nHere are the details:\n\n{{Name}}\n{{Email}}" : "Hi {{Name}},\n\nThank you for filling out the form!");
        setIsActive(false);
      }
    }
  }, [activeSubTab, templates]);

  const handleSave = () => {
    saveTemplate.mutate({
      formId,
      type: activeSubTab,
      subject,
      body,
      isActive,
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading templates...</div>;
  }

  return (
    <div className="flex-1 p-8 overflow-auto pb-32 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Email Notifications</h2>
          <p className="text-gray-500">Configure automated emails that are sent when a user submits your form.</p>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setActiveSubTab("CREATOR")}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeSubTab === "CREATOR" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Creator Notification
          </button>
          <button 
            onClick={() => setActiveSubTab("RESPONDENT")}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeSubTab === "RESPONDENT" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Respondent Notification
          </button>
        </div>

        <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{activeSubTab === "CREATOR" ? "Send to me" : "Send to respondent"}</h3>
              <p className="text-sm text-gray-500">
                {activeSubTab === "CREATOR" 
                  ? "Receive an email every time someone submits this form." 
                  : "Send a confirmation email to the person who filled out the form (Requires an 'Email' field)."}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className={isActive ? "" : "opacity-50 pointer-events-none"}>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="h-4 w-4" /> Predefined Templates
                </div>
                <select 
                  className="text-sm border rounded-md px-3 py-1.5 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    const tpl = PREDEFINED_TEMPLATES[e.target.value as keyof typeof PREDEFINED_TEMPLATES];
                    if (tpl) {
                      setSubject(tpl.subject);
                      setBody(tpl.body);
                    }
                  }}
                >
                  <option value="">-- Choose a template --</option>
                  {Object.entries(PREDEFINED_TEMPLATES).map(([key, tpl]) => (
                    <option key={key} value={key}>{tpl.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject Line</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-transparent"
                  placeholder="e.g. New Form Submission"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">Email Body (HTML or Text)</label>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Type {'{{'} to insert form data</span>
                </div>
                <MentionTextarea
                  fields={fields}
                  value={body}
                  onChange={(val: string) => setBody(val)}
                  className="w-full min-h-[300px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-gray-50 dark:bg-gray-950"
                  placeholder="Enter HTML or plain text here..."
                  rows={12}
                />
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saveTemplate.isPending}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 disabled:opacity-50"
                >
                  <Save className="mr-2 h-4 w-4" /> 
                  {saveTemplate.isPending ? "Saving..." : "Save Template"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
