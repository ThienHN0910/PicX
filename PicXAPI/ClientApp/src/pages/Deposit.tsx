import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import axios from "axios";

const Deposit: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('authToken');

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPaymentUrl(null);

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      console.log(token)
      const res = await axios.post(
        "/api/wallet/deposit",
        { amount: value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPaymentUrl(res.data.paymentUrl);
    } catch (err: any) {
        console.error("Error:", err);
        console.error("Response:", err.response);
        setError(
            err.response?.data?.message || "Failed to create deposit request."
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Deposit to Wallet</h1>
      <form onSubmit={handleDeposit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <Input
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to deposit"
            required
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processing..." : "Create Deposit"}
        </Button>
      </form>

      {paymentUrl && (
        <div className="mt-8 text-center">
          <p className="mb-2 text-green-600 font-semibold">
            Scan QR code or click the link to pay:
          </p>
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {paymentUrl}
          </a>
          {/* Nếu muốn hiển thị QR code, có thể dùng thư viện qrcode.react */}
        </div>
      )}
    </div>
  );
};

export default Deposit;