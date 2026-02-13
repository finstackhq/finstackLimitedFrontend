import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/components/auth-form";

export interface PaymentMethod {
  _id: string;
  type: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  alipayAccountName?: string;
  alipayEmail?: string;
  [key: string]: any;
}

export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchWithAuth(
      "https://finstacklimitedbackend.onrender.com/api/payment-methods",
    )
      .then(async (res) => {
        const data = await res.json();
        if (data.success && data.data) {
          let methods: PaymentMethod[] = [];
          if (Array.isArray(data.data.bankAccounts)) {
            methods = methods.concat(
              data.data.bankAccounts.map((b: any) => ({ ...b, type: "BANK" })),
            );
          }
          if (data.data.alipay) {
            methods.push({ ...data.data.alipay, type: "ALIPAY" });
          }
          setMethods(methods);
        } else {
          setError(data.error || "Failed to fetch payment methods");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch payment methods");
      })
      .finally(() => setLoading(false));
  }, []);

  return { methods, loading, error };
}
