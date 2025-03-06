-- 更新用户表，将avatar字段存储email_hash
-- 首先确保所有用户都有email_hash
UPDATE users 
SET email_hash = (
  CASE 
    WHEN email_hash IS NULL OR email_hash = '' 
    THEN LOWER(HEX(RANDOMBLOB(16))) 
    ELSE email_hash 
  END
)
WHERE email_hash IS NULL OR email_hash = '';

-- 更新avatar字段为email_hash
UPDATE users
SET avatar = email_hash
WHERE avatar IS NOT NULL;
