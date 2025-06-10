import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import './App.css';

export function Airdrop({ onBalanceUpdate }) {
    const wallet = useWallet();
    const { connection } = useConnection();

    async function handleAirdrop() {
        try {
            if (!wallet.publicKey) {
                alert("Please connect your wallet first!");
                return;
            }
            const amount = document.getElementById("amount").value;
            if (!amount || amount <= 0) {
                alert("Please enter a valid amount");
                return;
            }
            await connection.requestAirdrop(wallet.publicKey, amount * LAMPORTS_PER_SOL);
            alert("Airdrop successful!");
            
            if (onBalanceUpdate) {
                const balance = await connection.getBalance(wallet.publicKey);
                onBalanceUpdate(balance / LAMPORTS_PER_SOL);
            }
        } catch (error) {
            console.error(error);
            alert("Airdrop failed: " + error.message);
        }
    }

    return (
        <div>
            <h2 style={{ color: 'white' }}>Request Airdrop</h2>
            <div className="input-group">
                <input
                    id="amount"
                    type="number"
                    placeholder="Enter SOL to request"
                    min="0"
                    step="0.1"
                />
                <button className="button" onClick={handleAirdrop}>
                    Request Airdrop
                </button>
            </div>
        </div>
    );
}