-- 1. 在 posts 表中添加 comment_count 字段（如果不存在）
ALTER TABLE posts ADD COLUMN comment_count INTEGER DEFAULT 0;

-- 2. 更新 posts 表中的 comment_count 字段，基于 comments 表中的数据
UPDATE posts 
SET comment_count = (
    SELECT COUNT(*) 
    FROM comments 
    WHERE comments.post_id = posts.id
);

-- 3. 从 comments 表中删除 comment_count 字段
-- 创建一个临时表，不包含 comment_count 字段
CREATE TABLE comments_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT (DATETIME('now', 'utc')),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (author) REFERENCES users(username)
);

-- 将数据从原表复制到临时表
INSERT INTO comments_temp (id, post_id, content, raw_content, author, created_at)
SELECT id, post_id, content, raw_content, author, created_at FROM comments;

-- 删除原表
DROP TABLE comments;

-- 将临时表重命名为原表名
ALTER TABLE comments_temp RENAME TO comments;

-- 4. 创建触发器，在添加评论时自动更新帖子的评论计数
CREATE TRIGGER IF NOT EXISTS increment_post_comment_count
AFTER INSERT ON comments
BEGIN
    UPDATE posts 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.post_id;
END;

-- 5. 创建触发器，在删除评论时自动更新帖子的评论计数
CREATE TRIGGER IF NOT EXISTS decrement_post_comment_count
AFTER DELETE ON comments
BEGIN
    UPDATE posts 
    SET comment_count = CASE WHEN comment_count > 0 THEN comment_count - 1 ELSE 0 END 
    WHERE id = OLD.post_id;
END;
