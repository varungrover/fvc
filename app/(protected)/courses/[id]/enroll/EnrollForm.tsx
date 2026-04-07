"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Student = { id: string; full_name: string };
type Course = {
  id: string;
  title: string;
  type: string;
  price_trial: number;
  price_monthly: number | null;
};

export default function EnrollForm({
  course,
  students,
}: {
  course: Course;
  students: Student[];
}) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [enrollType, setEnrollType] = useState<"trial" | "full">("trial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    if (enrollType === "trial") {
      const { error: err } = await supabase.from("enrollments").insert({
        student_id: studentId,
        course_id: course.id,
        status: "trial",
        trial_date: new Date().toISOString().split("T")[0],
      });

      if (err) {
        setError(err.code === "23505" ? "This child is already enrolled in this course." : err.message);
        setLoading(false);
        return;
      }

      setDone(true);
    } else {
      // Full enrollment → create pending enrollment then go to checkout
      const { data: enrollment, error: err } = await supabase
        .from("enrollments")
        .insert({
          student_id: studentId,
          course_id: course.id,
          status: "pending_payment",
        })
        .select("id")
        .single();

      if (err) {
        if (err.code === "23505") {
          setError("This child is already enrolled in this course.");
        } else {
          setError(err.message);
        }
        setLoading(false);
        return;
      }

      router.push(`/checkout?enrollment=${enrollment.id}`);
      return;
    }

    setLoading(false);
  }

  if (done) {
    return (
      <div className="bg-card-dark border border-border-dark rounded-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <span className="material-icons-round text-success text-[32px]">check_circle</span>
        </div>
        <h2 className="text-xl font-bold text-white">Trial booked!</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          {students.find((s) => s.id === studentId)?.full_name} has been registered for a trial class in{" "}
          <span className="text-white font-medium">{course.title}</span>. We'll be in touch with the details.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/parent/enrollments"
            className="bg-primary hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-all"
          >
            View my enrollments
          </Link>
          <Link
            href="/courses"
            className="border border-border-dark text-slate-300 hover:text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-all"
          >
            Browse more courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-6">
      {/* Child selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Enroll which child?</label>
        {students.length === 0 ? (
          <div className="bg-warning/10 border border-warning/30 rounded-lg px-4 py-3 text-warning text-sm">
            You need to add a child profile first.{" "}
            <Link href="/parent/children/add" className="underline font-medium">
              Add child →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((s) => (
              <label
                key={s.id}
                className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  studentId === s.id
                    ? "border-primary bg-primary/5"
                    : "border-border-dark hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="student"
                  value={s.id}
                  checked={studentId === s.id}
                  onChange={() => setStudentId(s.id)}
                  className="accent-primary"
                />
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">
                    {s.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <span className="text-white font-medium text-sm">{s.full_name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Enrollment type */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Enrollment type</label>
        <div className="space-y-2">
          <label
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
              enrollType === "trial"
                ? "border-success bg-success/5"
                : "border-border-dark hover:border-slate-600"
            }`}
          >
            <input
              type="radio"
              name="enrollType"
              value="trial"
              checked={enrollType === "trial"}
              onChange={() => setEnrollType("trial")}
              className="accent-primary mt-0.5"
            />
            <div>
              <p className="text-white font-semibold text-sm">
                Trial class
                <span className="ml-2 text-success font-semibold">
                  {Number(course.price_trial) === 0 ? "Free" : `$${course.price_trial}`}
                </span>
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Attend one session — no commitment required.
              </p>
            </div>
          </label>

          {course.price_monthly && (
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                enrollType === "full"
                  ? "border-primary bg-primary/5"
                  : "border-border-dark hover:border-slate-600"
              }`}
            >
              <input
                type="radio"
                name="enrollType"
                value="full"
                checked={enrollType === "full"}
                onChange={() => setEnrollType("full")}
                className="accent-primary mt-0.5"
              />
              <div>
                <p className="text-white font-semibold text-sm">
                  Full enrollment
                  <span className="ml-2 text-primary font-semibold">${course.price_monthly}/month</span>
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Full access to all sessions this month. Cancel anytime.
                </p>
              </div>
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">{error}</div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading || students.length === 0}
          className="flex-1 bg-primary hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg shadow-[0_0_10px_rgba(43,108,238,0.2)] transition-all duration-200 text-sm"
        >
          {loading
            ? "Processing…"
            : enrollType === "trial"
            ? "Book trial class"
            : "Proceed to payment →"}
        </button>
        <Link
          href={`/courses/${course.id}`}
          className="px-5 py-3 border border-border-dark rounded-lg text-slate-300 hover:text-white hover:bg-surface-hover font-medium text-sm transition-all duration-200 flex items-center"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
