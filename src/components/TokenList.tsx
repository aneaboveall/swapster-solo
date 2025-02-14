
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getTokenList, getTokenPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

interface Token {
  mint: string;
  symbol: string;
  balance: number;
  price: number;
  decimals: number;
  selected?: boolean;
}

export function TokenList({
  onSelectionChange,
}: {
  onSelectionChange: (tokens: Token[]) => void;
}) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadTokens() {
      if (!publicKey) return;

      setLoading(true);
      try {
        // Fetch all token accounts owned by the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        const tokenList = await getTokenList();
        const tokenMap = tokenList.reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map());

        // Process token accounts and fetch prices
        const tokenPromises = tokenAccounts.value.map(async (accountInfo) => {
          const tokenAmount = accountInfo.account.data.parsed.info.tokenAmount;
          const mintAddress = accountInfo.account.data.parsed.info.mint;
          const tokenInfo = tokenMap.get(mintAddress);
          const price = await getTokenPrice(mintAddress);

          return {
            mint: mintAddress,
            symbol: tokenInfo?.symbol || "Unknown",
            balance: tokenAmount.uiAmount || 0,
            decimals: tokenAmount.decimals,
            price: price,
            selected: false,
          };
        });

        const loadedTokens = await Promise.all(tokenPromises);
        // Filter out tokens with zero balance
        const filteredTokens = loadedTokens.filter(token => token.balance > 0);
        console.log('Loaded tokens:', filteredTokens);
        setTokens(filteredTokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTokens();
  }, [publicKey, connection]);

  const filteredTokens = tokens.filter((token) => {
    const matchesPrice = !minPrice || token.price >= parseFloat(minPrice);
    const matchesSearch =
      !searchQuery ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPrice && matchesSearch;
  });

  const handleTokenSelect = (token: Token) => {
    const updatedTokens = tokens.map((t) =>
      t.mint === token.mint ? { ...t, selected: !t.selected } : t
    );
    setTokens(updatedTokens);
    onSelectionChange(updatedTokens.filter((t) => t.selected));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Input
          type="number"
          placeholder="Min price in USD"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTokens.map((token) => (
              <TableRow key={token.mint} className="hover:bg-accent/50">
                <TableCell>
                  <Checkbox
                    checked={token.selected}
                    onCheckedChange={() => handleTokenSelect(token)}
                  />
                </TableCell>
                <TableCell>{token.symbol}</TableCell>
                <TableCell>{token.balance.toFixed(4)}</TableCell>
                <TableCell>${token.price.toFixed(2)}</TableCell>
                <TableCell>
                  ${(token.balance * token.price).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
