"use client";

import { useMemo } from "react";

export default function ProgressClient({ attendance }: { attendance: any[] }) {
  
  const stats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === "present" || a.status === "late").length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    const late = attendance.filter(a => a.is_late).length;
    const absent = attendance.filter(a => a.status === "absent").length;
    return { total, present, rate, late, absent };
  }, [attendance]);

  const getStatusStyle = (s: string, l: boolean) => {
    if (s === "absent") return "bg-error/10 text-error border-error/20";
    if (s === "excused") return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    if (l) return "bg-warning/10 text-warning border-warning/20";
    return "bg-success/10 text-success border-success/20";
  };

  const getStatusText = (s: string, l: boolean) => {
    if (s === "absent") return "Absent";
    if (s === "excused") return "Excused";
    if (l) return "Late";
    return "Present";
  };

  return (
    <>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-4">
          <p className="text-xs text-slate-500 mb-1">Attendance Rate</p>
          <p className="text-2xl font-bold text-gray-900">{stats.rate}%</p>
        </div>
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-4">
          <p className="text-xs text-slate-500 mb-1">Classes Attended</p>
          <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
        </div>
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-4">
          <p className="text-xs text-slate-500 mb-1">Late Arrivals</p>
          <p className={`text-2xl font-bold ${stats.late > 0 ? "text-warning" : "text-white"}`}>{stats.late}</p>
        </div>
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-4">
          <p className="text-xs text-slate-500 mb-1">Absences</p>
          <p className={`text-2xl font-bold ${stats.absent > 0 ? "text-error" : "text-white"}`}>{stats.absent}</p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-border-dark">
          <h2 className="text-lg font-bold text-gray-900">Recent Attendance & Notes</h2>
        </div>
        
        {attendance.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-icons-round text-3xl text-slate-600 mb-2">history</span>
            <p className="text-slate-500 text-sm">No recent attendance records found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {attendance.map((record, i) => (
              <div key={i} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      {record.sessions?.courses?.title || "Unknown Class"}
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(record.checked_in_at || record.sessions?.start_at).toLocaleDateString("en-US", {
                        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getStatusStyle(record.status, record.is_late)}`}>
                    {getStatusText(record.status, record.is_late)}
                  </span>
                </div>
                
                {record.notes ? (
                  <div className="mt-3 bg-surface-dark border border-border-dark rounded-lg p-3">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Coach Note</p>
                    <p className="text-sm text-slate-700 italic">"{record.notes}"</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-2 italic">No notes for this session.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
