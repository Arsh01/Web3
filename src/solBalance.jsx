import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function GetSolBalance({ onBalanceUpdate }) {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState(null);

    const updateBalance = async () => {
        if (wallet.publicKey) {
            const balance = await connection.getBalance(wallet.publicKey);
            const solBalance = balance / LAMPORTS_PER_SOL;
            setBalance(solBalance);
            if (onBalanceUpdate) {
                onBalanceUpdate(solBalance);
            }
        }
    };

    useEffect(() => {
        updateBalance();
        // Set up an interval to update balance every 10 seconds
        const interval = setInterval(updateBalance, 10000);
        return () => clearInterval(interval);
    }, [wallet.publicKey]);

    return (
        <div>
            <span>Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : '0 SOL'}</span>
        </div>
    );
}