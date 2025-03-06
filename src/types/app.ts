
export type Variables = {
  user: ExtendedJWTPayload;
};
export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  GRAVATAR_BASE_URL: string;
};

export interface ExtendedJWTPayload {
    id: number;
    username: string; 
    role: string;
    exp?: number;
    nbf?: number;
    iat?: number;
    [key: string]: any; // 添加索引签名以满足 Hono 的 JWTPayload 要求
  }