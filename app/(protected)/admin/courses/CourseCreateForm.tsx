"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Location = { id: string; name: string; city: string };

export default function CourseCreateForm({ locations }: { locations: Location[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lesson",
    skill_level: "beginner",
    age_min: "",
    age_max: "",
    price_trial: "0",
    price_monthly: "",
    max_students: "12",
    day_of_week: "",
    start_time: "",
    end_time: "",
    location_id: locations[0]?.id ?? "",
    status: "active",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.from("courses").insert({
      title: form.title,
      description: form.description || null,
      type: form.type,
      skill_level: form.skill_level,
      age_min: form.age_min ? parseInt(form.age_min) : null,
      age_max: form.age_max ? parseInt(form.age_max) : null,
      price_trial: parseFloat(form.price_trial) || 0,
      price_monthly: form.price_monthly ? parseFloat(form.price_monthly) : null,
      max_students: form.max_students ? parseInt(form.max_students) : 12,
      day_of_week: form.day_of_week || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      location_id: form.location_id || null,
      status: form.status,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setForm({
      title: "",
      description: "",
      type: "lesson",
      skill_level: "beginner",
      age_min: "",
      age_max: "",
      price_trial: "0",
      price_monthly: "",
      max_students: "12",
      day_of_week: "",
      start_time: "",
      end_time: "",
      location_id: locations[0]?.id ?? "",
      status: "active",
    });
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-primary hover:bg-purple-600 text-white font-medium py-2.5 px-5 rounded-lg text-sm shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all"
      >
        <span className="material-icons-round text-lg">add</span>
        Create new course
      </button>
    );
  }

  const inputClass =
    "w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card-dark border border-primary/30 rounded-xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-white">Create New Course</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <span className="material-icons-round text-[20px]">close</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className={labelClass}>Course title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Intermediate Chess Club"
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Brief course description..."
            rows={2}
            className={inputClass}
          />
        </div>

        {/* Type */}
        <div>
          <label className={labelClass}>Type *</label>
          <select
            value={form.type}
            onChange={(e) => updateField("type", e.target.value)}
            className={inputClass}
          >
            <option value="lesson">Lesson</option>
            <option value="club">Club</option>
            <option value="camp">Camp</option>
            <option value="tournament">Tournament</option>
          </select>
        </div>

        {/* Skill level */}
        <div>
          <label className={labelClass}>Skill level</label>
          <select
            value={form.skill_level}
            onChange={(e) => updateField("skill_level", e.target.value)}
            className={inputClass}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="open">Open (all levels)</option>
          </select>
        </div>

        {/* Age range */}
        <div>
          <label className={labelClass}>Age range</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={form.age_min}
              onChange={(e) => updateField("age_min", e.target.value)}
              placeholder="Min"
              min={3}
              max={18}
              className={inputClass}
            />
            <span className="text-slate-500 text-sm">to</span>
            <input
              type="number"
              value={form.age_max}
              onChange={(e) => updateField("age_max", e.target.value)}
              placeholder="Max"
              min={3}
              max={18}
              className={inputClass}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className={labelClass}>Location</label>
          <select
            value={form.location_id}
            onChange={(e) => updateField("location_id", e.target.value)}
            className={inputClass}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.city}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing */}
        <div>
          <label className={labelClass}>Trial price ($)</label>
          <input
            type="number"
            value={form.price_trial}
            onChange={(e) => updateField("price_trial", e.target.value)}
            step="0.01"
            min="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Monthly price ($)</label>
          <input
            type="number"
            value={form.price_monthly}
            onChange={(e) => updateField("price_monthly", e.target.value)}
            step="0.01"
            min="0"
            placeholder="Leave empty if free"
            className={inputClass}
          />
        </div>

        {/* Schedule */}
        <div>
          <label className={labelClass}>Day of week</label>
          <select
            value={form.day_of_week}
            onChange={(e) => updateField("day_of_week", e.target.value)}
            className={inputClass}
          >
            <option value="">Not scheduled</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Time</label>
          <div className="flex gap-2 items-center">
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => updateField("start_time", e.target.value)}
              className={inputClass}
            />
            <span className="text-slate-500 text-sm">to</span>
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => updateField("end_time", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Max students */}
        <div>
          <label className={labelClass}>Max students</label>
          <input
            type="number"
            value={form.max_students}
            onChange={(e) => updateField("max_students", e.target.value)}
            min={1}
            className={inputClass}
          />
        </div>

        {/* Status */}
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-purple-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg text-sm shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all"
        >
          {loading ? "Creating…" : "Create course"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-border-dark text-slate-300 hover:text-white hover:bg-surface-hover font-medium py-2.5 px-5 rounded-lg text-sm transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
