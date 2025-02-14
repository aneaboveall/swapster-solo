
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

interface Token {
  mint: string;
  symbol: string;
  balance: number;
  price: number;
  decimals: number;
  selected?: boolean;
}

const API_URL = 'http://localhost:3001';

export function TokenList({
  onSelectionChange,
}: {
  onSelectionChange: (tokens: Token[]) => void;
}) {
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
        // Fetch tokens from backend API
        const response = await fetch(`${API_URL}/api/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicKey: publicKey.toString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }

        const data = await response.json();
        const tokenList = await getTokenList();
        const tokenMap = tokenList.reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map());

        // Process tokens and fetch prices
        const tokenPromises = data.tokens.map(async (token: any) => {
          const tokenInfo = tokenMap.get(token.mint);
          const price = await getTokenPrice(token.mint);

          return {
            mint: token.mint,
            symbol: tokenInfo?.symbol || "Unknown",
            balance: token.amount || 0,
            decimals: tokenInfo?.decimals || 0,
            price: price,
            selected: false,
          };
        });

        const loadedTokens = await Promise.all(tokenPromises);
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
  }, [publicKey]);

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
