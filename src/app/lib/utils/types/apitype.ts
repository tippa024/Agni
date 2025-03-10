export interface APIOptions {
  method: "POST" | "GET";
  headers: {
    "Content-Type": string;
  };
  body?: any;
  keepAlive?: boolean;
}
