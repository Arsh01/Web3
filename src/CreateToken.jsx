import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { 
    SystemProgram, 
    Transaction, 
    PublicKey, 
    Keypair,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { MINT_SIZE, TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, mintTo, getOrCreateAssociatedTokenAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';

export function TokenLaunchpad() {

    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [initialSupply, setInitialSupply] = useState('');
    const [decimals, setDecimals] = useState('9');
    const [loading, setLoading] = useState(false);
    const wallet = useWallet();
    const { connection } = useConnection();

    const handleCreateToken = async () => {
        try {
        setLoading(true);
        const mintKeypair = Keypair.generate();
        const metadata = {
            mint: mintKeypair.publicKey,
            name: tokenName,
            symbol: tokenSymbol.padEnd(8, ' '),
            uri: imageUrl,
            additionalMetadata: [],
        };

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, Number(decimals), wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );
            
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);

        await wallet.sendTransaction(transaction, connection);

        console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
        const associatedToken = getAssociatedTokenAddressSync(
            mintKeypair.publicKey,
            wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
        );

        console.log(`Associated Token Account: ${associatedToken.toBase58()}`);

        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                mintKeypair.publicKey,
                TOKEN_2022_PROGRAM_ID,
            ),
        );

        await wallet.sendTransaction(transaction2, connection);

        const amount = BigInt(Number(initialSupply) * 10 ** Number(decimals));

        const transaction3 = new Transaction().add(
            createMintToInstruction(mintKeypair.publicKey, associatedToken, wallet.publicKey, amount, [], TOKEN_2022_PROGRAM_ID)
        );

        await wallet.sendTransaction(transaction3, connection);

        console.log("Minted!")
        alert("Token created successfully!");

    } catch (err) {
        console.error("Token creation failed:", err);
        alert("Failed to create token.");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="create-token-container">
            <h2 style={{ color: 'white' }}>Create New Token</h2>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Token Name"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                />
            </div>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Token Symbol"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                />
            </div>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />
            </div>
            <div className="input-group">
                <input
                    type="number"
                    placeholder="Initial Supply"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(e.target.value)}
                    min="0"
                    step="0.000000001"
                />
            </div>
            <div className="input-group">
                <select
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                >
                    <option value="9">9 decimals</option>
                    <option value="8">8 decimals</option>
                    <option value="7">7 decimals</option>
                    <option value="6">6 decimals</option>
                    <option value="5">5 decimals</option>
                    <option value="4">4 decimals</option>
                    <option value="3">3 decimals</option>
                    <option value="2">2 decimals</option>
                    <option value="1">1 decimals</option>
                </select>
            </div>
            <button 
                className="button" 
                onClick={handleCreateToken} 
                disabled={loading}
            >
                {loading ? 'Creating Token...' : 'Create Token'}
            </button>
        </div>
    );
}