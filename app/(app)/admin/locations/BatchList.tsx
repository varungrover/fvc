"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { TLP } from "@/lib/theme/tokens";
import type { Batch } from "@/lib/types";

interface BatchListProps {
  locationId: string;
  levelId: string;
}

export function BatchList({ locationId, levelId }: BatchListProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBatches() {
      try {
        const res = await fetch(`/api/batches?locationId=${locationId}&levelId=${levelId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setBatches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBatches();
  }, [locationId, levelId]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    try {
      const res = await fetch(`/api/batches/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBatches(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete batch");
    }
  }

  if (isLoading) return <div style={{ padding: 10, fontSize: 12, color: TLP.gray400 }}>Loading batches...</div>;

  return (
    <div style={{ marginTop: 8, borderTop: `1px solid ${TLP.gray100}`, paddingTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase" }}>
          Weekly Slots
        </span>
      </div>

      {batches.length === 0 ? (
        <div style={{ fontSize: 12, color: TLP.gray400, padding: "4px 0" }}>
          No recurring slots scheduled.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {batches.map((batch) => (
            <div 
              key={batch.id} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "6px 8px",
                background: TLP.gray50,
                borderRadius: 6,
                fontSize: 13
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: TLP.navy, minWidth: 80 }}>
                  {batch.dayOfWeek}
                </span>
                <span style={{ color: TLP.gray600 }}>
                  {batch.startTime.substring(0, 5)} - {batch.endTime.substring(0, 5)}
                </span>
                <span style={{ fontSize: 11, background: TLP.gray200, padding: "2px 6px", borderRadius: 4, color: TLP.gray600 }}>
                  Cap: {batch.maxCapacity}
                </span>
              </div>
              <button 
                onClick={() => handleDelete(batch.id)}
                style={{ 
                  background: "none", 
                  border: "none", 
                  color: TLP.red, 
                  cursor: "pointer",
                  fontSize: 14,
                  opacity: 0.7
                }}
                title="Delete slot"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
