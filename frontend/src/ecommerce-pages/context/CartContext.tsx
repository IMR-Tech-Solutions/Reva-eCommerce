import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../data/products";
import { useSelector } from "react-redux";
import api from "../../services/baseapi";


export type CartItem = {
    product: Product;
    qty: number;
};

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, qty: number) => void;
    updateQty: (productId: number, qty: number) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useSelector((state: any) => state.user);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartLoaded, setIsCartLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("revashop_cart");
            if (saved) {
                setCart(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Local storage error", e);
        } finally {
            setIsCartLoaded(true);
        }
    }, []);

    // Sync with backend when authentication status changes
    useEffect(() => {
        if (isAuthenticated && isCartLoaded) {
            const syncCart = async () => {
                try {
                    // 1. If local cart has items, push them to backend first
                    if (cart.length > 0) {
                        await api.post("ecommerce/cart/", { 
                            items: cart.map(i => ({ id: i.product.id, quantity: i.qty })) 
                        });
                    }
                    
                    // 2. Fetch merged cart from backend
                    const res = await api.get("ecommerce/cart/");
                    const backendItems = res.data.items.map((item: any) => {
                        let imageUrl = item.product_image;
                        // If it's a relative path from the backend, prepend the API URL
                        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/ecommerce-images')) {
                            const baseUrl = import.meta.env.VITE_API_IMG_URL || "http://127.0.0.1:8000";
                            imageUrl = baseUrl + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
                        }
                        
                        return {
                            product: {
                                id: item.product,
                                name: item.product_name,
                                price: item.price,
                                image: imageUrl,
                                category: item.category_name || "Uncategorized",
                                material: item.material,
                                capacity: item.capacity,
                                pressure: item.pressure,
                                motorHP: item.motor_hp,
                            },
                            qty: item.quantity
                        };
                    });
                    setCart(backendItems);
                } catch (err) {
                    console.error("Cart sync failed", err);
                }
            };
            syncCart();
        }
    }, [isAuthenticated, isCartLoaded]);

    // Save to localStorage whenever cart changes
    useEffect(() => {
        if (isCartLoaded) {
            localStorage.setItem("revashop_cart", JSON.stringify(cart));
        }
    }, [cart, isCartLoaded]);

    const addToCart = async (product: Product, qty: number) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id ? { ...item, qty: item.qty + qty } : item
                );
            }
            return [...prev, { product, qty }];
        });

        if (isAuthenticated) {
            try {
                await api.post("ecommerce/cart/", { product_id: product.id, quantity: qty });
            } catch (err) {
                console.error("Backend add failed", err);
            }
        }
    };

    const updateQty = async (productId: number, qty: number) => {
        if (qty < 1) return;
        setCart((prev) =>
            prev.map((item) => (item.product.id === productId ? { ...item, qty } : item))
        );

        if (isAuthenticated) {
            try {
                // Backend handles selective item sync if 'items' array is passed
                await api.post("ecommerce/cart/", { 
                    items: [{ id: productId, quantity: qty }] 
                });
            } catch (err) {
                console.error("Backend update failed", err);
            }
        }
    };

    const removeItem = async (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
        
        if (isAuthenticated) {
            try {
                await api.delete("ecommerce/cart/", { data: { product_id: productId } });
            } catch (err) {
                console.error("Backend remove failed", err);
            }
        }
    };

    const clearCart = async () => {
        setCart([]);
        if (isAuthenticated) {
            try {
                await api.delete("ecommerce/cart/");
            } catch (err) {
                console.error("Backend clear failed", err);
            }
        }
    };

    const cartCount = cart.reduce((total, item) => total + item.qty, 0);

    return (
        <CartContext.Provider
            value={{ cart, addToCart, updateQty, removeItem, clearCart, cartCount }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
