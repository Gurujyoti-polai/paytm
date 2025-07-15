import { useEffect, useState } from "react";
import axios from "axios";

type Transaction = {
  _id: string;
  from: string;
  to: string;
  amount: number;
  type: "credit" | "debit";
  status: string;
  createdAt?: string;
};

const Dashboard = () => {
  const [user, setUser] = useState<{ userId: string } | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchBalance();
      fetchTransactions();
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log("📡 Requesting /api/auth/me...");
      const { data } = await axios.get("http://localhost:5001/api/auth/me", {
        headers: authHeader,
      });
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  const fetchBalance = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5001/api/wallet/balance",
        {
          headers: authHeader,
        }
      );
      setBalance(data.balance);
    } catch (err) {
      console.log("Failed to fetch Balance", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5001/api/wallet/transactions",
        {
          headers: authHeader,
        }
      );
      setTransactions(data.transactions);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  };

  const handleSendMoney = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/wallet/send",
        { recipientEmail, amount },
        { headers: authHeader }
      );
      alert("Money sent!");
      fetchBalance();
      fetchTransactions();
    } catch (err) {
      console.error("Failed to send money", err);
    }
  };

  return (
    <div>
      <h1>Welcome {user?.userId}</h1>
      <h2>Balance: ₹{balance}</h2>

      <div>
        <h3>Send Money</h3>
        <input
          type="email"
          placeholder="Recipient Email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button onClick={handleSendMoney}>Send</button>
      </div>

      <div>
        <h3>Transactions</h3>
        <ul>
          {transactions.map((tx) => (
            <li key={tx._id}>
              {tx.type.toUpperCase()} ₹{tx.amount}{" "}
              {tx.type === "debit" ? `to ${tx.to}` : `from ${tx.from}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
