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

  const themeClasses = {
    tech: "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-slate-100",
    anime: "bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 dark:from-pink-950 dark:via-purple-950 dark:to-indigo-950",
    minimal: "bg-white dark:bg-black",
    default: "bg-gray-50 dark:bg-gray-950"
  };

  const cardClasses = {
    tech: "bg-slate-800/80 border-slate-700 backdrop-blur-md text-white shadow-2xl shadow-blue-500/20",
    anime: "bg-white/80 dark:bg-gray-900/80 border-pink-200 dark:border-pink-900 backdrop-blur-sm shadow-xl shadow-pink-500/10",
    minimal: "bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm",
    default: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg"
  };

  const inputClasses = {
    tech: "bg-slate-900/50 border-slate-600 focus:border-blue-500 focus:ring-blue-500 text-white placeholder:text-slate-500",
    anime: "bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-800 focus:border-pink-500 focus:ring-pink-500",
    minimal: "bg-transparent border-b-2 border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white rounded-none px-0",
    default: "bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
  };

  const buttonClasses = {
    tech: "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]",
    anime: "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg shadow-pink-500/30",
    minimal: "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none",
    default: "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
  };

  const currentTheme = form.theme as keyof typeof themeClasses || 'default';
  const fields = form.schema?.fields || [];

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${themeClasses[currentTheme]}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border text-center ${cardClasses[currentTheme]}`}>
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3">Thank You!</h2>
          <p className="text-opacity-80 mb-8">Your response has been submitted successfully.</p>
          <button 
            onClick={() => setSubmitted(false)}
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
      <div className={`w-full max-w-2xl p-6 md:p-10 rounded-2xl border ${cardClasses[currentTheme]}`}>
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
