# API Testing Examples - Password Reset Flow

## Quick Testing with cURL Commands

### Prerequisites
- Backend running on `http://localhost:5000` (adjust port if different)
- User account created with email: `test@example.com` and password: `oldPassword123`
- Email service configured (check .env file)

---

## Step 1: Request OTP

### Request OTP
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Expected Response (200 OK)
```json
{
  "message": "OTP sent to your email. Valid for 10 minutes.",
  "success": true,
  "email": "test@example.com"
}
```

### What Happens Behind the Scenes
1. Backend generates random 6-digit OTP (e.g., 123456)
2. Saves OTP to database with 10-minute expiry
3. Sends OTP email to user
4. Returns success message

---

## Step 2: Verify OTP

**Important:** Copy the OTP from your email inbox

### Verify OTP Code
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

**Replace `123456` with the actual OTP from your email**

### Expected Response (200 OK)
```json
{
  "message": "OTP verified successfully",
  "success": true,
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzI1NTEyMzQsImV4cCI6MTczMjU1MTgzNH0.xyzABC123..."
}
```

### Save the Reset Token
Copy the `resetToken` value - you'll need it in the next step

### Error Responses

**Invalid OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "999999"
  }'
```

Response (400 Bad Request):
```json
{
  "message": "Invalid OTP"
}
```

**Expired OTP (after 10 minutes):**
```json
{
  "message": "OTP has expired. Please request a new one."
}
```

---

## Step 3: Reset Password

### Reset Password with Token
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "newPassword": "newSecurePassword123",
    "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzI1NTEyMzQsImV4cCI6MTczMjU1MTgzNH0.xyzABC123..."
  }'
```

**Replace `resetToken` with the token from Step 2**

### Expected Response (200 OK)
```json
{
  "message": "Password reset successfully",
  "success": true
}
```

### What Happens Behind the Scenes
1. Backend validates the JWT reset token (must be within 15 minutes)
2. Verifies email exists in database
3. Checks password is at least 6 characters
4. Hashes new password with bcrypt
5. Clears all OTP and reset fields
6. Sends confirmation email
7. Returns success message

---

## Verify Password Change Works

### Login with Old Password (Should Fail)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "oldPassword123"
  }'
```

Expected Response (400 Bad Request):
```json
{
  "message": "Invalid email or password"
}
```

### Login with New Password (Should Succeed)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "newSecurePassword123"
  }'
```

Expected Response (200 OK):
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Error Scenarios & How to Handle Them

### Scenario 1: Email Not Found
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com"
  }'
```

Response (200 OK - for security, doesn't reveal if email exists):
```json
{
  "message": "If an account exists with this email, you will receive an OTP shortly.",
  "success": true
}
```

### Scenario 2: OTP Expired (Waited 10+ minutes)
```bash
# Wait 10+ minutes from OTP request, then verify
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

Response (400 Bad Request):
```json
{
  "message": "OTP has expired. Please request a new one."
}
```

**Solution:** Go back to Step 1 and request a new OTP

### Scenario 3: Reset Token Expired (Waited 15+ minutes)
```bash
# Verified OTP, waited 15+ minutes, then try to reset
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "newPassword": "anotherPassword123",
    "resetToken": "expired-token-here"
  }'
```

Response (400 Bad Request):
```json
{
  "message": "Reset session expired. Please request a new OTP."
}
```

**Solution:** Go back to Step 1 and request a new OTP

### Scenario 4: Password Too Short
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "newPassword": "123",
    "resetToken": "valid-token-here"
  }'
```

Response (400 Bad Request):
```json
{
  "message": "Password must be at least 6 characters long"
}
```

**Solution:** Use password with at least 6 characters

---

## Testing with Postman

### 1. Create a New Collection: "MindPulse Auth"

### 2. Request 1: Get OTP
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/forgot-password`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "test@example.com"
  }
  ```
- **Click:** Send
- **Expected:** 200 OK with `resetToken`

### 3. Save OTP from Email
- Check your email inbox
- Copy the 6-digit OTP
- Paste into Postman for next request

### 4. Request 2: Verify OTP
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/verify-otp`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "test@example.com",
    "otp": "YOUR_6_DIGIT_OTP"
  }
  ```
- **Click:** Send
- **Expected:** 200 OK with `resetToken`
- **Save:** Copy the `resetToken` value

### 5. Request 3: Reset Password
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/reset-password`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "test@example.com",
    "newPassword": "newSecurePassword456",
    "resetToken": "PASTE_TOKEN_FROM_PREVIOUS_RESPONSE"
  }
  ```
- **Click:** Send
- **Expected:** 200 OK - Password reset successfully

### 6. Verify: Login with New Password
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "test@example.com",
    "password": "newSecurePassword456"
  }
  ```
- **Click:** Send
- **Expected:** 200 OK with authentication token

---

## Common Issues & Solutions

### Issue: Connection Refused
```
curl: (7) Failed to connect to localhost port 5000: Connection refused
```

**Solution:**
1. Verify backend server is running: `npm run dev` (in backend directory)
2. Check backend is running on correct port (default: 5000)
3. Check firewall isn't blocking localhost

### Issue: Email Not Received
1. Check `.env` file has correct EMAIL_USER and EMAIL_PASS
2. Check spam/junk folder
3. For Gmail: Verify App Password is used (not regular password)
4. Enable "Less secure app access" if needed (not recommended for production)

### Issue: Empty Response
```json
{}
```

**Solution:**
1. Check console logs in backend: `npm run dev`
2. Verify Content-Type header is `application/json`
3. Check request body is valid JSON

### Issue: Database Error
```
Error: Column 'resetOTP' doesn't exist in table 'Users'
```

**Solution:**
1. Verify User model migration ran: Check `backend/models/User.js`
2. Database might need reset if fields weren't created
3. Check MySQL database has the fields: 
   ```sql
   DESCRIBE users;
   ```

---

## Database Verification

### Check if Reset Fields Exist
```sql
-- Connect to your MySQL database
SELECT resetOTP, resetOTPExpiry, resetTokenExpiry FROM users WHERE email='test@example.com';
```

### Clear OTP (if needed)
```sql
UPDATE users SET resetOTP=NULL, resetOTPExpiry=NULL WHERE email='test@example.com';
```

### Test User Creation
```sql
INSERT INTO users (username, email, password) VALUES('testuser', 'test@example.com', 'hashed_password_here');
```

---

## Performance Testing

### Measure OTP Email Send Time
```bash
time curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected:** 1-5 seconds (depending on email service)

### Test Multiple Requests (Load Testing)
```bash
# Send 10 OTP requests
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\"}" &
done
wait
```

---

## Environment Variables for Testing

### Gmail SMTP (Production)
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password-16-chars
```

### Ethereal (Free Testing)
```
EMAIL_USER=test.email.ethereal@ethereal.email
EMAIL_PASS=ethereal-password-here
```

Get free Ethereal account at: https://ethereal.email/

---

## Postman Environment Variables

Create a Postman environment for easier testing:

```json
{
  "name": "MindPulse Dev",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000",
      "enabled": true
    },
    {
      "key": "email",
      "value": "test@example.com",
      "enabled": true
    },
    {
      "key": "resetToken",
      "value": "",
      "enabled": true
    },
    {
      "key": "otp",
      "value": "",
      "enabled": true
    }
  ]
}
```

Then use in requests:
- URL: `{{baseUrl}}/api/auth/forgot-password`
- Body: `{"email": "{{email}}"}`

---

## Automated Testing Script

### Node.js Test Script (`test-password-reset.js`)
```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'test@example.com';

async function testPasswordReset() {
  try {
    // Step 1: Request OTP
    console.log('1️⃣ Requesting OTP...');
    const otpResponse = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
      email: TEST_EMAIL
    });
    console.log('✅ OTP sent:', otpResponse.data);

    // In real test, would read OTP from email
    // For demo, using a placeholder
    const OTP = '123456';

    // Step 2: Verify OTP
    console.log('\n2️⃣ Verifying OTP...');
    const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
      email: TEST_EMAIL,
      otp: OTP
    });
    const resetToken = verifyResponse.data.resetToken;
    console.log('✅ OTP verified, token received');

    // Step 3: Reset Password
    console.log('\n3️⃣ Resetting password...');
    const resetResponse = await axios.post(`${BASE_URL}/api/auth/reset-password`, {
      email: TEST_EMAIL,
      newPassword: 'newPassword123',
      resetToken: resetToken
    });
    console.log('✅ Password reset:', resetResponse.data);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPasswordReset();
```

Run with:
```bash
node test-password-reset.js
```

---

## Quick Checklist for Complete Testing

- [ ] Backend server running (`npm run dev`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Email service configured (.env file set)
- [ ] Request OTP → Check email received
- [ ] Verify OTP → Get reset token
- [ ] Reset password → Success message
- [ ] Login with old password → Should fail
- [ ] Login with new password → Should succeed
- [ ] Test OTP expiry (wait 10+ minutes)
- [ ] Test token expiry (wait 15+ minutes)
- [ ] Test validation errors (wrong OTP, short password)

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Ready for Testing ✅
