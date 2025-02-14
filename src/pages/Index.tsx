
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { TokenList } from "@/components/TokenList";
import { SwapProgress } from "@/components/SwapProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const { connected } = useWallet();
  const [selectedTokens, setSelectedTokens] = useState<any[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: "" });

  const handleSwap = async () => {
    if (selectedTokens.length === 0) return;

    setIsSwapping(true);
    setProgress({ current: 0, total: selectedTokens.length, status: "Starting swaps..." });

    // Implement your swap logic here
    // Update progress as swaps complete
    // Handle errors appropriately

    setIsSwapping(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Solana Token Swapper</h1>
          <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
        </header>

        {connected ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenList onSelectionChange={setSelectedTokens} />
              </CardContent>
            </Card>

            <div className="flex flex-col items-center gap-4">
              {isSwapping && (
                <Card className="w-full max-w-md">
                  <CardContent className="pt-6">
                    <SwapProgress {...progress} />
                  </CardContent>
                </Card>
              )}

              <Button
                size="lg"
                disabled={selectedTokens.length === 0 || isSwapping}
                onClick={handleSwap}
                className="min-w-[200px]"
              >
                {isSwapping
                  ? "Swapping..."
                  : `Swap ${selectedTokens.length} Selected Tokens`}
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              <p className="text-lg text-muted-foreground">
                Connect your wallet to view and swap tokens
              </p>
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
