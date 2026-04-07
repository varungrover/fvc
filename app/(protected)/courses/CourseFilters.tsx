"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Location = { id: string; name: string; city: string };

export default function CourseFilters({ locations }: { locations: Location[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/courses?${params.toString()}`);
    },
    [router, searchParams]
  );

  const type = searchParams.get("type") ?? "";
  const skill = searchParams.get("skill") ?? "";
  const location = searchParams.get("location") ?? "";

  const selectClass =
    "bg-surface-dark border border-border-dark text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={type}
        onChange={(e) => updateFilter("type", e.target.value)}
        className={selectClass}
      >
        <option value="">All types</option>
        <option value="lesson">Lessons</option>
        <option value="club">Clubs</option>
        <option value="camp">Camps</option>
        <option value="tournament">Tournaments</option>
      </select>

      <select
        value={skill}
        onChange={(e) => updateFilter("skill", e.target.value)}
        className={selectClass}
      >
        <option value="">All levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
        <option value="open">Open</option>
      </select>

      <select
        value={location}
        onChange={(e) => updateFilter("location", e.target.value)}
        className={selectClass}
      >
        <option value="">All locations</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>

      {(type || skill || location) && (
        <button
          onClick={() => router.push("/courses")}
          className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span className="material-icons-round text-[16px]">close</span>
          Clear filters
        </button>
      )}
    </div>
  );
}
