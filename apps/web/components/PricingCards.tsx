"use client";

import { Check, Mail, Phone, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";

export default function PricingCards({ isDashboard = false, isPublic = false }: { isDashboard?: boolean, isPublic?: boolean }) {
  const [isYearly, setIsYearly] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [mounted, setMounted] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const utils = trpc.useUtils();
  const createOrder = trpc.payments.createOrder.useMutation();
  const verifyPayment = trpc.payments.verifyPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment successful! You are now a Pro user.");
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Payment verification failed.");
    }
  });

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error("Failed to load payment gateway.");
        return;
      }

      const order = await createOrder.mutateAsync({
        plan: isYearly ? "yearly" : "monthly",
        currency: currency,
      });

      if (!order || !order.id) {
        toast.error("Could not create order.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "AnnuForm",
        description: `Pro Plan (${isYearly ? "Yearly" : "Monthly"})`,
        order_id: order.id,
        handler: function (response: any) {
          verifyPayment.mutate({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: isYearly ? "yearly" : "monthly",
          });
        },
        theme: {
          color: "#2563eb",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    }
  };

  useEffect(() => {
    setMounted(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata') {
        setCurrency("INR");
      }
    } catch (e) {
      // default to USD
    }
  }, []);

  if (!mounted) return null;

  const symbol = currency === "INR" ? "₹" : "$";
  const proMonthly = currency === "INR" ? 100 : 1;
  const proYearly = currency === "INR" ? 1000 : 10;

  return (
    <div className="w-full">
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${!isYearly ? "bg-white dark:bg-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`relative px-6 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center ${isYearly ? "bg-white dark:bg-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
          >
            Yearly
            <span className="absolute -top-3 -right-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800">
              SAVE 16%
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Free Plan */}
        <div className="flex flex-col rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow-sm relative">
          {isDashboard && (
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 text-[10px] font-bold rounded-full">
              Current Plan
            </div>
          )}
          <h3 className="text-xl font-bold">Starter</h3>
          <div className="mt-3 text-3xl font-bold">{symbol}0<span className="text-base text-gray-500 font-normal">/mo</span></div>
          <p className="mt-2 text-gray-500 text-xs">Perfect for individuals and small projects.</p>
          <ul className="mt-6 space-y-3 flex-1 text-sm">
            <li className="flex items-center"><Check className="text-green-500 h-4 w-4 mr-2 shrink-0" /> Up to 3 forms</li>
            <li className="flex items-center"><Check className="text-green-500 h-4 w-4 mr-2 shrink-0" /> 100 responses/month</li>
            <li className="flex items-center"><Check className="text-green-500 h-4 w-4 mr-2 shrink-0" /> Standard themes</li>
            <li className="flex items-center"><Check className="text-green-500 h-4 w-4 mr-2 shrink-0" /> Community support</li>
          </ul>
          {isDashboard ? (
            <button
              disabled
              className="mt-6 block w-full rounded-md border border-gray-300 py-2 text-center font-medium bg-gray-50 text-gray-400 dark:bg-gray-800/50 dark:border-gray-800 cursor-not-allowed text-sm">
              Current Plan
            </button>
          ) : (
            <Link href="/login" className="mt-6 block w-full rounded-md border border-gray-300 py-2 text-center font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
              Get Started
            </Link>
          )}
        </div>

        {/* Pro Plan */}
        <div className="flex flex-col rounded-2xl border-2 border-blue-600 bg-white dark:bg-gray-900 p-6 shadow-lg relative transform md:-translate-y-4">
          <div className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold rounded-full">
            Most Popular
          </div>
          <h3 className="text-xl font-bold">Pro</h3>
          <div className="mt-3 text-3xl font-bold">
            {symbol}{isYearly ? Math.round(proYearly / 12) : proMonthly}
            <span className="text-base text-gray-500 font-normal">/mo</span>
          </div>
          {isYearly && (
            <p className="mt-1 text-xs text-green-600 font-medium">Billed {symbol}{proYearly} yearly</p>
          )}
          <p className="mt-2 text-gray-500 text-xs">For professionals needing more power.</p>
          <ul className="mt-6 space-y-3 flex-1 text-sm">
            <li className="flex items-center"><Check className="text-blue-500 h-4 w-4 mr-2 shrink-0" /> Unlimited forms</li>
            <li className="flex items-center"><Check className="text-blue-500 h-4 w-4 mr-2 shrink-0" /> 10,000 responses/month</li>
            <li className="flex items-center"><Check className="text-blue-500 h-4 w-4 mr-2 shrink-0" /> Premium themes</li>
            <li className="flex items-center"><Check className="text-blue-500 h-4 w-4 mr-2 shrink-0" /> Priority support</li>
            <li className="flex items-center"><Check className="text-blue-500 h-4 w-4 mr-2 shrink-0" /> Remove AnnuForm branding</li>
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={createOrder.isPending}
            className="mt-6 block w-full rounded-md bg-blue-600 py-2 text-center font-medium text-white hover:bg-blue-700 transition-colors shadow-md text-sm disabled:opacity-50">
            {createOrder.isPending ? "Processing..." : "Upgrade to Pro"}
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="flex flex-col rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-xl font-bold">Enterprise</h3>
          <div className="mt-3 text-3xl font-bold">Custom</div>
          <p className="mt-2 text-gray-500 text-xs">For large organizations with custom needs.</p>
          <ul className="mt-6 space-y-3 flex-1 text-sm">
            <li className="flex items-center"><Check className="text-gray-400 dark:text-gray-500 h-4 w-4 mr-2 shrink-0" /> Unlimited everything</li>
            <li className="flex items-center"><Check className="text-gray-400 dark:text-gray-500 h-4 w-4 mr-2 shrink-0" /> Custom domain</li>
            <li className="flex items-center"><Check className="text-gray-400 dark:text-gray-500 h-4 w-4 mr-2 shrink-0" /> Dedicated account manager</li>
            <li className="flex items-center"><Check className="text-gray-400 dark:text-gray-500 h-4 w-4 mr-2 shrink-0" /> SSO & advanced security</li>
            <li className="flex items-center"><Check className="text-gray-400 dark:text-gray-500 h-4 w-4 mr-2 shrink-0" /> Custom integrations</li>
          </ul>
          <button
            onClick={() => setShowContactModal(true)}
            className="mt-6 block w-full rounded-md border border-gray-300 py-2 text-center font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
            Contact Sales
          </button>
        </div>
      </div>

      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Contact Sales</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <a
              href="mailto:pawankushwahmail@gmail.com"
              className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="font-semibold text-sm">Email Us</p>
                <p className="text-xs text-gray-500 truncate">pawankushwahmail@gmail.com</p>
              </div>
            </a>

            <a
              href="https://wa.me/919303011791"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="font-semibold text-sm">WhatsApp</p>
                <p className="text-xs text-gray-500 truncate">+91 9303011791</p>
              </div>
            </a>

            <a
              href="tel:+919303011791"
              className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="font-semibold text-sm">Call Us</p>
                <p className="text-xs text-gray-500 truncate">+91 9303011791</p>
              </div>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
