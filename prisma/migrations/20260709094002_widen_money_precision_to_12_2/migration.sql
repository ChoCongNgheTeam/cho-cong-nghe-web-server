-- Widen money precision từ Decimal(10,2) lên Decimal(12,2) để khớp với
-- products_variants.price (nguồn giá gốc, vốn đã Decimal(12,2)) — tránh
-- lỗi "numeric field overflow" khi sản phẩm giá > 100 triệu.
-- Giá tiền 1 sản phẩm trong giỏ hàng
ALTER TABLE
    "cart_items"
ALTER COLUMN
    "unitPrice" TYPE DECIMAL(12, 2);

-- Các field tiền của đơn hàng
ALTER TABLE
    "orders"
ALTER COLUMN
    "subtotalAmount" TYPE DECIMAL(12, 2);

ALTER TABLE
    "orders"
ALTER COLUMN
    "shippingFee" TYPE DECIMAL(12, 2);

ALTER TABLE
    "orders"
ALTER COLUMN
    "voucherDiscount" TYPE DECIMAL(12, 2);

ALTER TABLE
    "orders"
ALTER COLUMN
    "totalAmount" TYPE DECIMAL(12, 2);

-- Giá tiền 1 sản phẩm trong đơn hàng (snapshot lúc đặt hàng)
ALTER TABLE
    "order_items"
ALTER COLUMN
    "unitPrice" TYPE DECIMAL(12, 2);

-- Số tiền giao dịch thanh toán (mirror orders.totalAmount)
ALTER TABLE
    "payment_transactions"
ALTER COLUMN
    "amount" TYPE DECIMAL(12, 2);

-- Giá trị voucher (so sánh/trừ trực tiếp với orders.subtotalAmount)
ALTER TABLE
    "vouchers"
ALTER COLUMN
    "discountValue" TYPE DECIMAL(12, 2);

ALTER TABLE
    "vouchers"
ALTER COLUMN
    "minOrderValue" TYPE DECIMAL(12, 2);

ALTER TABLE
    "vouchers"
ALTER COLUMN
    "maxDiscountValue" TYPE DECIMAL(12, 2);

-- Giá trị giảm giá của promotion rule
ALTER TABLE
    "promotion_rules"
ALTER COLUMN
    "discountValue" TYPE DECIMAL(12, 2);