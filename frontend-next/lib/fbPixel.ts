export const FB_PIXEL_ID = '1180231007033432';

declare global {
    interface Window {
        fbq: any;
    }
}

export const pageView = () => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq('track', 'PageView');
    }
};

export const event = (name: string, options: any = {}) => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq('track', name, options);
    }
};

// Typed Standard Events

export const addToCart = (product: {
    content_ids: string[];
    content_name: string;
    value: number;
    currency: string;
    content_type?: string;
}) => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq('track', 'AddToCart', {
            content_type: 'product',
            ...product
        });
    }
};

export const initiateCheckout = (data: {
    content_ids: string[];
    num_items: number;
    value: number;
    currency: string;
    content_type?: string;
}) => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
            content_type: 'product',
            ...data
        });
    }
};

export const purchase = (order: {
    order_id: string; // strict requirement
    value: number;
    currency: string;
    content_ids: string[];
    num_items: number;
    content_type?: string;
}) => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq('track', 'Purchase', {
            content_type: 'product',
            ...order
        });
    }
};

// ViewContent (Extra for strict e-commerce)
export const viewContent = (product: {
    content_ids: string[];
    content_name: string;
    value: number;
    currency: string;
    content_type?: string;
}) => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq('track', 'ViewContent', {
            content_type: 'product',
            ...product
        });
    }
};
