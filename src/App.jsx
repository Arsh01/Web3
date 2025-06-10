import React, { useState } from 'react';
import './App.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { Airdrop } from './Airdrop';
import { Swap } from './Swap';
import { SendSol } from './SendSol';
import { GetSolBalance } from './solBalance';
import { TokenLaunchpad } from './CreateToken';

import '@solana/wallet-adapter-react-ui/styles.css';

const App = () => {
    const [activePage, setActivePage] = useState('airdrop');
    const [balance, setBalance] = useState(null);

    const renderContent = () => {
        switch (activePage) {
            case 'airdrop':
                return <Airdrop onBalanceUpdate={setBalance} />;
            case 'swap':
                return <Swap />;
            case 'send':
                return <SendSol onBalanceUpdate={setBalance} />;
            case 'create':
                return <TokenLaunchpad />;
            default:
                return <Airdrop onBalanceUpdate={setBalance} />;
        }
    };

    return (
        <ConnectionProvider endpoint={"https://solana-devnet.g.alchemy.com/v2/KrNDauaJFlIlyhNfmnkszcfrarMHTVAd"}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    <div className="app-container">
                        <header className="header">
                            <div className="wallet-section">
                                <WalletMultiButton />
                                <WalletDisconnectButton />
                            </div>
                            <div className="balance-section">
                                <GetSolBalance onBalanceUpdate={setBalance} />
                            </div>
                        </header>

                        <div className="main-content">
                            <div className="sidebar">
                                <div 
                                    className={`sidebar-option ${activePage === 'airdrop' ? 'active' : ''}`}
                                    onClick={() => setActivePage('airdrop')}
                                >
                                    Request Airdrop
                                </div>
                                <div 
                                    className={`sidebar-option ${activePage === 'swap' ? 'active' : ''}`}
                                    onClick={() => setActivePage('swap')}
                                >
                                    Swap Tokens
                                </div>
                                <div 
                                    className={`sidebar-option ${activePage === 'send' ? 'active' : ''}`}
                                    onClick={() => setActivePage('send')}
                                >
                                    Send SOL
                                </div>
                                <div 
                                    className={`sidebar-option ${activePage === 'create' ? 'active' : ''}`}
                                    onClick={() => setActivePage('create')}
                                >
                                    Create Token
                                </div>
                            </div>
                            <div className="content-area">
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default App;
