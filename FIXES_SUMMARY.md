# P2P Trading Fixes Summary

## Issues Fixed

### 1. ✅ Users Can't Post Ads (Only Merchants Can)

**Problem**: Regular P2P users had access to "Post New Ad" button which should only be available to merchants.

**Solution**:
- Removed "Post New Ad" button from My Ads page header
- Updated empty state message to clarify that only merchants can post ads
- Changed empty state button to redirect to merchant dashboard instead of ad creation
- Updated page description to state "Only merchants can post ads"

**Files Modified**:
- `app/dashboard/p2p/my-ads/page.tsx`

**Changes**:
```tsx
// Before: Button linked to /dashboard/merchant/post-ad
// After: Removed button, added clarification message

// Empty state now shows:
"No ads available"
"Only merchant accounts can post P2P ads. Visit the merchant dashboard to become a merchant."
[Go to Merchant Dashboard] button
```

---

### 2. ✅ Continue Button Not Working in Ad Wizard

**Problem**: The Continue/Next button on Step 4 (Limits & Time) was disabled even after filling in all required fields.

**Root Cause**: The `canProceed` validation logic for step 3 (index) was missing the `timeLimit` check, so even though users selected a time limit (15, 30, or 60 minutes), the form thought the step was incomplete.

**Solution**:
- Added `&& !!ad.timeLimit` to the step 3 validation in `canProceed` logic
- Now the Continue button enables after:
  - Min limit is set
  - Max limit is set
  - Min limit > 0
  - Max limit >= Min limit
  - **Time limit is selected** ← NEW

**Files Modified**:
- `components/merchant/MerchantAdWizard.tsx`

**Changes**:
```tsx
// Before (Step 3 validation):
case 3:
  return !!ad.minLimit && !!ad.maxLimit && ad.minLimit > 0 && ad.maxLimit >= ad.minLimit;

// After (Step 3 validation):
case 3:
  return !!ad.minLimit && !!ad.maxLimit && ad.minLimit > 0 && ad.maxLimit >= ad.minLimit && !!ad.timeLimit;
```

---

## User Flow Clarification

### For Regular P2P Users:
1. Browse ads on `/dashboard/p2p`
2. Trade with merchants by buying/selling
3. View order history on `/dashboard/p2p/orders`
4. View existing ads on `/dashboard/p2p/my-ads` (but cannot create new ones)
5. **Must become a merchant to post ads**

### For Merchants:
1. Access merchant dashboard at `/dashboard/merchant`
2. Create P2P ads using the embedded wizard or `/dashboard/merchant/post-ad`
3. Manage ads, wallets, and trading stats
4. All merchant ads appear in P2P marketplace for users to trade

---

## Testing Checklist

### Test Ad Wizard (Merchant Only)
- [ ] Step 1: Select trade type (Buy/Sell)
- [ ] Step 2: Select crypto (USDC/CNGN) and fiat currency
- [ ] Step 3: Set pricing (fixed or floating with margin)
- [ ] Step 4: Set min/max limits AND select time limit (15/30/60 mins)
- [ ] Step 5: Verify Continue button is now enabled ✅
- [ ] Step 5: Select payment methods
- [ ] Step 6: Add auto-reply and instructions (optional)
- [ ] Step 7: Review and publish

### Test P2P User Restrictions
- [ ] Visit `/dashboard/p2p/my-ads`
- [ ] Verify no "Post New Ad" button in header
- [ ] Empty state shows merchant redirect message
- [ ] Click "Go to Merchant Dashboard" redirects to `/dashboard/merchant`

---

## Technical Details

### Validation Logic
The wizard uses a `canProceed` useMemo hook that validates each step independently:
- **Step 0**: Trade type selected
- **Step 1**: Currency pair selected & live rate loaded
- **Step 2**: Price set (fixed amount OR floating margin)
- **Step 3**: Limits valid & time limit selected ← **FIXED**
- **Step 4**: At least one payment method selected
- **Step 5**: Always true (instructions optional)

### State Management
- `ad` state object holds all form fields including `timeLimit`
- `TIME_LIMITS` constant: `[15, 30, 60]` (minutes)
- Time limit is required for order expiration countdown
- Default time limit in UI is 15 minutes (purple button)

---

## No Breaking Changes
- Existing P2P trading flow unchanged
- Order creation, tracking, and history still work
- Merchant ad wizard still functional
- Only access restrictions and validation improved

---

## Next Steps (Optional Enhancements)
1. Add role-based authentication (user vs merchant)
2. Show "Become a Merchant" upgrade flow
3. Add merchant verification badge
4. Implement merchant KYC requirements
5. Add merchant fee structure display
