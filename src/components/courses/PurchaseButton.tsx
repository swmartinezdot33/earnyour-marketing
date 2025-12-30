"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { showToast } from "@/components/ui/toast";

export function PurchaseButton({ courseId, price }: { courseId: string; price: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || "Failed to start checkout", "error");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showToast("Failed to start checkout", "error");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      size="lg"
      className="bg-primary hover:bg-primary/90"
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Enroll Now - $${price}`
      )}
    </Button>
  );
}







