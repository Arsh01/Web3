import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, Transaction, VersionedTransaction } from '@solana/web3.js';

const TOKENS = [
    { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
    { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
    { symbol: 'RAY', name: 'Raydium', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 },
    { symbol: 'SRM', name: 'Serum', mint: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt', decimals: 6 },
    { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5 },
    { symbol: 'JTO', name: 'Jito', mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9wLs', decimals: 9 },
    { symbol: 'PYTH', name: 'Pyth Network', mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ88xaX3kG4KQ9MdxXe3', decimals: 6 },
    { symbol: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6 },
    { symbol: 'WIF', name: 'dogwifhat', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8MRB9Pk1KpZqKqKqK', decimals: 9 },
    { symbol: 'ORCA', name: 'Orca', mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', decimals: 6 },
    { symbol: 'JST', name: 'JUST', mint: 'JUSTjFyXHyXZqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', decimals: 9 },
    { symbol: 'SAMO', name: 'Samoyedcoin', mint: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', decimals: 9 },
    { symbol: 'COPE', name: 'COPE', mint: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh', decimals: 6 },
    { symbol: 'ROPE', name: 'ROPE', mint: '8PMHT4swUMtBzgHnh5U564N5sjPSiUz2cjEQzFnnP1Fo', decimals: 9 },
    { symbol: 'SNY', name: 'Synthetify', mint: '4dmKkXNHJmR1WpVzVWqQxVqXqXqXqXqXqXqXqXqXqXqX', decimals: 6 },
    { symbol: 'MER', name: 'Mercurial', mint: 'MERLu4BMky121E3FWwkPx9JUaK9vMxvXRd1tHfZbJc6', decimals: 6 },
    { symbol: 'SLRS', name: 'Solrise', mint: 'SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr', decimals: 6 },
    { symbol: 'PORT', name: 'Port Finance', mint: 'PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQucv', decimals: 6 },
    { symbol: 'ATLAS', name: 'Star Atlas', mint: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx', decimals: 8 }
];

export function Swap() {
    const [fromToken, setFromToken] = useState('SOL');
    const [toToken, setToToken] = useState('USDC');
    const [amount, setAmount] = useState('');
    const [conversionRate, setConversionRate] = useState(null);
    const [loading, setLoading] = useState(false);
    const wallet = useWallet();
    const { connection } = useConnection();

    const fetchQuote = async () => {
        if (!amount || amount <= 0) return;
        
        setLoading(true);
        try {
            const fromTokenInfo = TOKENS.find(t => t.symbol === fromToken);
            const toTokenInfo = TOKENS.find(t => t.symbol === toToken);
            
            if (!fromTokenInfo || !toTokenInfo) return;

            const inputAmount = (parseFloat(amount) * LAMPORTS_PER_SOL).toString();
            
            const response = await fetch(
                `https://quote-api.jup.ag/v6/quote?inputMint=${fromTokenInfo.mint}&outputMint=${toTokenInfo.mint}&amount=${inputAmount}&swapMode=ExactIn`
            );

            const data = await response.json();
            if (data.outAmount) {
                const fromTokenInfo = TOKENS.find(t => t.symbol === fromToken);
                const toTokenInfo = TOKENS.find(t => t.symbol === toToken);
                
                const inputInDecimals = parseFloat(inputAmount) / Math.pow(10, fromTokenInfo.decimals);
                const outputInDecimals = parseFloat(data.outAmount) / Math.pow(10, toTokenInfo.decimals);
                const rate = outputInDecimals / inputInDecimals;
                setConversionRate(rate);
            }
        } catch (error) {
            console.error('Error fetching quote:', error);
            setConversionRate(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (amount && fromToken && toToken) {
                fetchQuote();
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [amount, fromToken, toToken]);

    const handleSwap = async () => {
        if (!wallet.publicKey) {
            alert('Please connect your wallet first!');
            return;
        }

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            const fromTokenInfo = TOKENS.find(t => t.symbol === fromToken);
            const toTokenInfo = TOKENS.find(t => t.symbol === toToken);
            
            if (!fromTokenInfo || !toTokenInfo) {
                throw new Error('Invalid token selection');
            }

            const inputAmount = (parseFloat(amount) * Math.pow(10, fromTokenInfo.decimals)).toString();

            // Get quote
            const quoteResponse = await fetch(
                `https://quote-api.jup.ag/v6/quote?inputMint=${fromTokenInfo.mint}&outputMint=${toTokenInfo.mint}&amount=${inputAmount}&swapMode=ExactIn`
            );
            
            if (!quoteResponse.ok) {
                throw new Error('Failed to get quote from Jupiter');
            }
            
            const quoteData = await quoteResponse.json();

            // Get swap transaction
            const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quoteResponse: quoteData,
                    userPublicKey: wallet.publicKey.toString(),
                    wrapUnwrapSOL: true
                })
            });

            if (!swapResponse.ok) {
                throw new Error('Failed to get swap transaction from Jupiter');
            }

            const { swapTransaction } = await swapResponse.json();

            try {
                const swapTransactionBuf = Uint8Array.from(atob(swapTransaction), c => c.charCodeAt(0));
                const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
                
                // Sign the transaction
                const signedTx = await wallet.signTransaction(transaction);
                
                // Send the transaction
                const rawTransaction = signedTx.serialize();
                const signature = await connection.sendRawTransaction(rawTransaction, {
                    skipPreflight: false,
                    preflightCommitment: 'confirmed',
                    maxRetries: 3
                });

                // Wait for confirmation
                const latestBlockhash = await connection.getLatestBlockhash();
                const confirmation = await connection.confirmTransaction({
                    signature,
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                });

                if (confirmation.value.err) {
                    throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
                }

                alert('Swap successful! Transaction signature: ' + signature);
                // Reset amount after successful swap
                setAmount('');
                
            } catch (signError) {
                if (signError.message.includes('VersionedTransaction')) {
                    throw new Error('Your wallet does not support versioned transactions. Please use a newer wallet.');
                }
                throw signError;
            }
            
        } catch (error) {
            console.error('Swap error:', error);
            alert('Swap failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ color: 'white' }}>Swap Tokens</h2>
            <div className="input-group">
                <select 
                    className="token-select"
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value)}
                >
                    {TOKENS.map(token => (
                        <option key={token.symbol} value={token.symbol}>
                            {token.name} ({token.symbol})
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.000000001"
                />
            </div>

            <div className="input-group">
                <select 
                    className="token-select"
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value)}
                >
                    {TOKENS.map(token => (
                        <option key={token.symbol} value={token.symbol}>
                            {token.name} ({token.symbol})
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="conversion-rate">
                    <p>Loading rates...</p>
                </div>
            ) : conversionRate && (
                <div className="conversion-rate">
                    <p>Conversion Rate: 1 {fromToken} = {conversionRate.toFixed(6)} {toToken}</p>
                    {amount && (
                        <p>You will receive: {(amount * conversionRate).toFixed(6)} {toToken}</p>
                    )}
                </div>
            )}

            <button className="button" onClick={handleSwap} disabled={loading}>
                {loading ? 'Loading...' : 'Swap'}
            </button>
        </div>
    );
} 