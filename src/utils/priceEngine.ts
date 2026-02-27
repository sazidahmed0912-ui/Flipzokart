import crypto from 'crypto';

const PRICE_ENGINE_SECRET = process.env.PRICE_ENGINE_SECRET || 'fzokart-price-lock-secret-2024';

// ──────────────────────────────────────────────────────────────
// Rounding helper — 2 decimal places
// ──────────────────────────────────────────────────────────────
const round = (n: number) => Math.round(n * 100) / 100;

// ──────────────────────────────────────────────────────────────
// Item input shape (from DB product + cart quantity)
// ──────────────────────────────────────────────────────────────
export interface PriceEngineItem {
    _id: string;
    quantity: number;
    sellingPrice: number;      // The effective price per unit
    gstRate?: number;          // Default 0 if not set
    priceType?: 'inclusive' | 'exclusive'; // Default 'inclusive'
    productName?: string;
    image?: string;
    color?: string;
    size?: string;
    variantId?: string;
}

export interface PriceEngineInput {
    items: PriceEngineItem[];
    deliveryCharge?: number;
    platformFee?: number;
    couponDiscount?: number;
}

export interface ProcessedItem {
    productId: string;
    quantity: number;
    unitPrice: number;
    baseAmount: number;
    gstAmount: number;
    finalAmount: number;
    productName?: string;
    image?: string;
    color?: string;
    size?: string;
    variantId?: string;
}

export interface PriceSummary {
    items: ProcessedItem[];
    subtotal: number;
    totalGST: number;
    deliveryCharge: number;
    platformFee: number;
    couponDiscount: number;
    grandTotal: number;
    cgst: number;
    sgst: number;
    hash?: string;
}

// ──────────────────────────────────────────────────────────────
// 🔥 THE SINGLE PRICE ENGINE
// This is the ONLY place calculations are allowed.
// ──────────────────────────────────────────────────────────────
export function priceEngine(input: PriceEngineInput): PriceSummary {
    const {
        items,
        deliveryCharge: rawDelivery = 0,
        platformFee: rawPlatform = 0,
        couponDiscount: rawCoupon = 0,
    } = input;

    let subtotal = 0;
    let totalGST = 0;

    const processed: ProcessedItem[] = items.map(item => {
        const qty = Number(item.quantity);
        const price = Number(item.sellingPrice);
        const gstRate = Number(item.gstRate ?? 0);
        const priceType = item.priceType ?? 'inclusive';

        let base = price * qty;
        let gst = 0;

        if (priceType === 'exclusive') {
            // Price does NOT include GST → add GST on top
            gst = round(base * gstRate / 100);
        } else {
            // Price INCLUDES GST → extract base component
            if (gstRate > 0) {
                const actualBase = base / (1 + gstRate / 100);
                gst = round(base - actualBase);
                base = round(actualBase);
            }
        }

        subtotal += base;
        totalGST += gst;

        return {
            productId: item._id,
            quantity: qty,
            unitPrice: price,
            baseAmount: round(base),
            gstAmount: round(gst),
            finalAmount: round(base + gst),
            productName: item.productName,
            image: item.image,
            color: item.color,
            size: item.size,
            variantId: item.variantId,
        };
    });

    subtotal = round(subtotal);
    totalGST = round(totalGST);
    const deliveryCharge = round(rawDelivery);
    const platformFee = round(rawPlatform);
    const couponDiscount = round(rawCoupon);

    // GST is split equally into CGST + SGST (for same-state, intra-state)
    const cgst = round(totalGST / 2);
    const sgst = round(totalGST - cgst); // Avoids rounding gap

    const grandTotal = round(
        subtotal + totalGST + deliveryCharge + platformFee - couponDiscount
    );

    return {
        items: processed,
        subtotal,
        totalGST,
        cgst,
        sgst,
        deliveryCharge,
        platformFee,
        couponDiscount,
        grandTotal,
    };
}

// ──────────────────────────────────────────────────────────────
// 🔐 HASH — Generate a tamper-proof signature of the summary
// ──────────────────────────────────────────────────────────────
export function generatePreviewHash(summary: PriceSummary): string {
    // Exclude any existing hash field before signing
    const { hash: _excluded, ...summaryToSign } = summary as any;
    const payload = JSON.stringify(summaryToSign);
    return crypto
        .createHmac('sha256', PRICE_ENGINE_SECRET)
        .update(payload)
        .digest('hex');
}

// ──────────────────────────────────────────────────────────────
// 🔐 VERIFY — Check the signature matches; rejects tampered data
// ──────────────────────────────────────────────────────────────
export function verifyPreviewHash(previewData: PriceSummary & { hash: string }): boolean {
    const { hash, ...summaryWithoutHash } = previewData;
    const expectedHash = generatePreviewHash(summaryWithoutHash as PriceSummary);
    // Use timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(hash, 'hex'),
            Buffer.from(expectedHash, 'hex')
        );
    } catch {
        return false;
    }
}
