"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { OrderModal } from "@/components/ui/OrderModal";
import type { Product } from "@/components/ui/ProductCard";

interface OrderContextType {
  isOpen: boolean;
  product: Product | null;
  openModal: (product?: Product) => void;
  closeModal: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const handleOpen = (event: CustomEvent<Product>) => {
      setProduct(event.detail || null);
      setIsOpen(true);
    };

    const handleClose = () => {
      setIsOpen(false);
      setProduct(null);
    };

    window.addEventListener("open-order-modal", handleOpen as EventListener);
    window.addEventListener("close-order-modal", handleClose);

    return () => {
      window.removeEventListener("open-order-modal", handleOpen as EventListener);
      window.removeEventListener("close-order-modal", handleClose);
    };
  }, []);

  const openModal = (p?: Product) => {
    setProduct(p || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setProduct(null);
  };

  return (
    <OrderContext.Provider value={{ isOpen, product, openModal, closeModal }}>
      {children}
      <OrderModal isOpen={isOpen} onClose={closeModal} product={product} />
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}