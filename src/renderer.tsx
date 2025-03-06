import { jsxRenderer } from 'hono/jsx-renderer'
import { ExtendedJWTPayload } from './types';

interface HeaderProps {
  user?: ExtendedJWTPayload | null;
}


const Header = ({ user }: HeaderProps) => {
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <header>
      <nav>
        <ul>
          <li><strong>Acme Corp</strong></li>
          <li><a href="/" class="secondary">首页</a></li>
          <li><a href="/tags" class="secondary">标签</a></li>
          {isLoggedIn && (
            <>
              <li><a href="/posts/new" class="secondary">发布</a></li>
              <li><a href={`/posts?username=${user.username}`} class="secondary">{user.username}{isAdmin && '(管理员)'}</a></li>             
            </>
          )}
          {!isLoggedIn && (
            <>
              <li><a href="/user/reg" class="secondary">注册</a></li>
              <li><a href="/user/login" class="secondary">登录</a></li>
            </>
          )}
          {isLoggedIn && (
            <li><a href="/user/logout" class="secondary">退出</a></li>
          )}
        </ul>
      </nav>
    </header>
  )
}

export const renderer = jsxRenderer(({ children, title, user }) => {
  return (
    <html lang="zh_CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <title>{title}</title>
        <link rel="stylesheet" href="/static/main.css?v=1.0.1" />
        <link rel="icon" href="/static/favicon.ico" />
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.4/dist/htmx.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
      </head>
      <body un-cloak>
        <main className="mx-auto md:w-800px">
          <Header user={user} />
          {children}
        </main>
      </body>
    </html>
  )
})
