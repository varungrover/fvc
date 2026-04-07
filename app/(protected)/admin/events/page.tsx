import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TYPE_STYLES: Record<string, { label: string; classes: string; icon: string }> = {
  tournament: { label: "Tournament", classes: "bg-primary/10 text-primary", icon: "emoji_events" },
  workshop: { label: "Workshop", classes: "bg-purple/10 text-purple", icon: "school" },
  camp: { label: "Camp", classes: "bg-success/10 text-success", icon: "hiking" },
  meeting: { label: "Meeting", classes: "bg-caution/10 text-caution", icon: "groups" },
};

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  upcoming: { label: "Upcoming", classes: "bg-primary/10 text-primary" },
  ongoing: { label: "Ongoing", classes: "bg-success/10 text-success" },
  completed: { label: "Completed", classes: "bg-slate-700 text-slate-400" },
  cancelled: { label: "Cancelled", classes: "bg-error/10 text-error" },
};

function formatTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: events } = await supabase
    .from("events")
    .select(`
      id, title, description, type, event_date, start_time, end_time,
      price, capacity, is_public, status,
      locations(name, city),
      event_registrations(id, status)
    `)
    .order("event_date", { ascending: true });

  const today = new Date().toISOString().split("T")[0];
  const upcoming = (events ?? []).filter((e) => e.event_date >= today);
  const past = (events ?? []).filter((e) => e.event_date < today);

  function EventCard({ event }: { event: any }) {
    const typeStyle = TYPE_STYLES[event.type] ?? { label: event.type, classes: "bg-slate-700 text-slate-400", icon: "event" };
    const statusStyle = STATUS_STYLES[event.status] ?? { label: event.status, classes: "bg-slate-700 text-slate-400" };
    const registrations = (event.event_registrations ?? []).filter((r: any) => r.status !== "cancelled");
    const spotsLeft = event.capacity ? event.capacity - registrations.length : null;

    return (
      <div className="bg-card-dark border border-border-dark rounded-xl p-5 hover:border-primary/30 transition-all">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeStyle.classes}`}>
              {typeStyle.label}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle.classes}`}>
              {statusStyle.label}
            </span>
            {!event.is_public && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Private</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="material-icons-round text-[16px] text-slate-500">people</span>
            <span className="text-sm font-semibold text-white">{registrations.length}</span>
            {event.capacity && <span className="text-xs text-slate-500">/ {event.capacity}</span>}
          </div>
        </div>

        <h3 className="text-white font-bold text-base mb-2">{event.title}</h3>

        {event.description && (
          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{event.description}</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <span className="material-icons-round text-[14px]">calendar_today</span>
            {new Date(event.event_date + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" })}
          </span>
          {event.start_time && (
            <span className="flex items-center gap-1">
              <span className="material-icons-round text-[14px]">schedule</span>
              {formatTime(event.start_time)}{event.end_time ? `–${formatTime(event.end_time)}` : ""}
            </span>
          )}
          {event.locations && (
            <span className="flex items-center gap-1">
              <span className="material-icons-round text-[14px]">location_on</span>
              {event.locations.name}
            </span>
          )}
          {event.price > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-icons-round text-[14px]">payments</span>
              ${event.price}
            </span>
          )}
        </div>

        {spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0 && (
          <p className="mt-2 text-xs font-semibold text-warning">Only {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</p>
        )}
        {spotsLeft !== null && spotsLeft <= 0 && (
          <p className="mt-2 text-xs font-semibold text-error">Fully booked</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-slate-400 text-sm mt-1">Tournaments, workshops, camps, and meetings.</p>
        </div>
        <span className="text-xs text-slate-500 bg-surface-dark border border-border-dark rounded-lg px-3 py-2 font-medium">
          {upcoming.length} upcoming
        </span>
      </div>

      {(events ?? []).length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-12 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">event</span>
          <p className="text-slate-400 font-medium">No events yet</p>
          <p className="text-slate-500 text-sm mt-1">Events can be created directly in the database for now.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Upcoming</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcoming.map((event: any) => <EventCard key={event.id} event={event} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Past</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-60">
                {past.map((event: any) => <EventCard key={event.id} event={event} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
