'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { submitSupportInquiryAction } from '@/app/actions/support';

const SUBJECT_OPTIONS = [
  'Order / Delivery Question',
  'Farmer Verification / Document Help',
  'Product Quality / Refund Assistance',
  'Account & Login Inquiry',
  'Platform Feedback / Suggestion',
  'Other Inquiry',
];

export default function SupportFormClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Sending your message...');

    try {
      const res = await submitSupportInquiryAction({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject,
        message: message.trim(),
      });

      if (res.success) {
        toast.success(res.message || 'Thank you! Your message has been sent.', { id: toastId, duration: 6000 });
        setIsSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        toast.error(res.error || 'Failed to submit inquiry.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'An unexpected error occurred.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">check_circle</span>
        </div>
        <h3 className="font-display font-bold text-2xl text-emerald-950">Message Received!</h3>
        <p className="text-emerald-800 text-sm max-w-md">
          Thank you for reaching out to FarmFlow Support. Our team has received your inquiry and will follow up with you via email within 1-2 business days.
        </p>
        <button
          type="button"
          onClick={() => setIsSubmitted(false)}
          className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-6">
      <div className="border-b border-stone-100 pb-4">
        <h2 className="font-display font-bold text-2xl text-stone-900">Send Us a Direct Message</h2>
        <p className="text-stone-500 text-sm mt-1">
          Have an urgent question or need help with a transaction? Fill out the form below and our staff will respond promptly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Your Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Maria Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="maria@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-stone-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Phone (Optional)</label>
            <input
              type="tel"
              placeholder="0912 345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Inquiry Subject *</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-stone-900"
            >
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Detailed Message *</label>
          <textarea
            required
            rows={4}
            placeholder="Please detail your question or concern (include Order ID if applicable)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-sm border border-stone-300 rounded-xl p-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-stone-900 resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">send</span>
            )}
            {isSubmitting ? 'Submitting Inquiry...' : 'Submit Support Inquiry'}
          </button>
        </div>
      </form>
    </div>
  );
}
