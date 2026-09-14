/**
 * VENTHULIR — LUXURY ORGANIC EMAIL TEMPLATES
 * Ultra-Clean, Modern, and High-Deliverability Transactional Email Designs
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Common Brand Header
 */
function getEmailHeader(subtitle = 'PURE ORGANIC HARVEST') {
  return `
    <div style="background-color: #ffffff; padding: 32px 24px 20px; text-align: center; border-bottom: 1px solid #f0eae1;">
      <div style="display: inline-block;">
        <span style="font-family: 'Cinzel', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: #1a3325; text-transform: uppercase;">
          VENTHULIR
        </span>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9.5px; font-weight: 700; letter-spacing: 2.5px; color: #b47a1b; text-transform: uppercase; margin-top: 4px;">
          ${subtitle}
        </div>
      </div>
    </div>
  `;
}

/**
 * Common Brand Footer
 */
function getEmailFooter() {
  return `
    <div style="background-color: #faf7f2; border-top: 1px solid #eee6da; padding: 24px 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="font-size: 11px; font-weight: 700; color: #1a3325; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
        Venthulir Organic Harvest
      </div>
      <p style="font-size: 11.5px; color: #788c81; margin: 0 0 10px; line-height: 1.5;">
        100% Cold-Pressed Oils • Single-Origin Spices • Farm Fresh Dispatch
      </p>
      <div style="font-size: 11px; color: #94a39b; margin: 0;">
        Need help? Reach out on WhatsApp or email <a href="mailto:theventhulir@gmail.com" style="color: #b47a1b; text-decoration: none; font-weight: 600;">theventhulir@gmail.com</a>
      </div>
    </div>
  `;
}

/**
 * 1. OTP / Verification Code Email Template (Simple & Premium)
 */
export function generateOtpEmail({ otp, type = 'login', userName = '' }) {
  const isRegister = type === 'register';
  const title = isRegister ? 'Welcome to Venthulir' : 'Sign-In Verification';
  const subtext = isRegister
    ? 'Enter the 6-digit verification code below to activate your member account and complete registration:'
    : `Hello ${userName ? userName : 'Valued Patron'}, enter the 6-digit verification code below to access your account:`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e8e0d5; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td>
              ${getEmailHeader('AUTHENTIC FARM DIRECT')}
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 28px 28px; text-align: center;">
              
              <!-- Subtle Badge -->
              <div style="display: inline-block; background-color: #fef7ed; border: 1px solid #fed7aa; border-radius: 30px; padding: 4px 14px; margin-bottom: 18px;">
                <span style="font-size: 11px; font-weight: 700; color: #b45309; letter-spacing: 1px; text-transform: uppercase;">
                  ${isRegister ? 'New Member Verification' : 'Secure Sign In'}
                </span>
              </div>

              <h1 style="font-family: 'Cinzel', Georgia, serif; font-size: 22px; font-weight: 700; color: #1a3325; margin: 0 0 12px; letter-spacing: 0.5px;">
                ${title}
              </h1>

              <p style="font-size: 14px; line-height: 1.6; color: #52665a; margin: 0 0 26px; max-width: 420px; margin-left: auto; margin-right: auto;">
                ${subtext}
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #fcfaf6; border: 1.5px dashed #e2d2ba; border-radius: 14px; padding: 20px 24px; margin: 0 auto 24px; max-width: 320px;">
                <div style="font-size: 10.5px; font-weight: 700; color: #8c785d; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
                  Your Verification Code
                </div>
                <div style="font-family: 'SF Pro Display', -apple-system, 'Courier New', monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #b45309; margin-left: 10px;">
                  ${otp}
                </div>
              </div>

              <p style="font-size: 12.5px; color: #788c81; margin: 0 0 4px;">
                ⏱ This verification code is valid for <strong>10 minutes</strong>.
              </p>
              <p style="font-size: 11.5px; color: #94a39b; margin: 0;">
                If you did not request this code, please safely disregard this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              ${getEmailFooter()}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 2. Order Confirmation Email Template (Simple & Premium)
 */
export function generateOrderEmail({
  order,
  customerName = 'Valued Patron',
  items = [],
  totalAmount = 0,
  shippingCharge = 0,
  discountAmount = 0,
  couponUsed = null,
  deliveryAddress = {},
  paymentMethod = 'Cash on Delivery'
}) {
  const orderRef = (order?._id || order?.id || 'NEW-ORDER').toString().slice(-8).toUpperCase();
  const addressLine = [
    deliveryAddress?.address || deliveryAddress?.street,
    deliveryAddress?.city,
    deliveryAddress?.state ? `${deliveryAddress.state} - ${deliveryAddress.zipCode || ''}` : deliveryAddress?.zipCode
  ].filter(Boolean).join(', ');

  // Render items rows
  const itemsHtml = items.map((item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQty = Number(item.quantity) || 1;
    const itemTotal = itemPrice * itemQty;
    const itemName = item.name || 'Harvest Item';
    const variantLabel = item.variant?.label || item.variant || item.selectedWeight || '';

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f2ede4; vertical-align: middle;">
          <div style="font-weight: 700; font-size: 13.5px; color: #1a3325; line-height: 1.3;">
            ${itemName}
          </div>
          ${variantLabel ? `<div style="font-size: 11.5px; color: #b47a1b; font-weight: 600; margin-top: 2px;">Variant: ${variantLabel}</div>` : ''}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #f2ede4; text-align: center; font-size: 13px; color: #52665a; font-weight: 600; vertical-align: middle;">
          ×${itemQty}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f2ede4; text-align: right; font-weight: 700; font-size: 14px; color: #1a3325; vertical-align: middle;">
          ₹${itemTotal}
        </td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${orderRef}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e8e0d5; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td>
              ${getEmailHeader('DIRECT FARM HARVEST CONFIRMATION')}
            </td>
          </tr>

          <!-- Banner / Order Status -->
          <tr>
            <td style="padding: 32px 30px 20px;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0eae1; padding-bottom: 20px;">
                <div>
                  <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #b45309; text-transform: uppercase;">
                    Order Confirmed
                  </div>
                  <h1 style="font-family: 'Cinzel', Georgia, serif; font-size: 24px; font-weight: 700; color: #1a3325; margin: 4px 0 0;">
                    Thank You, ${customerName}!
                  </h1>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 10.5px; color: #788c81; text-transform: uppercase; font-weight: 600;">Reference</div>
                  <div style="font-family: monospace; font-size: 14px; font-weight: 800; color: #1a3325;">#${orderRef}</div>
                </div>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #52665a; margin: 18px 0 24px;">
                Your order has been received at our farm unit. Our team is carefully packing your fresh batch for express dispatch.
              </p>

              <!-- Items Summary Table -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 11.5px; font-weight: 750; color: #1a3325; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                  Ordered Items
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%;">
                  <thead>
                    <tr>
                      <th align="left" style="font-size: 11px; color: #8c9c93; text-transform: uppercase; font-weight: 700; padding-bottom: 8px; border-bottom: 1px solid #e8e0d5;">Item</th>
                      <th align="center" style="font-size: 11px; color: #8c9c93; text-transform: uppercase; font-weight: 700; padding-bottom: 8px; border-bottom: 1px solid #e8e0d5; width: 60px;">Qty</th>
                      <th align="right" style="font-size: 11px; color: #8c9c93; text-transform: uppercase; font-weight: 700; padding-bottom: 8px; border-bottom: 1px solid #e8e0d5; width: 80px;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>

              <!-- Price Breakdown Card -->
              <div style="background-color: #faf7f2; border: 1px solid #ede5d8; border-radius: 12px; padding: 16px 18px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  ${discountAmount > 0 ? `
                  <tr>
                    <td style="font-size: 13px; color: #52665a; padding-bottom: 6px;">Discount (${couponUsed || 'Coupon'}):</td>
                    <td align="right" style="font-size: 13px; color: #166534; font-weight: 700; padding-bottom: 6px;">-₹${discountAmount}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="font-size: 13px; color: #52665a; padding-bottom: 6px;">Delivery Charges:</td>
                    <td align="right" style="font-size: 13px; color: #166534; font-weight: 700; padding-bottom: 6px;">
                      ${shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 15px; font-weight: 800; color: #1a3325; padding-top: 8px; border-top: 1px dashed #dcd4c6;">
                      Total Payable:
                    </td>
                    <td align="right" style="font-size: 17px; font-weight: 850; color: #b45309; padding-top: 8px; border-top: 1px dashed #dcd4c6;">
                      ₹${totalAmount}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Shipping & Payment Details -->
              <div style="background-color: #ffffff; border: 1px solid #eee6da; border-radius: 12px; padding: 16px 18px; margin-bottom: 26px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align: top; width: 50%; padding-right: 10px;">
                      <div style="font-size: 10.5px; font-weight: 700; color: #8c9c93; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">
                        Delivery Address
                      </div>
                      <div style="font-size: 12.5px; color: #1a3325; line-height: 1.45;">
                        ${addressLine || 'Direct Farm Origin Order'}
                      </div>
                    </td>
                    <td style="vertical-align: top; width: 50%; padding-left: 10px; border-left: 1px solid #f0eae1;">
                      <div style="font-size: 10.5px; font-weight: 700; color: #8c9c93; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">
                        Payment Mode
                      </div>
                      <div style="font-size: 13px; font-weight: 700; color: #1a3325;">
                        ${paymentMethod}
                      </div>
                      <div style="font-size: 11px; color: #166534; font-weight: 600; margin-top: 2px;">
                        ✓ 100% Authentic Guarantee
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Track Button -->
              <div style="text-align: center; margin-bottom: 10px;">
                <a href="${BASE_URL}/profile" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #c2410c 100%); color: #ffffff; font-size: 13.5px; font-weight: 800; text-decoration: none; padding: 13px 30px; border-radius: 50px; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35); text-shadow: 0 1px 2px rgba(0,0,0,0.15);">
                  View Order Status →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              ${getEmailFooter()}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 4. Welcome New Member Email Template
 */
export function generateWelcomeEmail({
  name = 'Valued Patron',
  email = ''
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Venthulir Organic</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e8e0d5; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td>
              ${getEmailHeader('AUTHENTIC FARM DIRECT HARVEST')}
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 30px 24px; text-align: center;">
              
              <!-- Sparkle Crest -->
              <div style="display: inline-block; background-color: #fef7ed; border: 1px solid #fed7aa; border-radius: 30px; padding: 4px 14px; margin-bottom: 18px;">
                <span style="font-size: 11px; font-weight: 700; color: #b45309; letter-spacing: 1px; text-transform: uppercase;">
                  Welcome to the Harvest Family
                </span>
              </div>

              <h1 style="font-family: 'Cinzel', Georgia, serif; font-size: 24px; font-weight: 700; color: #1a3325; margin: 0 0 12px;">
                Welcome, ${name}!
              </h1>

              <p style="font-size: 14px; line-height: 1.6; color: #52665a; margin: 0 0 24px; max-width: 440px; margin-left: auto; margin-right: auto;">
                Your Venthulir account is now active. Explore our traditional stone-ground masalas, single-origin whole spices, and cold-pressed pure oils directly harvested from certified sustainable farm origins.
              </p>

              <!-- Account Details Card -->
              <div style="background-color: #faf7f2; border: 1px solid #ede5d8; border-radius: 12px; padding: 16px 20px; margin: 0 auto 26px; text-align: left; max-width: 380px;">
                <div style="font-size: 11px; font-weight: 700; color: #8c785d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                  Registered Email
                </div>
                <div style="font-size: 13.5px; font-weight: 700; color: #1a3325;">
                  ${email}
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${BASE_URL}/products" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #c2410c 100%); color: #ffffff; font-size: 13.5px; font-weight: 800; text-decoration: none; padding: 13px 32px; border-radius: 50px; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35); text-shadow: 0 1px 2px rgba(0,0,0,0.15);">
                  Explore Our Harvest →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              ${getEmailFooter()}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 5. Payment Success & Order Confirmation Template
 */
export function generatePaymentSuccessEmail({
  order,
  customerName = 'Valued Patron',
  paymentId = '',
  totalAmount = 0
}) {
  return generateOrderEmail({
    order,
    customerName,
    items: order?.items || [],
    totalAmount: totalAmount || order?.totalAmount || 0,
    shippingCharge: order?.shippingCharge || 0,
    discountAmount: order?.discountAmount || 0,
    couponUsed: order?.couponUsed,
    deliveryAddress: order?.deliveryAddress || {},
    paymentMethod: `Razorpay Online (${paymentId ? `ID: ${paymentId}` : 'Prepaid'})`
  });
}

