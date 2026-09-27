# Security Specification & Threat Model for Bunkar Sanskriti

## 1. Data Invariants

- **Product Integrity**: Products cannot have negative prices or blank names. Only authenticated administrators can modify product pricing, images, or availability.
- **Order Protection & PII Isolation**: Customer names, phone numbers, delivery addresses, and WhatsApp order notes must not be readable by unauthenticated users or unauthorized third parties. Only administrators may query or list orders.
- **Order State Machine**: Newly placed orders must start with status `New`. Customers cannot forge order status directly to `Confirmed` or `Completed`.
- **Enquiry Integrity**: Enquiries must start with status `Pending`. Customer contact data is restricted to administrators.
- **Administrator Role Isolation**: Users cannot self-grant admin roles in `/admins/`. Admin access requires explicit verification (`newp23671@gmail.com` with `email_verified == true` or inclusion in `/admins/{uid}`).
- **Path Variable Validation**: All document IDs must adhere to `^[a-zA-Z0-9_\-]+$` and cannot exceed 128 characters.

---

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)

1. **Payload 1 (Ghost Field / Shadow Update on Product)**:
   Attempting to inject `isSuperUser: true` into a product update.
   `{ name: "Saree", isSuperUser: true }` -> Rejected by strict key validation.
2. **Payload 2 (Unverified Email Admin Spoofing)**:
   Attempting an admin write using `request.auth.token.email = 'newp23671@gmail.com'` but `email_verified = false`.
   -> Rejected because `email_verified == true` is required.
3. **Payload 3 (PII Blanket Read by Non-Admin)**:
   Unauthenticated or non-admin user querying `/orders/` collection or getting `/orders/{orderId}`.
   -> Rejected because `isAdmin()` is required to read orders.
4. **Payload 4 (Customer Forging Order Status)**:
   Customer creating an order with `{ status: "Completed" }`.
   -> Rejected because create only allows `status == "New"`.
5. **Payload 5 (Oversized Product Description - Denial of Wallet Attack)**:
   Creating or updating a product with a 2MB description string.
   -> Rejected by `.size() <= 5000` limit.
6. **Payload 6 (ID Poisoning / Path Traversal)**:
   Writing to document ID containing invalid characters or > 128 chars like `prod-../../../root`.
   -> Rejected by `isValidId()` pattern `^[a-zA-Z0-9_\-]+$`.
7. **Payload 7 (Customer Updating Order Notes or Total Amount)**:
   Attempting an unauthenticated `update` on an existing order to reduce totalAmount.
   -> Rejected because only `isAdmin()` can update orders.
8. **Payload 8 (Self-Assigned Admin Escalation)**:
   Standard user writing their own record into `/admins/{theirUid}` with `{ role: "admin" }`.
   -> Rejected because write to `/admins/` requires existing `isAdmin()`.
9. **Payload 9 (Product Price Underflow / Invalid Types)**:
   Attempting to set `price: "free"` (string) or negative price on a product.
   -> Rejected by type guard and validation bounds.
10. **Payload 10 (Settings Tampering)**:
    Non-admin user updating store contact numbers or WhatsApp phone in `/settings/global`.
    -> Rejected because write to `/settings/` requires `isAdmin()`.
11. **Payload 11 (Arbitrary Array Injection in Product Images)**:
    Updating product images with a list of 500 URLs.
    -> Rejected by array length boundary check `<= 20`.
12. **Payload 12 (Enquiry Status Tampering)**:
    Public user creating enquiry with `{ status: "Closed" }`.
    -> Rejected because create only allows `status == "Pending"`.

---

## 3. Test Runner Specification

All tests in `firestore.rules.test.ts` verify the above scenarios against the Firestore rules engine, ensuring 0 unauthorized bypasses.
