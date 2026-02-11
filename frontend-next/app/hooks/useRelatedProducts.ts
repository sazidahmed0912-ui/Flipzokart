import { useEffect, useState } from "react";
import API from "@/app/services/api";
import { Product } from "@/app/types";

export default function useRelatedProducts(category: string | undefined, productId: string | undefined) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!category || !productId) {
            setLoading(false);
            return;
        }

        const fetchRelated = async () => {
            setLoading(true);
            try {
                // API call to the new backend endpoint
                const { data } = await API.get(
                    `/api/products/category/${encodeURIComponent(category)}?exclude=${productId}&limit=8`
                );
                setProducts(data);
            } catch (e) {
                console.error("Related products error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [category, productId]);

    return { products, loading };
}
