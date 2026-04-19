import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ enrollment?: string }>;
}) {
  const { enrollment: enrollmentId } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If no enrollment ID, show a generic "nothing to pay" state
  if (!enrollmentId) {
    return (
      <div className="p-8 max-w-xl">
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-8 text-center space-y-4">
          <span className="material-icons-round text-[48px] text-slate-600 block">shopping_cart</span>
          <h2 className="text-lg font-bold text-gray-900">No items to checkout</h2>
          <p className="text-slate-500 text-sm">
            Browse courses and enroll your child to get started.
          </p>
          <a
            href="/courses"
            className="inline-flex items-center gap-2 bg-primary hover:bg-purple-600 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-all mt-2"
          >
            Browse courses
          </a>
        </div>
      </div>
    );
  }

  // Fetch enrollment with course + student details
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select(`
      id, status,
      students(id, full_name, parent_id),
      courses(id, title, type, price_monthly, price_trial, locations(name, city))
    `)
    .eq("id", enrollmentId)
    .single();

  if (!enrollment) notFound();

  const course = enrollment.courses as any;
  const student = enrollment.students as any;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <a href="/parent/enrollments" className="text-slate-500 hover:text-white transition-colors">
          <span className="material-icons-round text-[20px]">arrow_back</span>
        </a>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-slate-500 text-sm mt-0.5">Complete your enrollment payment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Order Summary — right on desktop, top on mobile */}
        <div className="lg:col-span-2 lg:order-2">
          <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {/* Course */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-primary text-xl">school</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm">{course?.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 capitalize">{course?.type}</p>
                </div>
              </div>

              {/* Student */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo/15 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-indigo text-xl">person</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{student?.full_name}</p>
                  <p className="text-slate-500 text-xs">Student</p>
                </div>
              </div>

              {/* Location */}
              {course?.locations && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-round text-success text-xl">location_on</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{course.locations.name}</p>
                    <p className="text-slate-500 text-xs">{course.locations.city}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border-dark pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Monthly fee</span>
                <span className="text-white font-medium">
                  ${course?.price_monthly ?? "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax</span>
                <span className="text-slate-500">$0.00</span>
              </div>
              <div className="border-t border-border-dark pt-3 flex justify-between">
                <span className="text-gray-900 font-semibold">Total due today</span>
                <span className="text-gray-900 font-bold text-lg">
                  ${course?.price_monthly ?? "0.00"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form — left on desktop */}
        <div className="lg:col-span-3 lg:order-1">
          <CheckoutForm
            enrollmentId={enrollment.id}
            amount={course?.price_monthly ?? 0}
            courseTitle={course?.title ?? "Course"}
          />
        </div>
      </div>
    </div>
  );
}
