// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { AddAccountDialog } from "@/components/dashboard/add-account-dialog";
// import { CreditCard, Loader2, Plus, Trash2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// const handleDeleteAccount = async (id: string | number) => {
//   if (!window.confirm("Are you sure you want to delete this bank account?")) {
//     return;
//   }
//   try {
//     const res = await fetch(`https://finstacklimitedbackend.onrender.com/api/bank-account/${id}`, {
//       method: "DELETE",
//       credentials: "include",
//       headers: {
//         "Content-Type": "application/json"
//       }
//     });
//     const data = await res.json();
//     if (!res.ok || !data.success) {
//       throw new Error(data.message || "Failed to delete bank account");
//     }
//     setBankAccounts((prev) => prev.filter((acc) => acc.id !== id));
//     toast({
//       title: "Bank Account Deleted",
//       description: "The bank account has been removed.",
//     });
//   } catch (error: any) {
//     toast({
//       title: "Error",
//       description: error.message || "Failed to delete bank account",
//       variant: "destructive",
//     });
//   }
// };

// const openDeleteModal = (id: string) => {
//   setPendingDeleteId(id);
//   setShowDeleteModal(true);
// };

// const closeDeleteModal = () => {
//   setShowDeleteModal(false);
//   setPendingDeleteId(null);
// };

// interface BankAccount {
//   id: number | string;
//   bank: string;
//   accountNumber: string;
//   accountName: string;
//   primary?: boolean;
// }

// export function BankAccountsCard() {
//   const { toast } = useToast();
//   const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

//   useEffect(() => {
//     fetchBankAccounts();
//   }, []);

//   const fetchBankAccounts = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/fstack/profile?type=bank-accounts");
//       const data = await res.json();

//       if (data.success && Array.isArray(data.data)) {
//         const mappedAccounts: BankAccount[] = data.data
//           .filter((acc: any) => !!acc._id)
//           .map((acc: any, index: number) => ({
//             id: acc._id,
//             bank: acc.bankName,
//             accountNumber: acc.accountNumber,
//             accountName: acc.accountName,
//             primary: index === 0,
//           }));
//         setBankAccounts(mappedAccounts);
//       }
//     } catch (err) {
//       console.error("Failed to fetch bank accounts:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddAccount = async (account: {
//     bankName: string;
//     accountNumber: string;
//     accountName: string;
//   }) => {
//     try {
//       const res = await fetch("/api/fstack/profile", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           bankName: account.bankName,
//           accountNumber: account.accountNumber,
//           accountName: account.accountName,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.error || "Failed to add bank account");
//       }

//       const newAccount: BankAccount = {
//         id: data.data?._id,
//         bank: account.bankName,
//         accountNumber: account.accountNumber,
//         accountName: account.accountName,
//         primary: bankAccounts.length === 0,
//       };
//       setBankAccounts([...bankAccounts, newAccount]);

//       toast({
//         title: "Bank Account Added",
//         description: "Your bank account has been added successfully",
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to add bank account",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <Card className="p-4 md:p-6">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h3 className="text-lg md:text-xl font-semibold">Bank Accounts</h3>
//           <p className="text-xs md:text-sm text-gray-600">
//             Manage your withdrawal accounts
//           </p>
//         </div>
//         <AddAccountDialog onAccountAdded={handleAddAccount}>
//           <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm">
//             <Plus className="w-4 h-4 mr-2" />
//             Add Account
//           </Button>
//         </AddAccountDialog>
//       </div>

//       {loading ? (
//         <div className="flex items-center justify-center py-8">
//           <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
//         </div>
//       ) : bankAccounts.length === 0 ? (
//         <div className="text-center py-8 bg-gray-50 rounded-lg">
//           <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//           <p className="text-sm md:text-base text-gray-600 mb-1">
//             No bank accounts added yet
//           </p>
//           <p className="text-xs md:text-sm text-gray-500">
//             Add a bank account to receive payments and withdrawals
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {bankAccounts.map((account) => (
//             <div
//               key={account.id}
//               className="p-3 md:p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-white"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2 md:gap-3">
//                   <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900 text-xs md:text-sm">
//                       {account.bank}
//                     </p>
//                     <p className="text-xs md:text-sm text-gray-600">
//                       {account.accountNumber}
//                     </p>
//                     <p className="text-xs md:text-sm text-gray-600">
//                       {account.accountName}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   {account.primary && (
//                     <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
//                       Primary
//                     </span>
//                   )}
//                   {typeof account.id === "string" && (
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="text-red-600 hover:bg-red-50"
//                       title="Delete Account"
//                       onClick={() => openDeleteModal(account.id)}
//                     >
//                       <Trash2 className="w-5 h-5" />
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Delete Bank Account</DialogTitle>
//           </DialogHeader>
//           <p>
//             Are you sure you want to delete this bank account? This action
//             cannot be undone.
//           </p>
//           <DialogFooter>
//             <Button variant="outline" onClick={closeDeleteModal}>
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={() =>
//                 pendingDeleteId && handleDeleteAccount(pendingDeleteId)
//               }
//             >
//               Delete
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Note about custom accounts */}
//       <div className="mt-4 pt-4 border-t border-gray-200">
//         <p className="text-xs md:text-sm text-gray-600 mb-2">
//           <strong>For non-Nigerian users:</strong> Add custom accounts (Mobile
//           Money, International Banks, etc.)
//         </p>
//         <Link
//           href="/dashboard/settings"
//           className="text-xs md:text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
//         >
//           Go to Settings → Payment → Custom Account
//         </Link>
//       </div>
//     </Card>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddAccountDialog } from "@/components/dashboard/add-account-dialog";
import { CreditCard, Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BankAccount {
  id: string;
  bank: string;
  accountNumber: string;
  accountName: string;
  primary?: boolean;
}

export function BankAccountsCard() {
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      // Note: Ensure this GET route also matches your backend (likely /api/my-bank-accounts)
      const res = await fetch("/api/fstack/profile?type=bank-accounts");
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const mappedAccounts: BankAccount[] = data.data
          .filter((acc: any) => !!acc._id)
          .map((acc: any, index: number) => ({
            id: acc._id,
            bank: acc.bankName,
            accountNumber: acc.accountNumber,
            accountName: acc.accountName,
            primary: index === 0,
          }));
        setBankAccounts(mappedAccounts);
      }
    } catch (err) {
      console.error("Failed to fetch bank accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  // const handleDeleteAccount = async (id: string) => {
  //   try {
  //     // Using the URL that worked in your Postman
  //     const res = await fetch(
  //       `https://finstacklimitedbackend.onrender.com/api/bank-account/${id}`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           // Add Authorization header if your backend requires the token
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       },
  //     );

  //     const data = await res.json();

  //     if (!res.ok || !data.success) {
  //       throw new Error(data.message || "Failed to delete bank account");
  //     }

  //     setBankAccounts((prev) => prev.filter((acc) => acc.id !== id));

  //     toast({
  //       title: "Bank Account Deleted",
  //       description: "The bank account has been removed.",
  //     });
  //     closeDeleteModal();
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to delete bank account",
  //       variant: "destructive",
  //     });
  //   }
  // };

  // Duplicate/partial function removed to fix block structure
  const handleDeleteAccount = async (id: string) => {
    const performDelete = async (token: string) => {
      return await fetch(
        `https://finstacklimitedbackend.onrender.com/api/bank-account/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        },
      );
    };

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("No session found");

      let userData = JSON.parse(storedUser);
      let token = userData.accessToken || userData.user?.accessToken;

      let res = await performDelete(token);

      // If session expired (401), try to refresh
      if (res.status === 401) {
        const refreshRes = await fetch(
          "https://finstacklimitedbackend.onrender.com/api/auth/refresh",
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData.accessToken;

          userData.accessToken = newToken;
          localStorage.setItem("user", JSON.stringify(userData));

          res = await performDelete(newToken);
        } else {
          throw new Error("Session expired. Please log in again.");
        }
      }

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Delete failed");

      setBankAccounts((prev) => prev.filter((acc) => acc.id !== id));
      toast({ title: "Success", description: "Account deleted" });
      closeDeleteModal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const openDeleteModal = (id: string) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPendingDeleteId(null);
  };

  const handleAddAccount = async (account: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => {
    try {
      const res = await fetch("/api/fstack/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to add account");

      const newAccount: BankAccount = {
        id: data.data?._id,
        bank: account.bankName,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        primary: bankAccounts.length === 0,
      };
      setBankAccounts([...bankAccounts, newAccount]);

      toast({ title: "Success", description: "Account added successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold">Bank Accounts</h3>
          <p className="text-xs md:text-sm text-gray-600">
            Manage your withdrawal accounts
          </p>
        </div>
        <AddAccountDialog onAccountAdded={handleAddAccount}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </AddAccountDialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="p-3 md:p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-xs md:text-sm">
                      {account.bank}
                    </p>
                    <p className="text-xs text-gray-600">
                      {account.accountNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {account.primary && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Primary
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => openDeleteModal(account.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bank Account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this bank account? This action
            cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                pendingDeleteId && handleDeleteAccount(pendingDeleteId)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
