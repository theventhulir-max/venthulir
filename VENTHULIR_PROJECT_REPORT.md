# 🌿 Venthulir Organic E-Commerce — Complete Project Technical Report
**Project Name:** Venthulir (வெண்துளிர்)  
**Version:** 2.0.0 (Next.js Fullstack Architecture)  
**Document Generated:** September 2026  
**Confidential & Proprietary:** Venthulir Team  

---

## 1. Executive Summary & Brand Overview

**Venthulir** is a fullstack organic e-commerce web platform engineered specifically for **traditional wood cold-pressed oils, single-origin farm harvests, and organic grocery items** originating from Tamil Nadu.

The platform combines a customer-facing digital storefront with a back-office administration suite featuring inventory control, order fulfillment, automated WhatsApp & transactional email notifications, Razorpay payment processing, and coupon/offer engines.

### 🎨 Brand Identity & Design System (60-30-10 Rule)
- **60% Dominant Canvas:** Warm organic cream (`#FAF8F5`, `#FFFFFF`, `#F9F6F0`) giving an authentic farm feel.
- **30% Structure & Content:** Crisp dark charcoal typography (`#1A1A1A`, `#222222`, `#444444`) and subtle borders (`#EAE3D2`).
- **10% Brand Accent:** Signature Venthulir Brand Green (`#1B5E2F`, hover `#134522`, tint `#E8F5E9`) and Harvest Gold (`#C8973A`) on all CTAs, badges, and key interactive focal points.

---

## 2. Technology Stack & Architecture

### Core Technologies
- **Frontend Framework:** Next.js 15.2.0 (App Router) + React 19
- **Styling:** Pure Vanilla CSS with CSS Custom Property Tokens
- **Database:** MongoDB Atlas with Mongoose 8.9.0 (Connection pooling, indexed schemas)
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` encryption and OTP-based verification
- **Payment Gateway:** Razorpay SDK (UPI, Cards, Netbanking, QR with cryptographic HMAC-SHA256 verification)
- **Email Engine:** Dual-Engine Architecture (Resend API as primary driver with Nodemailer SMTP fallback)
- **Messaging Engine:** Direct WhatsApp Deep-Linking Engine (`api.whatsapp.com`) with emoji formatting
- **Animations & UX:** GSAP 3.15 + Lenis 1.3 Smooth Momentum Scrolling + Lucide React Icons

---

## 3. Database Architecture (9 Collections)

All database models are located in `src/models/`:

### 1. `Product` (`src/models/Product.js`)
- **Collection:** `ProductDetails`
- **Fields:** `productCode` (Auto `VNT-XXXXXX`), `name`, `price`, `originalPrice`, `discountPercent`, `description`, `hsnSac`, `slug`, `imageUrl`, `images[]`, `category`, `badge`, `shippingCharge`, `variants[{label, price, contents}]`, `comboContents[{item, weight}]`, `initialStock`, `currentStock`, `createdAt`, `updatedAt`.
- **Indexes:** `{ category: 1, createdAt: -1 }`, `{ badge: 1 }`, `{ currentStock: 1 }`, Text index on `{ name, description, productCode }`.

### 2. `Order` (`src/models/Order.js`)
- **Collection:** `OrderRegistry`
- **Fields:** `customerName`, `customerEmail`, `phone`, `deliveryAddress` (`{ address, city, state, zipCode }`), `items[]`, `originalAmount`, `discountAmount`, `shippingCharge`, `couponUsed`, `totalAmount`, `paymentMethod` (`Cash on Delivery` / `Razorpay`), `razorpayOrderId`, `razorpayPaymentId`, `status` (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`), `statusUpdatedAt`, `trackingNumber`, `courierPartner`, `createdAt`.
- **Indexes:** `{ customerEmail: 1, createdAt: -1 }`, `{ status: 1 }`, `{ createdAt: -1 }`.

### 3. `User` (`src/models/User.js`)
- **Collection:** `CustomerDetails`
- **Fields:** `name`, `email` (unique, lowercase), `phone`, `password` (bcrypt hash), `deliveryAddress` (`{ address, city, state, zipCode }`), `isEmailVerified`, `isAdmin` (boolean), `otp`, `otpExpires`, timestamps.

### 4. `Offer` (`src/models/Offer.js`)
- **Collection:** `OffersCollection`
- **Fields:** `name`, `description`, `imageUrl`, `images[]`, `price`, `offerPrice`, `mrpIllusion`, `discountPercent`, `category`, `badge`, `stock`, `rating`, `condition`, `comboContents`, `startDate`, `endDate`, `isActive`.
- **Virtuals:** `status` dynamically computed (`Active`, `Upcoming`, `Expired`, `Stock Over`, `Inactive`).

### 5. `Coupon` (`src/models/Coupon.js`)
- **Collection:** `Coupons`
- **Fields:** `couponCode` (uppercase, unique), `productId` (optional item-specific link), `maxUses`, `usedCount`, `expiryDate`, `status` (`Active`/`Inactive`), `discountPercentage` (1–100%).

### 6. `Settings` (`src/models/Settings.js`)
- **Fields:** `key: 'global_settings'`, `storeName`, `tagline`, `supportEmail`, `supportPhone`, `address`, `adminNotificationEmail`, `defaultShippingFee`, `freeShippingThreshold` (₹499), `enableCOD`, `enableOnlinePayment`, `socialLinks`, `announcementText`, `announcementActive`.

### 7. `OtpStore` (`src/models/OtpStore.js`)
- **Fields:** `email`, `otpHash`, `type` (`register`, `login`, `reset`), `verified`, `expiresAt`.
- **TTL Index:** `{ expiresAt: 1 }` with `{ expireAfterSeconds: 0 }` (MongoDB auto-deletes expired OTP documents).

### 8. `Message` (`src/models/Message.js`)
- **Collection:** `ContactInquiries`
- **Fields:** `name`, `email`, `phone`, `subject`, `message`, `isRead`, `createdAt`.

### 9. `ActivityLog` (`src/models/ActivityLog.js`)
- **Collection:** `ActivityLogs`
- **Fields:** `userId`, `userName`, `action`, `method`, `url`, `timestamp`.

---

## 4. API Endpoints Map (`/src/app/api`)

| Category | Endpoint | Method | Purpose |
|---|---|---|---|
| **Auth** | `/api/auth/login` | POST | Authenticate user & issue JWT |
| | `/api/auth/register` | POST | Register new user account |
| | `/api/auth/send-register-otp` | POST | Dispatch signup verification OTP |
| | `/api/auth/verify-register-otp` | POST | Verify signup OTP |
| | `/api/auth/forgot-password` | POST | Send 6-digit password reset OTP email |
| | `/api/auth/verify-otp` | POST | Verify password reset OTP code |
| | `/api/auth/reset-password` | POST | Update user password |
| | `/api/auth/me` | GET | Validate active session |
| | `/api/auth/profile` | PUT | Update name and phone |
| | `/api/auth/address` | PUT | Update default shipping address |
| **Products** | `/api/products` | GET/POST/PUT/DELETE | Product CRUD, variant & stock management |
| **Orders** | `/api/orders` | GET/POST | Create order / Admin list orders |
| | `/api/orders/[id]` | GET/PUT | Single order details & status update |
| | `/api/orders/my-orders` | GET | Customer personal order history |
| **Payments** | `/api/payment/create-order` | POST | Initialize Razorpay payment order |
| | `/api/payment/verify` | POST | Verify HMAC-SHA256 payment signature |
| **Offers** | `/api/offers` | GET/POST/PUT/DELETE | Flash sale deals & countdown management |
| **Coupons** | `/api/coupons` | GET/POST/PUT/DELETE | Promo discount coupon management |
| **Admin** | `/api/admin/stats` | GET | Dashboard revenue, order counts & low-stock alerts |
| | `/api/admin/settings` | GET/PUT | Store settings & shipping thresholds |
| | `/api/admin/users` | GET | Customer directory & stats |
| **Contact** | `/api/messages` | GET/POST | Customer contact inquiry management |
| **Upload** | `/api/upload` | POST | Image media upload handler |

---

## 5. Storefront & Customer Features

1. **Homepage (`/`, `/home`):**
   - High-impact promotional hero banners with CTAs.
   - Dynamic flash sale countdown timers with active stock bars.
   - Bestselling heritage product showcase with instant Add-to-Cart.
   - Brand trust pillars, customer reviews, and video embeds.
2. **Product Catalog (`/products`):**
   - Category filtering (Cold-Pressed Oils, Grains, Sweeteners, Spices).
   - Live search bar matching titles, descriptions, and SKU codes (`VNT-XXXXXX`).
   - Price sorting, badge filters, and variant selector dropdowns.
3. **Cart Drawer & Checkout (`CartDrawer.jsx`, `CheckoutModal.jsx`):**
   - Real-time cart state with quantity updates and subtotal calculations.
   - Live coupon code validation engine.
   - Automatic shipping charge calculator (Free shipping above ₹499).
   - Dual payment modes: Cash on Delivery (COD) and Razorpay Online Payment (UPI, Cards, QR).
   - Atomic stock decrement upon successful checkout.
4. **Customer Profile & Live Tracking (`/profile`):**
   - Order history with status progression (`Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Delivered`).
   - Live courier tracking (Partner name and AWB tracking number).
   - Saved shipping address book.
5. **Modern Authentication Suite (`/login`, `/register`, `/forgot-password`):**
   - Clean, centered login card with smooth transitions.
   - 3-step OTP-based password recovery.
6. **WhatsApp Floating Support:**
   - 1-click customer support widget linking directly to WhatsApp.

---

## 6. Admin Panel Management Suite (`/admin`)

Protected by `AdminGuard.jsx` role verification.

- **Dashboard:** Real-time revenue charts, order counts, pending deliveries, and low stock warnings.
- **Product Management:** Add/Edit/Delete products, automatic SKU code generator, multi-image upload, variants, and combo contents.
- **Order Management:** Filter orders by status, update courier tracking info, generate printable GST Tax Invoices (`TaxInvoice.jsx`), and send 1-click formatted WhatsApp dispatch messages.
- **Inventory Control:** Low-stock threshold alerts (< 5 units) with a quick 1-click restock modal.
- **Flash Sales & Offers:** Create time-limited deals with countdown timers and MRP discount illusions.
- **Coupon Manager:** Set percentage discounts, usage limits (`maxUses`), and expiry dates.
- **Customer Directory:** Browse registered users, order histories, and phone numbers.
- **Store Settings:** Configure shipping charges, free shipping thresholds, payment toggles, and announcement bar text.

---

## 7. Email & WhatsApp Messaging Engines

### Dual-Driver Transactional Email (`src/lib/email.js`)
- Primary: Resend API
- Fallback: Gmail SMTP via Nodemailer
- Templates: Order confirmation, dispatch with tracking link, delivery confirmation, and 6-digit security OTPs.

### WhatsApp Notification Engine (`src/lib/whatsapp.js`)
- Formatted with rich emojis and clean order breakdowns.
- Deep links via `https://api.whatsapp.com/send` to ensure cross-platform UTF-8 emoji preservation.

---

## 8. Directory Structure

```
Venthulir new/
├── .env.local                       # Environment keys (MongoDB, Razorpay, Resend, JWT)
├── package.json                     # Dependencies & scripts
├── src/
│   ├── app/                         # Next.js 15 App Router pages & API routes
│   │   ├── admin/                   # Full Admin management suite
│   │   ├── api/                     # REST API endpoints
│   │   ├── cart/, checkout/         # Commerce flow
│   │   ├── login/, register/        # Authentication pages
│   │   ├── forgot-password/         # OTP Password Reset
│   │   ├── products/                # Catalog & filters
│   │   └── profile/                 # Customer dashboard
│   ├── components/                  # Reusable UI components
│   │   ├── Navbar.jsx / .css        # Header & mobile drawer
│   │   ├── ProductCard.jsx / .css   # Interactive product card
│   │   ├── CartDrawer.jsx / .css    # Side cart drawer
│   │   ├── CheckoutModal.jsx / .css # Payment modal
│   │   ├── TaxInvoice.jsx / .css    # Printable Tax Invoice
│   │   └── FloatingWhatsApp.jsx     # Floating chat button
│   ├── context/                     # AuthContext & CartContext
│   ├── lib/                         # db, auth, email, whatsapp, inventory
│   └── models/                      # 9 Mongoose data models
```

---

## 9. Deployment & Running Instructions

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
