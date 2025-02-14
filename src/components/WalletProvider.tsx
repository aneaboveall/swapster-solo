
import { WalletError } from "@solana/wallet-adapter-base";
import {
  WalletProvider as SolanaWalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { ReactNode, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
// Import the styles directly
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  const onError = useCallback(
    (error: WalletError) => {
      toast({
        variant: "destructive",
        title: "Wallet Error",
        description: error.message || "An unknown error occurred",
      });
    },
    [toast]
  );

  return (
    <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
      <SolanaWalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
