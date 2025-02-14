
import { Connection, PublicKey } from "@solana/web3.js";
import { TokenListProvider } from "@solana/spl-token-registry";
import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const JUPITER_API = "https://quote-api.jup.ag/v6";
export const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/search";
export const OUTPUT_TOKEN = "So11111111111111111111111111111111111111112"; // SOL
export const SLIPPAGE = 0.5; // 0.5% slippage

export const connection = new Connection("https://api.mainnet-beta.solana.com");

export async function getTokenList() {
  const tokenList = await new TokenListProvider().resolve();
  return tokenList.filterByClusterSlug("mainnet-beta").getList();
}

export async function getTokenPrice(mintAddress: string) {
  try {
    const response = await axios.get(`${DEXSCREENER_API}?q=${mintAddress}`);
    if (response.data.pairs && response.data.pairs.length > 0) {
      // Find the first Solana pair
      const solanaPair = response.data.pairs.find((pair: any) => pair.chainId === 'solana');
      if (solanaPair) {
        return parseFloat(solanaPair.priceUsd) || 0;
      }
    }
    return 0;
  } catch (error) {
    console.error("Error fetching price from DexScreener:", error);
    return 0;
  }
}

export async function getTokenMetadata(mintAddress: string) {
  try {
    const response = await axios.get(`${DEXSCREENER_API}?q=${mintAddress}`);
    if (response.data.pairs && response.data.pairs.length > 0) {
      const solanaPair = response.data.pairs.find((pair: any) => pair.chainId === 'solana');
      if (solanaPair) {
        return {
          symbol: solanaPair.baseToken.symbol || 'Unknown',
          name: solanaPair.baseToken.name || 'Unknown Token',
          imageUrl: solanaPair.info?.imageUrl || null
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return null;
  }
}

export async function getTokenBalances(publicKey: PublicKey) {
  try {
    const balances = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });
    return balances.value;
  } catch (error) {
    console.error("Error fetching balances:", error);
    return [];
  }
}
