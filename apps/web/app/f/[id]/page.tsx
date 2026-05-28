"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function FormFillerPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: form, isLoading, error } = trpc.public.getForm.useQuery({ id }, { retry: false });
  const { data: user } = trpc.auth.me.useQuery(undefined, { retry: false });
  const submitMutation = trpc.public.submitForm.useMutation();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({ id, data: formData }, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to submit form");
      }
    });
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const resetFormData = () => {
    setFormData({});
    setSubmitted(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">Loading form...</div>;
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Form not available</h1>
        <p className="text-gray-500 max-w-md">This form might have been unpublished, deleted, or you have an invalid link.</p>
      </div>
    );
  }

  const themeClasses: Record<string, string> = {
    default: "bg-gray-50 dark:bg-gray-950",
    tech: "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-slate-100",
    anime: "bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 dark:from-pink-950 dark:via-purple-950 dark:to-indigo-950",
    minimal: "bg-white dark:bg-black",
    movies: "bg-gradient-to-br from-red-900 via-black to-black text-amber-50",
    games: "bg-gradient-to-tr from-green-900 via-emerald-900 to-black text-green-400 font-mono",
    startups: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950",
    os: "bg-gradient-to-r from-cyan-900 to-blue-900 text-white font-sans",
    events: "bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-950 dark:to-rose-950",
    communities: "bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-950 dark:to-emerald-950",
  };

  const cardClasses: Record<string, string> = {
    default: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg",
    tech: "bg-slate-800/80 border-slate-700 backdrop-blur-md text-white shadow-2xl shadow-blue-500/20",
    anime: "bg-white/80 dark:bg-gray-900/80 border-pink-200 dark:border-pink-900 backdrop-blur-sm shadow-xl shadow-pink-500/10",
    minimal: "bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm",
    movies: "bg-black/80 border-red-900/50 backdrop-blur-md shadow-2xl shadow-red-900/40",
    games: "bg-black/90 border border-green-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    startups: "bg-white/90 dark:bg-slate-800/90 border-indigo-100 dark:border-indigo-900/50 shadow-xl rounded-3xl",
    os: "bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl",
    events: "bg-white/90 dark:bg-gray-900/90 border-orange-200 dark:border-orange-900/50 shadow-xl",
    communities: "bg-white/90 dark:bg-gray-900/90 border-teal-200 dark:border-teal-900/50 shadow-xl",
  };

  const inputClasses: Record<string, string> = {
    default: "bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500",
    tech: "bg-slate-900/50 border-slate-600 focus:border-blue-500 focus:ring-blue-500 text-white placeholder:text-slate-500",
    anime: "bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-800 focus:border-pink-500 focus:ring-pink-500",
    minimal: "bg-transparent border-b-2 border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white rounded-none px-0",
    movies: "bg-black/50 border-red-900/50 focus:border-red-500 focus:ring-red-500 text-amber-50",
    games: "bg-black border-green-500/50 focus:border-green-400 focus:ring-green-400 text-green-400 placeholder:text-green-900",
    startups: "bg-slate-50 dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl",
    os: "bg-black/20 border-white/10 focus:border-cyan-400 focus:ring-cyan-400 text-white placeholder:text-white/50",
    events: "bg-white dark:bg-gray-950 border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500",
    communities: "bg-white dark:bg-gray-950 border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500",
  };

  const buttonClasses: Record<string, string> = {
    default: "bg-blue-600 hover:bg-blue-700 text-white shadow-md",
    tech: "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]",
    anime: "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg shadow-pink-500/30",
    minimal: "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none",
    movies: "bg-red-700 hover:bg-red-800 text-amber-50 shadow-lg shadow-red-900/50 uppercase tracking-widest",
    games: "bg-green-600 hover:bg-green-500 text-black font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    startups: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 rounded-xl",
    os: "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md shadow-lg border border-white/20",
    events: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30",
    communities: "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30",
  };

  const currentTheme = form.theme as keyof typeof themeClasses || 'default';
  const fields = form.schema?.fields || [];

  const parseMessage = (rawMessage: string) => {
    if (!rawMessage) return "";
    let finalMessage = rawMessage;
    fields.forEach((f: any) => {
      if (f.label) {
        const val = formData[f.id];
        let valStr = "";
        if (Array.isArray(val)) valStr = val.join(", ");
        else if (val !== undefined && val !== null) valStr = String(val);
        
        finalMessage = finalMessage.replace(new RegExp(`{{\\s*${f.label.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*}}`, 'gi'), valStr);
      }
    });
    return finalMessage;
  };

  const getSubmissionMessage = () => {
    const settings = form.schema?.settings;
    let message = "Your response has been submitted successfully.";
    
    if (settings) {
      let foundMatch = false;
      if (settings.rules && Array.isArray(settings.rules)) {
        for (const rule of settings.rules) {
          const answer = formData[rule.fieldId];
          if (answer === undefined || answer === null || answer === "") continue;

          let isMatch = false;
          switch (rule.operator) {
            case 'equals':
              isMatch = String(answer).toLowerCase() === String(rule.value).toLowerCase();
              break;
            case 'notEquals':
              isMatch = String(answer).toLowerCase() !== String(rule.value).toLowerCase();
              break;
            case 'contains':
              if (Array.isArray(answer)) {
                isMatch = answer.some(a => String(a).toLowerCase().includes(String(rule.value).toLowerCase()));
              } else {
                isMatch = String(answer).toLowerCase().includes(String(rule.value).toLowerCase());
              }
              break;
            case 'greaterThan':
              isMatch = Number(answer) > Number(rule.value);
              break;
            case 'lessThan':
              isMatch = Number(answer) < Number(rule.value);
              break;
          }

          if (isMatch && rule.message) {
            message = rule.message;
            foundMatch = true;
            break;
          }
        }
      }
      
      if (!foundMatch && settings.defaultSubmitMessage) {
        message = settings.defaultSubmitMessage;
      }
    }
    
    return parseMessage(message);
  };

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${themeClasses[currentTheme]}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border text-center ${cardClasses[currentTheme]}`}>
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3">Thank You!</h2>
          <p className="text-opacity-80 mb-8 whitespace-pre-wrap">{getSubmissionMessage()}</p>
          <button
            onClick={() => resetFormData()}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${buttonClasses[currentTheme]}`}
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-8 ${themeClasses[currentTheme]}`}>
      <div className={`w-full max-w-2xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden p-6 sm:p-8 md:p-10 transition-all duration-500 ${cardClasses[currentTheme]}`}>
        {user && !submitted && (
          <div className="mb-6 px-4 py-2 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm flex items-center justify-between border border-blue-100 dark:border-blue-900/50">
            <span>Logged in as <strong>{user.email}</strong></span>
            <a href="/login" className="text-xs underline hover:text-blue-800 dark:hover:text-blue-200">Not you?</a>
          </div>
        )}
        <div className="mb-8 pb-8 border-b border-current/10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{form.title}</h1>
          {form.description && (
            <p className="text-lg opacity-80 whitespace-pre-wrap">{form.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {fields.map((field: any) => (
            <div key={field.id} className="space-y-3">
              <label className="block text-lg font-medium">
                {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'shortText' && (
                <input
                  type="text"
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${inputClasses[currentTheme]}`}
                  placeholder="Your answer"
                />
              )}

              {field.type === 'longText' && (
                <textarea
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-y min-h-[120px] ${inputClasses[currentTheme]}`}
                  placeholder="Your answer"
                />
              )}

              {field.type === 'email' && (
                <input
                  type="email"
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${inputClasses[currentTheme]}`}
                  placeholder="you@example.com"
                />
              )}

              {field.type === 'number' && (
                <input
                  type="number"
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${inputClasses[currentTheme]}`}
                  placeholder="0"
                />
              )}

              {field.type === 'singleSelect' && (
                <div className="space-y-3 mt-4">
                  {field.options?.map((opt: string, idx: number) => (
                    <label key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-current/10 hover:bg-current/5 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={field.id}
                        required={field.required}
                        value={opt}
                        checked={formData[field.id] === opt}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-base">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'checkbox' && (
                <div className="space-y-3 mt-4">
                  {field.options?.map((opt: string, idx: number) => {
                    const isChecked = formData[field.id]?.includes(opt) || false;
                    return (
                      <label key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-current/10 hover:bg-current/5 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          name={field.id}
                          value={opt}
                          checked={isChecked}
                          onChange={(e) => {
                            const currentVals = formData[field.id] || [];
                            if (e.target.checked) {
                              handleInputChange(field.id, [...currentVals, opt]);
                            } else {
                              handleInputChange(field.id, currentVals.filter((v: string) => v !== opt));
                            }
                          }}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <span className="text-base">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {field.type === 'rating' && (
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleInputChange(field.id, star)}
                      className={`transition-colors ${formData[field.id] >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    >
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${inputClasses[currentTheme]}`}
                />
              )}

              {field.type === 'url' && (
                <input
                  type="url"
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${inputClasses[currentTheme]}`}
                  placeholder="https://example.com"
                />
              )}
            </div>
          ))}

          <div className="pt-8">
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className={`w-full md:w-auto px-8 py-3 rounded-lg text-lg font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${buttonClasses[currentTheme]}`}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
      <div className="mt-8 text-center text-sm opacity-50 font-medium">
        Powered by AnnuForm
      </div>
    </div>
  );
}
