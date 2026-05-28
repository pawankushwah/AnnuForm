"use client";

import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [type, setType] = useState("suggestion");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedback("");
      toast.success("Thank you for your feedback! We review all submissions.");
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="h-14 border-b bg-white dark:bg-gray-900 flex items-center px-6 sticky top-0 z-10 shrink-0">
        <h1 className="font-semibold text-lg flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-gray-400" />
          Feedback
        </h1>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl bg-white dark:bg-gray-900 border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">We value your feedback!</h2>
            <p className="text-blue-100">Help us improve AnnuForm by sharing your thoughts, feature requests, or reporting bugs.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What kind of feedback is this?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['suggestion', 'bug', 'other'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 px-3 text-sm font-medium rounded-md border capitalize transition-colors ${
                      type === t 
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400" 
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Feedback
              </label>
              <textarea
                id="feedback"
                rows={5}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you love, what could be better, or what's broken..."
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Send Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
