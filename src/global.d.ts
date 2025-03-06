import 'typed-htmx'
import { D1Database } from '@cloudflare/workers-types'

declare module 'hono/jsx' {
  namespace JSX {
    interface HTMLAttributes extends HtmxAttributes { }
  }
}

declare module 'hono' {
  interface ContextRenderer {
    (
      children: any,
      head: { title: string,user?: ExtendedJWTPayload | null,enableMarkdownEditor?: boolean },
      
    ): Response | Promise<Response>
  }
  
  interface Env {
    DB: D1Database
  }
}