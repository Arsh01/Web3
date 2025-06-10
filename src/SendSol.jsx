import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

export function SendSol() {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('');
    const wallet = useWallet();
    const { connection } = useConnection();

    const handleSend = async () => {
        if (!wallet.publicKey) {
            alert('Please connect your wallet first!');
            return;
        }

        try {
            if (!recipient || !amount) {
                alert('Please fill in all fields');
                return;
            }

            const recipientPubKey = new PublicKey(recipient);
            const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: recipientPubKey,
                    lamports: amountInLamports,
                })
            );

            const signature = await wallet.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'finalized');
            
            setStatus('Transaction successful!');
            setRecipient('');
            setAmount('');
        } catch (error) {
            console.error(error);
            setStatus('Transaction failed: ' + error.message);
        }
    };

    return (
        <div>
            <h2 style={{ color: 'white' }}>Send SOL</h2>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Recipient Address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount in SOL"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <button className="button" onClick={handleSend}>
                Send SOL
            </button>
            {status && <p className="status">{status}</p>}
        </div>
    );
} 