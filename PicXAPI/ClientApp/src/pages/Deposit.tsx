import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
        `${API_BASE_URL}/api/wallet/deposit`,
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
    < >
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Deposit to Wallet</h1>
      <h3 className="text-lg font-semibold mb-4">Enter the amount you want to deposit:</h3>
      <form onSubmit={handleDeposit} className="flex p-4">
        <div className="w-full mr-4">
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
        <div className="flex items-center space-x-1 text-lg font-semibold">
          <span className="text-gray-600">.000</span>
          <span className="text-gray-600">VND</span>
        </div>
        <div className="w-full flex justify-end">
          <Button type="submit" className="w-[200px]" disabled={loading}>
            {loading ? "Processing..." : "Create Deposit"}
          </Button>
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
      </form>

      {paymentUrl && (
         <div className="mt-8 text-center">
          <iframe
            src={paymentUrl}
            title="PayOS Payment"
            className="w-full h-[700px] mx-auto rounded-lg border"
            allow="payment"
          />
          <p className="mb-2">Scan QR code or click link to pay</p>
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Click here to pay
          </a>
          </div>
      )}
    </>
  );
};

export default Deposit;