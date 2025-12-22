"use client";

import { useActionState } from "react";
import { submitAuditForm } from "@/app/actions/submit-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";

export function AuditForm() {
  const [state, action, isPending] = useActionState(submitAuditForm, {
    success: false,
    message: "",
  });

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Audit Request Received!</h3>
        <p className="text-green-700 mb-6">
          Thanks for reaching out. We've received your details and will be in touch shortly to schedule your audit review.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-lg border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
          <Input id="name" name="name" placeholder="John Doe" required />
          {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="businessName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Business Name</label>
          <Input id="businessName" name="businessName" placeholder="Acme Corp" required />
          {state.errors?.businessName && <p className="text-sm text-red-500">{state.errors.businessName[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Address</label>
          <Input id="email" name="email" type="email" placeholder="john@company.com" required />
          {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phone Number</label>
          <Input id="phone" name="phone" type="tel" placeholder="(512) 555-0123" required />
          {state.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="website" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Website URL (Optional)</label>
          <Input id="website" name="website" placeholder="https://example.com" />
        </div>
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">City</label>
          <Input id="city" name="city" placeholder="Austin, TX" required />
          {state.errors?.city && <p className="text-sm text-red-500">{state.errors.city[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="industry" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Industry</label>
          <Input id="industry" name="industry" placeholder="e.g. Plumbing, Dental, Legal" required />
           {state.errors?.industry && <p className="text-sm text-red-500">{state.errors.industry[0]}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="monthlySpend" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Current Monthly Ad Spend</label>
           <select 
            id="monthlySpend" 
            name="monthlySpend"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a range...</option>
            <option value="$0 - $1,000">$0 - $1,000</option>
            <option value="$1,000 - $5,000">$1,000 - $5,000</option>
            <option value="$5,000 - $10,000">$5,000 - $10,000</option>
            <option value="$10,000+">$10,000+</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="goal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">What is your biggest marketing goal?</label>
        <textarea
          id="goal"
          name="goal"
          required
          rows={3}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="e.g. Get more leads, rank higher on maps, fix my website..."
        />
        {state.errors?.goal && <p className="text-sm text-red-500">{state.errors.goal[0]}</p>}
      </div>

      {state.message && !state.success && (
        <div className="text-red-500 text-sm font-medium">{state.message}</div>
      )}

      <Button type="submit" disabled={isPending} className="w-full h-12 text-lg font-bold" size="lg">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Get My Free Audit"
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By submitting this form, you agree to our Privacy Policy.
      </p>
    </form>
  );
}
