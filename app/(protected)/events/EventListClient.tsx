"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EventListClient({
  events,
  userRole,
  userId,
  childrenList,
  initialRegistrations,
}: {
  events: any[];
  userRole: string;
  userId: string;
  childrenList: any[];
  initialRegistrations: any[];
}) {
  const supabase = createClient();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "tournament":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "workshop":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "camp":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tournament":
        return "emoji_events";
      case "workshop":
        return "menu_book";
      case "camp":
        return "nature_people";
      default:
        return "group";
    }
  };

  async function handleRSVP(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEvent) return;

    setLoading(true);
    setError(null);

    const isStudentEvent = selectedEvent.type !== "parent_meeting";
    
    // Check if already registered
    const existing = registrations.find(
      r => r.event_id === selectedEvent.id && r.student_id === (isStudentEvent ? selectedChildId : null)
    );

    if (existing) {
      setError("Already registered for this event.");
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("event_registrations")
      .insert({
        event_id: selectedEvent.id,
        parent_id: userId,
        student_id: isStudentEvent ? selectedChildId : null,
        status: "registered"
      })
      .select()
      .single();

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }

    setRegistrations([...registrations, data]);
    setSelectedEvent(null);
  }

  function renderRSVPButton(event: any) {
    if (userRole !== "parent") return null;

    // parent meetings don't need a specific student
    if (event.type === "parent_meeting") {
      const isReg = registrations.some(r => r.event_id === event.id);
      if (isReg) {
        return (
          <button disabled className="mt-4 w-full py-2.5 rounded-xl border border-success/30 bg-success/10 text-success text-sm font-medium flex items-center justify-center gap-2">
            <span className="material-icons-round text-[18px]">check_circle</span>
            Registered
          </button>
        );
      }
      return (
        <button 
          onClick={() => { setSelectedEvent(event); setSelectedChildId(""); setError(null); }}
          className="mt-4 w-full py-2.5 rounded-xl bg-primary hover:bg-purple-600 text-white text-sm font-medium transition-colors"
        >
          RSVP Now
        </button>
      );
    }

    // student events
    return (
      <button 
        onClick={() => { setSelectedEvent(event); setSelectedChildId(childrenList[0]?.id || ""); setError(null); }}
        className="mt-4 w-full py-2.5 rounded-xl bg-primary hover:bg-purple-600 text-white text-sm font-medium transition-colors"
      >
        Register Student
      </button>
    );
  }

  return (
    <div>
      {events.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-8 text-center mt-6">
          <span className="material-icons-round text-4xl text-slate-600 mb-3">event_busy</span>
          <p className="text-white font-medium">No Upcoming Events</p>
          <p className="text-slate-400 text-sm mt-1">Check back later for new tournaments and workshops.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const date = new Date(event.event_date);
            const month = date.toLocaleDateString("en-US", { month: "short" });
            const day = date.getDate();

            // Find registrations for this event by this user
            const myRegs = registrations.filter(r => r.event_id === event.id);

            return (
              <div key={event.id} className="bg-card-dark border border-border-dark rounded-xl overflow-hidden flex flex-col hover:border-border-hover transition-colors">
                <div className="p-5 flex-1 relative">
                  <div className={`absolute top-4 right-4 px-2 py-0.5 rounded flex items-center gap-1 border text-[10px] uppercase font-bold tracking-wider ${getTypeStyle(event.type)}`}>
                    <span className="material-icons-round text-[12px]">{getTypeIcon(event.type)}</span>
                    {event.type.replace("_", " ")}
                  </div>
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-surface-dark border border-border-dark flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-error text-xs font-bold uppercase">{month}</span>
                      <span className="text-white text-xl font-bold leading-none mt-0.5">{day}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight mt-1 pr-16">{event.title}</h3>
                      <p className="text-slate-500 text-xs mt-1 font-medium">
                        {event.start_time?.slice(0,5)} - {event.end_time?.slice(0,5)}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm line-clamp-3 mb-4">{event.description}</p>
                  
                  <div className="space-y-1.5 mb-2 mt-auto">
                    {event.locations?.name && (
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="material-icons-round text-[14px]">location_on</span>
                        {event.locations.name}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="material-icons-round text-[14px]">payments</span>
                      {event.price > 0 ? `$${event.price}` : "Free"}
                    </p>
                    {event.capacity && (
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="material-icons-round text-[14px]">group</span>
                        Capacity: {event.capacity}
                      </p>
                    )}
                  </div>

                  {/* Show who is registered */}
                  {myRegs.length > 0 && event.type !== "parent_meeting" && (
                    <div className="mt-3 pt-3 border-t border-border-dark flex flex-wrap gap-2">
                      {myRegs.map(r => {
                        const child = childrenList.find(c => c.id === r.student_id);
                        return (
                          <span key={r.student_id} className="text-[11px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-icons-round text-[12px]">check</span>
                            {child?.full_name || "Registered"}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="px-5 pb-5 pt-2">
                  {renderRSVPButton(event)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RSVP Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-dark border border-border-dark rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-border-dark flex justify-between items-center bg-surface-dark">
              <h2 className="text-lg font-bold text-white">Complete Registration</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-icons-round">close</span>
              </button>
            </div>
            
            <form onSubmit={handleRSVP} className="p-6">
              <div className="mb-6">
                <h3 className="text-white font-medium mb-1">{selectedEvent.title}</h3>
                <p className="text-slate-400 text-sm">
                  {new Date(selectedEvent.event_date).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedEvent.start_time?.slice(0,5)}
                </p>
                <div className="mt-3 inline-block bg-surface-dark border border-border-dark rounded-lg px-3 py-1.5">
                  <span className="text-xs text-slate-400">Fee:</span>
                  <span className="text-sm font-bold text-white ml-2">{selectedEvent.price > 0 ? `$${selectedEvent.price}` : "Free"}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-error/10 border border-error/20 rounded-lg p-3 text-sm text-error flex items-center gap-2">
                  <span className="material-icons-round text-lg">error_outline</span>
                  {error}
                </div>
              )}
              
              {selectedEvent.type !== "parent_meeting" && (
                <div className="mb-6">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Student</label>
                  <select 
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  >
                    {!childrenList.length && <option value="">No children found</option>}
                    {childrenList.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2.5 bg-surface-dark hover:bg-surface-hover text-white text-sm font-medium rounded-xl transition-colors border border-border-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (selectedEvent.type !== "parent_meeting" && !selectedChildId)}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-purple-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading && <span className="material-icons-round animate-spin text-[18px]">autorenew</span>}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
