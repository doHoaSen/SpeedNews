-- 1️⃣ 휴대폰 OTP 테이블 제거 (존재할 경우만)
DROP TABLE IF EXISTS phone_otp CASCADE;

-- 2️⃣ app_user 테이블에서 phone_verified 컬럼 제거
ALTER TABLE app_user
DROP COLUMN IF EXISTS phone_verified;

-- 3️⃣ email_verification 테이블 token 컬럼 길이 확장
ALTER TABLE email_verification
ALTER COLUMN token TYPE VARCHAR(512);
