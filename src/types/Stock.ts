export interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  companyName?: string;
}

export interface StockAPIResponse {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // high price
  l: number;  // low price
  o: number;  // open price
  pc: number; // previous close
}