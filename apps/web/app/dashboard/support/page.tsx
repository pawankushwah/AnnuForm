"use client";

import { useState } from "react";
import { LifeBuoy, MessageSquare, PhoneCall, Ticket, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const faqs = [
  {
    question: "How do I upgrade my plan?",
    answer: "You can upgrade your plan by clicking the 'Upgrade' button in the sidebar. This will open our pricing modal where you can select the Pro plan."
  },
  {
    question: "How many forms can I create on the Starter plan?",
    answer: "The Starter plan allows you to create up to 3 forms. If you need more, you can upgrade to the Pro plan for unlimited forms."
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes! You can cancel your subscription from your billing settings at any time, and you won't be charged for the next billing cycle."
  },
  {
    question: "How do I share my form?",
    answer: "Once you publish your form in the builder, click the 'Share' button at the top right to get the public link or share it directly to social media."
  }
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleTicket = () => {
    toast.success("Support ticket created! We will email you shortly.");
  };

  const handleChat = () => {
    toast.info("Live chat is currently offline. Please create a ticket.");
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
      <div className="h-14 border-b bg-white dark:bg-gray-900 flex items-center px-6 sticky top-0 z-10">
        <h1 className="font-semibold text-lg flex items-center">
          <LifeBuoy className="mr-2 h-5 w-5 text-gray-400" />
          Help & Support
        </h1>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-4">How can we help you?</h2>
          <p className="text-gray-500">We're here to help you get the most out of AnnuForm.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div 
            onClick={handleTicket}
            className="bg-white dark:bg-gray-900 border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center group"
          >
            <div className="h-12 w-12 mx-auto bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Ticket className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold mb-2">Create Ticket</h3>
            <p className="text-sm text-gray-500">Submit a support request and we'll reply via email.</p>
          </div>

          <div 
            onClick={handleChat}
            className="bg-white dark:bg-gray-900 border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center group"
          >
            <div className="h-12 w-12 mx-auto bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <MessageSquare className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-gray-500">Chat directly with one of our support agents.</p>
          </div>

          <div 
            onClick={() => window.location.href = "tel:+1234567890"}
            className="bg-white dark:bg-gray-900 border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center group"
          >
            <div className="h-12 w-12 mx-auto bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <PhoneCall className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold mb-2">Call Us</h3>
            <p className="text-sm text-gray-500">Talk to a representative immediately.</p>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-6">Frequently Asked Questions</h3>
        <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b last:border-0">
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-semibold">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
