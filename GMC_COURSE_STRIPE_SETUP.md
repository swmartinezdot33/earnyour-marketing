# GMC Course - Stripe Product Setup

## Quick Setup

Follow these steps to create the Stripe product for the GMC course.

---

## Step 1: Go to Stripe Dashboard

Navigate to: https://dashboard.stripe.com/products

---

## Step 2: Create New Product

Click **+ Add product**

### Fill in Product Details:

**Basic Information:**
- **Name:** `Total Google My Business Optimization Course`
- **Description:** `Master Google My Business setup and optimization to generate organic leads. A comprehensive walkthrough with video tutorials covering profile optimization, review management, photos, posts, and more.`

**Pricing:**
- **Pricing Model:** `Standard Pricing`
- **Price:** `39.00` USD
- **Billing Period:** `One-time` (not recurring)

**Optional:**
- **Tax code:** `txn_31000000` (Digital Services - Leave as default)
- **Taxable:** Off (or on, depending on your tax requirements)

### Click **Save Product**

---

## Step 3: Get Product IDs

After creating the product, you'll see:

**Product ID (stripe_product_id):**
- Format: `prod_XXXXXXXXXX`
- Example: `prod_1234567890ABC`
- Location: Visible on the product page

**Price ID (stripe_price_id):**
- Format: `price_XXXXXXXXXX`
- Example: `price_1234567890ABC`
- Location: Click the price in the "Pricing" section to see the Price ID

### Save Both IDs

Copy and save:
```
stripe_product_id = prod_XXXXXXXXXX
stripe_price_id = price_XXXXXXXXXX
```

---

## Step 4: Link to Course in Admin

1. Go to `/admin/courses`
2. Find "Total Google My Business Optimization Course"
3. Click **Edit** or **Builder**
4. Scroll to "Stripe Integration" section
5. Paste:
   - `stripe_product_id` → Product ID field
   - `stripe_price_id` → Price ID field
6. Click **Save**

---

## Step 5: Test Checkout

1. Visit the course landing page: `/courses/total-google-my-business-optimization-course/landing`
2. Click **Enroll Now**
3. Verify Stripe checkout loads
4. Use Stripe test card: `4242 4242 4242 4242`
5. Any future expiry date (e.g., 12/25)
6. Any 3-digit CVC
7. Complete test purchase

---

## Reference: Stripe Product Details

### Product Name Variations
Use one of these if preferred:
- `GMB Optimization Masterclass` (shorter)
- `Google My Business Setup Course` (more specific)
- `Local Business GMB Training` (audience-focused)

### Recommended Product Settings

**Image (Optional but recommended):**
- Upload a 300x300px image
- GMB logo or course thumbnail
- Helps in payment receipts

**Features/Metadata:**
- Duration: "3-4 hours"
- Format: "Online Course with Videos"
- Access: "Lifetime"

---

## Verification Checklist

After setup, verify:

- [ ] Product created in Stripe
- [ ] Price set to $39.00
- [ ] Billing is one-time (not recurring)
- [ ] Product ID copied
- [ ] Price ID copied
- [ ] IDs pasted in course admin
- [ ] Course published
- [ ] Test transaction succeeds
- [ ] Receipt shows correct product name
- [ ] Landing page shows Stripe checkout button

---

## Troubleshooting

### "Price ID not found"
**Solution:** In Stripe dashboard, click on the $39.00 price in the product page. The Price ID should be visible there.

### "Checkout shows wrong amount"
**Solution:** Verify the Price ID (not Product ID) is in the `stripe_price_id` field. Sometimes people swap them.

### "Payment test fails"
**Solution:** 
1. Make sure you're using a test stripe key, not production
2. Use the test card: 4242 4242 4242 4242
3. Check that "restricted" is not enabled in Stripe API keys

### "Course doesn't appear in purchase history"
**Solution:**
1. Make sure `stripe_product_id` matches exactly
2. Verify course is published
3. Check that user is logged in when purchasing

---

## Next Steps

After Stripe is set up:

1. ✅ Add course content (videos, text, etc.)
2. ✅ Publish the course
3. ✅ Test purchase flow
4. ✅ Promote the course
5. ✅ Monitor sales and completion rates

---

## Support

If you encounter issues:
- Check Stripe Dashboard: https://dashboard.stripe.com/test/dashboard
- View API Keys: https://dashboard.stripe.com/apikeys
- Check Logs: https://dashboard.stripe.com/logs
- Stripe Documentation: https://stripe.com/docs

---

**Status:** Ready for setup  
**Last Updated:** January 2026
