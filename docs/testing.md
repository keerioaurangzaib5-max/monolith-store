# Monolith QA & Testing Guide

This document describes the quality assurance checklist and manual verification scripts to test the **Monolith** e-commerce workspace before launching.

---

## 1. Authentication Test Cases
- [ ] **Register Flow**: Sign up with a new email. Verify the password is hashed in database and user role defaults to `BUYER`.
- [ ] **Email Uniqueness**: Try registering with the same email. Verify a `400` error is returned.
- [ ] **Login Flow**: Log in with credentials. Check if a valid JWT token is returned and stored in local session.
- [ ] **Protected Routes**: Try to access `/admin` when logged in as a standard `BUYER`. Verify you are redirected back.

---

## 2. Shopping Cart & Calculations
- [ ] **Add to Cart**: Add products with selected size/color variants. Verify cart count updates in header.
- [ ] **Quantity Modifier**: Increase/decrease items. Check if price calculations update.
- [ ] **Coupon Verification**:
  - Apply `WELCOME10`. Confirm a 10% discount is deducted from the subtotal.
  - Test order below Rs. 2,000 threshold. Verify the coupon is rejected.
- [ ] **Sales Tax**: Check if GST (18%) is calculated correctly against the subtotal.
- [ ] **Shipping Thresholds**:
  - Test order total under Rs. 10,000. Verify shipping is Rs. 300.
  - Test order total over Rs. 10,000. Verify shipping is free (`Rs. 0`).

---

## 3. Shipping & Payment Gateways
- [ ] **Pakistan Address Validator**:
  - Test address addition. Input non-Pakistan phone number (e.g. 5 digits). Verify validation warning.
  - Select remote city. Apply Cash on Delivery (COD). Verify COD rejection warning block.
- [ ] **COD Limit Rule**: Place an order exceeding Rs. 50,000 using Cash on Delivery. Verify checkout blocks and requests direct bank transfer.
- [ ] **Direct Bank Transfer**:
  - Select Bank Transfer. Verify Monolith bank details display.
  - Submit simulated Transaction ID. Confirm order is marked `PENDING_VERIFICATION` in user logs.
- [ ] **Gateway Sandboxes**: Select JazzCash or Easypaisa. Place order. Verify sandbox automatically registers success and marks order `PAID`.

---

## 4. Admin Dashboard Moderation
- [ ] **Manual Bank Transfer Approval**:
  - Log in as admin (`admin@monolith.com`).
  - Open **Customer Orders** tab. Find the bank transfer order.
  - Select **Edit status log** and approve the payment status to `PAID`. Verify status changes to `PROCESSING`.
- [ ] **Review Moderation**:
  - Submit review on detail page.
  - Open **Reviews** tab in Admin Panel. Toggle moderation to hidden. Verify review disappears from catalog details.
- [ ] **Create Coupon**: Create a new discount code. Apply it in shopping cart to verify it is active.
