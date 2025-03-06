import { Context, Next } from 'hono'
import { sign, verify as jwtVerify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'
import { User } from '../types/db'
import { ExtendedJWTPayload } from '../types/app';


// JWT验证函数
export const verify = async (token: string, jwtSecret: string): Promise<ExtendedJWTPayload> => {
  return await jwtVerify(token, jwtSecret) as ExtendedJWTPayload;
};

// 生成JWT令牌
export const generateToken = async (user: User, jwtSecret: string): Promise<string> => {
  const payload: ExtendedJWTPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7天过期
  }
  
  return await sign(payload, jwtSecret)
}

// 验证JWT中间件
export const jwtAuth = async (c: Context, next: Next) => {
  // 从请求头或Cookie中获取令牌
  const authHeader = c.req.header('Authorization')
  const token = authHeader ? authHeader.split(' ')[1] : getCookie(c, 'auth_token')
  
  if (!token) {
    return c.json({ error: '未授权' }, 401)
  }
  
  try {
    // 验证令牌
    const payload = await verify(token, c.env.JWT_SECRET) as ExtendedJWTPayload
    // 将用户信息存储在上下文中
    c.set('user', payload)
    
    await next()
  } catch (error) {
    return c.json({ error: '无效的令牌' }, 401)
  }
}

// 检查是否为管理员
export const adminOnly = async (c: Context, next: Next) => {
  const user = c.get('user')

  if (user.role !== 'admin') {
    return c.json({ error: '需要管理员权限' }, 403)
  }
  
  await next()
}

// 检查是否为作者或管理员
export const authorOrAdminOnly = async (c: Context, next: Next) => {
  const user = c.get('user')
  const author = c.req.param('author') || c.req.query('author')
  
  if (user.role !== 'admin' && user.username !== author) {
    return c.json({ error: '没有权限' }, 403)
  }
  
  await next()
}
