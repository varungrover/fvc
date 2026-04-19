"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type OrderItem = { name: string; qty: number; price: number };

type Order = {
  id: string;
  parent_id: string;
  total_amount: number;
  status: string;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  profiles: { full_name: string; email: string } | null;
  locations: { name: string } | null;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; classes: string; icon: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-warning/10 text-warning",
    icon: "schedule",
  },
  ready: {
    label: "Ready for Pickup",
    classes: "bg-primary/10 text-primary",
    icon: "inventory",
  },
  fulfilled: {
    label: "Fulfilled",
    classes: "bg-success/10 text-success",
    icon: "check_circle",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-error/10 text-error",
    icon: "cancel",
  },
};

const NEXT_STATUS: Record<string, string> = {
  pending: "ready",
  ready: "fulfilled",
};

const ACTION_LABEL: Record<string, string> = {
  pending: "Mark Ready",
  ready: "Mark Fulfilled",
};

export default function MerchandiseOrderList({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered =
    filterStatus === "all"
      ? initialOrders
      : initialOrders.filter((o) => o.status === filterStatus);

  // Summary stats
  const pendingCount = initialOrders.filter((o) => o.status === "pending").length;
  const readyCount = initialOrders.filter((o) => o.status === "ready").length;
  const fulfilledCount = initialOrders.filter((o) => o.status === "fulfilled").length;

  async function updateStatus(orderId: string, newStatus: string) {
    const supabase = createClient();
    await supabase
      .from("merchandise_orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    router.refresh();
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card-dark border border-border-dark rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-warning/15 flex items-center justify-center">
            <span className="material-icons-round text-warning text-lg">schedule</span>
          </div>
          <div>
            <p className="text-xs text-slate-400">Pending</p>
            <p className="text-xl font-bold text-white">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-card-dark border border-border-dark rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <span className="material-icons-round text-primary text-lg">inventory</span>
          </div>
          <div>
            <p className="text-xs text-slate-400">Ready for Pickup</p>
            <p className="text-xl font-bold text-white">{readyCount}</p>
          </div>
        </div>
        <div className="bg-card-dark border border-border-dark rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-success/15 flex items-center justify-center">
            <span className="material-icons-round text-success text-lg">check_circle</span>
          </div>
          <div>
            <p className="text-xs text-slate-400">Fulfilled</p>
            <p className="text-xl font-bold text-white">{fulfilledCount}</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "ready", "fulfilled", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all capitalize ${
              filterStatus === s
                ? "bg-primary text-white"
                : "bg-surface-dark text-slate-400 hover:text-white border border-border-dark"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-12 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">
            inventory_2
          </span>
          <p className="text-slate-400 font-medium">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
            const nextStatus = NEXT_STATUS[order.status];
            const actionLabel = ACTION_LABEL[order.status];

            return (
              <div
                key={order.id}
                className="bg-card-dark border border-border-dark rounded-xl p-5 hover:border-border-dark/80 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  {/* Parent + date */}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {order.profiles?.full_name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(order.created_at)}
                      {order.locations && ` · ${order.locations.name}`}
                    </p>
                  </div>

                  {/* Status + amount */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">${order.total_amount}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.classes}`}
                    >
                      <span className="material-icons-round text-[12px]">{statusCfg.icon}</span>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-surface-dark rounded-lg p-3 mb-3">
                  <div className="space-y-1.5">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">
                          {item.name}
                          {item.qty > 1 && (
                            <span className="text-slate-500 ml-1">×{item.qty}</span>
                          )}
                        </span>
                        <span className="text-slate-400">${item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <p className="text-xs text-slate-500 italic mb-3">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                )}

                {/* Actions */}
                {nextStatus && (
                  <button
                    onClick={() => updateStatus(order.id, nextStatus)}
                    className="text-xs font-medium text-primary hover:text-purple-300 transition-colors flex items-center gap-1"
                  >
                    <span className="material-icons-round text-sm">
                      {nextStatus === "ready" ? "inventory" : "check_circle"}
                    </span>
                    {actionLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
