"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  comment: string | null;
  totalAmount: number | string;
  itemsCount: number;
  items: { id: string; quantity: number; price: number | string; product: { name: string; images: string[] } }[];
  createdAt: string;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
}

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

const statusOptions = [
  { value: "", label: "Barcha holatlar" },
  { value: "PENDING", label: "Yangi" },
  { value: "CONFIRMED", label: "Tasdiqlangan" },
  { value: "SHIPPING", label: "Yetkazilmoqda" },
  { value: "DELIVERED", label: "Bajarildi" },
  { value: "CANCELLED", label: "Bekor qilingan" },
];

const statusConfig = {
  PENDING: { label: "Yangi", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock, next: "CONFIRMED" },
  CONFIRMED: { label: "Tasdiqlangan", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle, next: "SHIPPING" },
  SHIPPING: { label: "Yetkazilmoqda", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck, next: "DELIVERED" },
  DELIVERED: { label: "Bajarildi", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle, next: null },
  CANCELLED: { label: "Bekor qilingan", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle, next: null },
};

const statusOrder = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"];

const cancelSchema = z.object({
  reason: z.string().min(5, "Sabab kamida 5 belgi bo'lishi kerak"),
});

type CancelFormData = z.infer<typeof cancelSchema>;

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    register: cancelRegister,
    handleSubmit: cancelHandleSubmit,
    reset: cancelReset,
    formState: { errors: cancelErrors },
  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { reason: "" },
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Statusni o'zgartirishda xatolik");
      }

      const updatedOrder = await res.json();
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (orderId: string, reason: string) => {
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Bekor qilishda xatolik");
      }

      const updatedOrder = await res.json();
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      cancelReset();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setCancellingId(null);
    }
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Buyurtmalar</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Buyurtmalarni boshqarish va holatni o'zgartirish</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <Input
              placeholder="Qidirish (buyurtma raqami, ism, telefon)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-48"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-1">Buyurtmalar topilmadi</h3>
            <p className="text-dark-500 dark:text-dark-400">Filtrlarni o'zgartiring yoki yangi buyurtmalar kuting</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-800/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Buyurtma</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Mijoz</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Mahsulotlar</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Summa</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Holat</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Sana</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                {filteredOrders.map((order, index) => {
                  const config = statusConfig[order.status];
                  const Icon = config.icon;
                  const currentStatusIndex = statusOrder.indexOf(order.status);
                  const canAdvance = config.next && !["DELIVERED", "CANCELLED"].includes(order.status);

                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors cursor-pointer"
                      onClick={() => openDetailModal(order)}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-dark-900 dark:text-white">{order.customerName}</p>
                          <p className="text-sm text-dark-500 dark:text-dark-400">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {order.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-dark-100 dark:border-dark-800" title={item.product.name}>
                              {item.product.images[0] ? (
                                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-dark-400"><Package className="w-4 h-4" /></div>
                              )}
                              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-medium flex items-center justify-center">
                                {item.quantity}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-lg bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-sm text-dark-500 dark:text-dark-400 border border-dark-200 dark:border-dark-700">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-dark-900 dark:text-white">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.color)}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-500 dark:text-dark-400 whitespace-nowrap">
                        {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm", { locale: ru })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetailModal(order); }} className="p-2" aria-label="Ko'rish">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canAdvance && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, config.next!); }}
                              disabled={updatingId === order.id}
                              className="gap-1"
                            >
                              {updatingId === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  {config.next === "CONFIRMED" && <CheckCircle className="w-4 h-4" />}
                                  {config.next === "SHIPPING" && <Truck className="w-4 h-4" />}
                                  {config.next === "DELIVERED" && <CheckCircle className="w-4 h-4" />}
                                </>
                              )}
                            </Button>
                          )}
                          {order.status === "PENDING" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); setCancellingId(order.id); }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              aria-label="Bekor qilish"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <Modal
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
            title={`Buyurtma: ${selectedOrder.orderNumber}`}
            size="xl"
          >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status Timeline */}
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-100 dark:border-dark-800">
                <h4 className="font-medium text-dark-900 dark:text-white mb-4">Buyurtma holati</h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {statusOrder.map((status, i) => {
                    const config = statusConfig[status as Order["status"]];
                    const isCurrent = status === selectedOrder!.status;
                    const isPassed = statusOrder.indexOf(selectedOrder!.status) > i;
                    const Icon = config.icon;

                    return (
                      <div key={status} className="flex flex-col items-center flex-shrink-0 relative">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10",
                            isCurrent
                              ? "bg-primary-600 border-primary-600 text-white"
                              : isPassed
                              ? "bg-green-500 border-green-500 text-white"
                              : "bg-white dark:bg-dark-900 border-dark-200 dark:border-dark-700 text-dark-300"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={cn("mt-2 text-xs font-medium text-center w-24", isCurrent ? "text-primary-600 dark:text-primary-400" : "text-dark-500 dark:text-dark-400")}>
                          {config.label}
                        </span>
                        {i < statusOrder.length - 1 && (
                          <div
                            className={cn(
                              "absolute top-5 left-10 w-24 h-0.5 -ml-2",
                              isPassed ? "bg-green-500" : "bg-dark-200 dark:bg-dark-700"
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-dark-900 dark:text-white">Mijoz ma'lumotlari</h4>
                  <div className="space-y-3 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-100 dark:border-dark-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white">{selectedOrder.customerName}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{selectedOrder.customerPhone}</p>
                      </div>
                    </div>
                    {selectedOrder.customerEmail && (
                      <div className="flex items-center gap-3 ml-12">
                        <Mail className="w-5 h-5 text-dark-400" />
                        <span className="text-sm text-dark-700 dark:text-dark-300">{selectedOrder.customerEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 ml-12">
                      <MapPin className="w-5 h-5 text-dark-400" />
                      <span className="text-sm text-dark-700 dark:text-dark-300">{selectedOrder.address}</span>
                    </div>
                    {selectedOrder.comment && (
                      <div className="flex items-start gap-3 ml-12">
                        <MessageSquare className="w-5 h-5 text-dark-400 mt-0.5" />
                        <span className="text-sm text-dark-700 dark:text-dark-300">{selectedOrder.comment}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-dark-900 dark:text-white">Buyurtma ma'lumotlari</h4>
                  <div className="space-y-3 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-100 dark:border-dark-800">
                    <div className="flex justify-between">
                      <span className="text-dark-500 dark:text-dark-400">Buyurtma raqami</span>
                      <span className="font-medium text-dark-900 dark:text-white font-mono">{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-500 dark:text-dark-400">Sana</span>
                      <span className="font-medium text-dark-900 dark:text-white">{format(new Date(selectedOrder.createdAt), "dd.MM.yyyy HH:mm", { locale: ru })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-500 dark:text-dark-400">Mahsulotlar soni</span>
                      <span className="font-medium text-dark-900 dark:text-white">{selectedOrder.itemsCount} ta</span>
                    </div>
                    <div className="flex justify-between border-t border-dark-100 dark:border-dark-800 pt-3">
                      <span className="text-dark-500 dark:text-dark-400">Jami summa</span>
                      <span className="text-xl font-bold text-dark-900 dark:text-white">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                    {selectedOrder.deliveredAt && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Yetkazilgan sana</span>
                        <span>{format(new Date(selectedOrder.deliveredAt), "dd.MM.yyyy HH:mm", { locale: ru })}</span>
                      </div>
                    )}
                    {selectedOrder.cancelledAt && (
                      <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>Bekor qilingan sana</span>
                        <span>{format(new Date(selectedOrder.cancelledAt), "dd.MM.yyyy HH:mm", { locale: ru })}</span>
                      </div>
                    )}
                    {selectedOrder.cancelReason && (
                      <div className="flex justify-between">
                        <span className="text-dark-500 dark:text-dark-400">Bekor qilish sababi</span>
                        <span className="text-red-600 dark:text-red-400">{selectedOrder.cancelReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-dark-900 dark:text-white mb-3">Mahsulotlar</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-100 dark:border-dark-800"
                    >
                      {item.product.images[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-dark-100 dark:bg-dark-800 flex items-center justify-center"><Package className="w-6 h-6 text-dark-400" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark-900 dark:text-white truncate">{item.product.name}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{formatPrice(item.price)} × {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-dark-900 dark:text-white">{formatPrice(Number(item.price) * item.quantity)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-dark-100 dark:border-dark-800">
                {statusConfig[selectedOrder.status].next && !["DELIVERED", "CANCELLED"].includes(selectedOrder.status) && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleStatusChange(selectedOrder.id, statusConfig[selectedOrder.status].next!)}
                    disabled={updatingId === selectedOrder.id}
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    {updatingId === selectedOrder.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {statusConfig[selectedOrder.status].next === "CONFIRMED" && <CheckCircle className="w-5 h-5" />}
                        {statusConfig[selectedOrder.status].next === "SHIPPING" && <Truck className="w-5 h-5" />}
                        {statusConfig[selectedOrder.status].next === "DELIVERED" && <CheckCircle className="w-5 h-5" />}
                      </>
                    )}
                    Keyingi bosqich: {statusConfig[statusConfig[selectedOrder.status].next!].label}
                  </Button>
                )}
                {selectedOrder.status === "PENDING" && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCancellingId(selectedOrder.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 sm:flex-none"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Bekor qilish
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancellingId && (
          <Modal
            isOpen={!!cancellingId}
            onClose={() => { setCancellingId(null); cancelReset(); }}
            title="Buyurtmani bekor qilish"
          >
            <form onSubmit={cancelHandleSubmit((data) => handleCancel(cancellingId!, data.reason))} className="space-y-4">
              <p className="text-dark-600 dark:text-dark-400">Buyurtma bekor qilish sababini kiriting:</p>
              <textarea
                {...cancelRegister("reason")}
                rows={4}
                className="w-full px-4 py-2.5 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Sababni yozing..."
              />
              {cancelErrors.reason && <p className="text-sm text-red-500">{cancelErrors.reason.message}</p>}
              <div className="flex gap-3 justify-end pt-4 border-t border-dark-100 dark:border-dark-800">
                <Button type="button" variant="outline" onClick={() => { setCancellingId(null); cancelReset(); }}>Bekor qilish</Button>
                <Button type="submit" variant="primary" disabled={cancellingId} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                  {cancellingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Tasdiqlash
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Need to import Link and icons
import Link from "next/link";
import { User, MessageSquare } from "lucide-react";