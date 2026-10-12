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
    let cancelled = false;

    const loadPaymentMethods = async () => {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        fetch("/api/fstack/profile?type=bank-accounts").then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch bank accounts");
          return data;
        }),
        fetch("/api/fstack/profile").then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
          return data;
        }),
        fetchWithAuth("https://api.usefinstack.co/api/payment-methods").then(
          async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch payment methods");
            return data;
          },
        ),
      ]);

      const paymentMethods: PaymentMethod[] = [];
      const bankAccountsResult = results[0];
      if (
        bankAccountsResult.status === "fulfilled" &&
        bankAccountsResult.value.success &&
        Array.isArray(bankAccountsResult.value.data)
      ) {
        paymentMethods.push(
          ...bankAccountsResult.value.data.map((account: any) => ({
            ...account,
            type: "BANK",
          })),
        );
      }

      const profileResult = results[1];
      if (profileResult.status === "fulfilled" && profileResult.value.success) {
        const profile = profileResult.value.data || {};
        const profileAlipay = profile.alipay || profile.paymentMethods?.alipay || {};
        const alipayAccountName =
          profileAlipay.alipayAccountName ||
          profile.alipayAccountName ||
          profileAlipay.accountName;
        const alipayEmail =
          profileAlipay.alipayEmail || profile.alipayEmail || profileAlipay.email;
        const alipayQrImage =
          profileAlipay.alipayQrImage ||
          profile.alipayQrImage ||
          profileAlipay.alipayQrUrl;

        if (alipayAccountName || alipayEmail || alipayQrImage) {
          paymentMethods.push({
            ...profileAlipay,
            _id: profileAlipay._id || `alipay-${alipayEmail || alipayAccountName}`,
            type: "ALIPAY",
            alipayAccountName,
            alipayEmail,
            alipayQrImage,
          });
        }
      }

      const savedMethodsResult = results[2];
      if (
        savedMethodsResult.status === "fulfilled" &&
        savedMethodsResult.value.success &&
        savedMethodsResult.value.data
      ) {
        const savedMethods = savedMethodsResult.value.data;
        if (Array.isArray(savedMethods.bankAccounts)) {
          for (const account of savedMethods.bankAccounts) {
            const alreadyIncluded = paymentMethods.some(
              (method) =>
                method.type === "BANK" &&
                method.accountNumber === account.accountNumber,
            );
            if (!alreadyIncluded) paymentMethods.push({ ...account, type: "BANK" });
          }
        }
        if (savedMethods.alipay) {
          const alreadyIncluded = paymentMethods.some(
            (method) =>
              method.type === "ALIPAY" &&
              method.alipayEmail === savedMethods.alipay.alipayEmail,
          );
          if (!alreadyIncluded) {
            paymentMethods.push({ ...savedMethods.alipay, type: "ALIPAY" });
          }
        }
      }

      if (!cancelled) {
        setMethods(paymentMethods);
        if (paymentMethods.length === 0) {
          const failedResult = results.find(
            (result) => result.status === "rejected",
          );
          if (failedResult?.status === "rejected") {
            setError(failedResult.reason?.message || "Failed to fetch payment methods");
          }
        }
        setLoading(false);
      }
    };

    loadPaymentMethods();
    return () => {
      cancelled = true;
    };
  }, []);

  return { methods, loading, error };
}
