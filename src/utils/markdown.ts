import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// 配置 marked 选项
marked.setOptions({
  breaks: true,        // 将换行符转换为 <br>
  gfm: true,           // 启用 GitHub 风格的 Markdown
  headerIds: true,     // 为标题添加 id
  mangle: false,       // 不转义标题中的内容
  smartLists: true,    // 使用更智能的列表行为
  smartypants: true,   // 使用更智能的标点符号
});

// 配置 sanitize-html 选项，定义允许的标签和属性
const sanitizeOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span',
    'del', 'ins', 'sup', 'sub'
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
    div: ['class', 'id'],
    span: ['class', 'id'],
    code: ['class'],
    pre: ['class'],
    table: ['class'],
    th: ['scope'],
    '*': ['id', 'class']
  },
  selfClosing: ['img', 'br', 'hr'],
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: true
};

/**
 * 将 Markdown 文本转换为安全的 HTML
 * @param markdown Markdown 格式的文本
 * @returns 安全的 HTML 字符串
 */
export function parseMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  // 将 Markdown 转换为 HTML
  const rawHtml = marked.parse(markdown);
  
  // 清理 HTML 以防止 XSS 攻击
  const cleanHtml = sanitizeHtml(rawHtml, sanitizeOptions);
  
  return cleanHtml;
}
