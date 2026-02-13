# Password Reset Feature Guide

## Overview
Complete password recovery system with OTP verification for secure account access recovery.

## Architecture

### Three-Step Reset Flow
1. **Email Request** → User enters their registered email
2. **OTP Verification** → User verifies 6-digit code sent to email (10-minute expiry)
3. **Password Reset** → User creates and confirms new password

### Security Implementation
- **OTP Expiry**: 10 minutes
- **Reset Token Expiry**: 15 minutes (for password update window)
- **Password Requirements**: Minimum 6 characters
- **Email Verification**: Uses nodemailer with Gmail SMTP
- **No Store Reset Links**: Uses token-based verification for better security

---

## Frontend Components

### Login Page (`/frontend/src/pages/Login.jsx`)
**Changes Made:**
- Added "Forgot Password?" link under password field
- Integrated modal with 3-step reset flow
- 3 states: `email`, `otp`, `password`
- Visual progress indicator
- Professional error/success messaging

**Forgot Password Modal Features:**
- ✅ Modal overlay with backdrop blur
- ✅ Step-by-step progress indicator
- ✅ Back button to return to email step
- ✅ Close button (X) to dismiss modal
- ✅ Input validation (OTP limited to 6 digits)
- ✅ Loading states during API calls
- ✅ Error messages with helpful context
- ✅ Success confirmations before proceeding

**State Management:**
```javascript
forgotStep: 'email' | 'otp' | 'password'
forgotEmail: string
otp: string (max 6 digits)
newPassword: string
confirmPassword: string
resetToken: string (received from backend)
forgotLoading: boolean
forgotError: string
forgotSuccess: string
```

---

## Backend Endpoints

### 1. POST `/api/auth/forgot-password`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "OTP sent to your email"
}
```

**Response (Error):**
```json
{
  "message": "User not found with this email"
}
```

**Process:**
- Generates 6-digit random OTP
- Saves OTP with 10-minute expiry to user record
- Sends beautiful HTML email with OTP code
- Returns success message

---

### 2. POST `/api/auth/verify-otp`
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "message": "OTP verified successfully",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error):**
```json
{
  "message": "OTP has expired or is invalid"
}
```

**Process:**
- Validates OTP against stored value
- Checks OTP expiry (10 minutes)
- Generates 15-minute JWT reset token
- Returns token for password reset step

**Important:** Frontend stores this token and sends it in next request

---

### 3. POST `/api/auth/reset-password`
**Request:**
```json
{
  "email": "user@example.com",
  "newPassword": "SecureNewPass123",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success):**
```json
{
  "message": "Password reset successfully"
}
```

**Response (Error):**
```json
{
  "message": "Reset token has expired. Please request a new OTP"
}
```

**Process:**
- Validates password length (6+ characters)
- Verifies JWT reset token validity (15-minute expiry)
- Hashes new password with bcrypt (10 salt rounds)
- Clears OTP and reset fields from user record
- Sends confirmation email with account details
- User can now login with new password

---

## Email Templates

### OTP Email
**Subject:** "Reset Your MindPulse Password"
- 🔐 Large OTP display (6 digits)
- ⏱️ 10-minute expiry warning
- 🔒 Security note about handling OTP privately
- Sender: MindPulse Team

### Password Reset Confirmation
**Subject:** "Your Password Has Been Reset"
- ✅ Success confirmation
- 📧 Account username reminder
- 🔐 Recommendation to update password manager
- 📝 Support contact information

---

## User Experience Flow

### Happy Path
```
1. User clicks "Forgot Password?" on Login page
2. Modal opens → Email Step
3. User enters email → API: POST /forgot-password
4. Success message: "OTP sent to your email"
5. Modal transitions → OTP Step
6. User pastes/types 6-digit OTP → API: POST /verify-otp
7. Success message: "OTP verified! Now set your password"
8. Modal transitions → Password Step
9. User enters new password twice → API: POST /reset-password
10. Success message: "Password reset successfully!"
11. Modal closes, User can login with new password
```

### Error Scenarios
**Scenario 1: Email not found**
- Error: "User not found with this email"
- User can try different email or return to login

**Scenario 2: OTP expires**
- Error: "OTP has expired or is invalid"
- User can click "Back to Email" and request new OTP

**Scenario 3: OTP is wrong**
- Error: "OTP is invalid"
- User can paste OTP again or request new one

**Scenario 4: Mismatched passwords**
- Error: "Passwords do not match"
- User can re-enter confirm password

**Scenario 5: Short password**
- Error: "Password must be at least 6 characters"
- User can enter stronger password

---

## Configuration Required

### Environment Variables (`.env`)
**Backend needs:**
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

**Setup Instructions:**
1. Create Google Account (if not using company Gmail)
2. Enable 2-Factor Authentication
3. Generate App Password (not regular password)
4. Copy App Password to EMAIL_PASS
5. Test by requesting OTP through UI

### Gmail SMTP Settings
- **Service:** Gmail
- **Host:** smtp.gmail.com
- **Port:** 587 (TLS)
- **Authentication:** App Password (not regular Gmail password)

**Why App Password?**
- Regular Gmail password blocked by Google for security
- App Password = 16-character token specific to this app
- Can be revoked without affecting Gmail account
- More secure than storing actual password

---

## Testing Checklist

### Frontend Testing
- [ ] Login page loads correctly
- [ ] "Forgot Password?" link visible and clickable
- [ ] Modal opens with email step
- [ ] Email validation works (requires @)
- [ ] Modal transitions between steps
- [ ] Progress indicator updates correctly
- [ ] "Back" button returns to email step
- [ ] Close (X) button dismisses modal
- [ ] Error messages display properly
- [ ] Success messages display properly
- [ ] Form fields disabled while loading
- [ ] Button text changes during loading

### Backend Testing (Postman/API Testing)
- [ ] POST /forgot-password with valid email → OTP generated
- [ ] POST /forgot-password with invalid email → Error message
- [ ] POST /verify-otp with correct OTP → Returns reset token
- [ ] POST /verify-otp with expired OTP → Error message
- [ ] POST /verify-otp with wrong OTP → Error message
- [ ] POST /reset-password with valid token → Password updated
- [ ] POST /reset-password with expired token → Error message
- [ ] POST /reset-password with short password → Error message
- [ ] Login with old password fails after reset
- [ ] Login with new password succeeds

### Email Testing
- [ ] OTP email received within 30 seconds
- [ ] OTP email displays correctly in inbox
- [ ] Confirmation email received after password reset
- [ ] Both emails have proper branding (MindPulse header)
- [ ] OTP email has expiry warning
- [ ] Confirmation email has security recommendations

### Security Testing
- [ ] OTP expires after 10 minutes
- [ ] Reset token expires after 15 minutes
- [ ] OTP used once cannot be reused
- [ ] Reset token from expired OTP cannot be used
- [ ] User cannot reset another user's password
- [ ] New password hashed with bcrypt before storing
- [ ] Email addresses case-insensitive in lookup

---

## Troubleshooting

### Issue: "OTP sent to your email" but no email received
**Solutions:**
1. Check spam/junk folder
2. Verify EMAIL_USER in `.env` is correct
3. Check EMAIL_PASS is valid App Password (not regular Gmail password)
4. Ensure 2-Factor Authentication enabled on Gmail
5. Check backend logs for email service errors
6. Test with temporary email service (Ethereal) instead of Gmail

### Issue: Modal not appearing when clicking "Forgot Password?"
**Solutions:**
1. Clear browser cache and reload
2. Check browser console for JavaScript errors
3. Verify Login.jsx saved without syntax errors
4. Rebuild frontend: `npm run build`
5. Test in incognito/private window

### Issue: OTP step shows "OTP has expired"
**Solutions:**
1. Verify 10-minute timer started immediately after OTP send
2. Check server time is correct (time zone issues)
3. Check MySQL datetime format matches code expectations
4. User arrived at email before OTP finished sending (unlikely)

### Issue: Password reset shows "Reset token has expired"
**Solutions:**
1. Verify OTP verification completed within 15 minutes
2. Reset token only valid for 15 minutes after OTP verified
3. If slow user, request new OTP and try again
4. Check server time is correct

---

## Future Enhancements

1. **Resend OTP Button**
   - "Didn't receive OTP?" → Click to send new one
   - Rate limiting (max 3 resends per hour)

2. **Password Strength Indicator**
   - Visual feedback as user types password
   - Entropy calculation (letters, numbers, special chars)

3. **Two-Factor Authentication (2FA)**
   - Optional TOTP (Time-based One-Time Password)
   - Backup codes for account recovery

4. **Email Verification on Signup**
   - Send verification email on account creation
   - Prevent fake email registration

5. **Password History**
   - Prevent reusing last 3 passwords
   - Track password change timestamps

6. **Login Notifications**
   - Email after successful login from new device
   - IP address tracking

7. **Social Login Integration**
   - "Login with Google/GitHub"
   - Reduces password reset needs

---

## Code Files Modified

### Files Added
- `/backend/utils/emailService.js` - Email utility with OTP and confirmation templates

### Files Modified
- `/frontend/src/pages/Login.jsx` - Added forgot password modal and state management
- `/backend/models/User.js` - Added resetOTP, resetOTPExpiry, resetTokenExpiry fields
- `/backend/routes/auth.js` - Added 3 new password reset routes

### Dependencies Added
- `nodemailer` - Email sending library (already installed)

---

## API Response Examples

### Success Flow Examples

**Step 1: Request OTP**
```
POST /api/auth/forgot-password
Body: { email: "john@example.com" }

Response: 200 OK
{
  "message": "OTP sent to your email"
}
```

**Step 2: Verify OTP**
```
POST /api/auth/verify-otp
Body: { 
  email: "john@example.com",
  otp: "123456"
}

Response: 200 OK
{
  "message": "OTP verified successfully",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ7..."
}
```

**Step 3: Reset Password**
```
POST /api/auth/reset-password
Body: { 
  email: "john@example.com",
  newPassword: "NewSecure123",
  resetToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ7..."
}

Response: 200 OK
{
  "message": "Password reset successfully"
}
```

---

## Support & Maintenance

For issues or questions:
1. Check this guide first
2. Review backend logs: `npm run dev` (backend console)
3. Check browser DevTools (Network tab for API calls)
4. Verify `.env` configuration
5. Check nodemailer service is accessible

---

**Last Updated:** 2024
**Status:** Production Ready ✅
**Version:** 1.0.0
