import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../data/products";


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
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem("revashop_cart");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("revashop_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product, qty: number) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id ? { ...item, qty: item.qty + qty } : item
                );
            }
            return [...prev, { product, qty }];
        });
    };

    const updateQty = (productId: number, qty: number) => {
        if (qty < 1) return;
        setCart((prev) =>
            prev.map((item) => (item.product.id === productId ? { ...item, qty } : item))
        );
    };

    const removeItem = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => setCart([]);

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
