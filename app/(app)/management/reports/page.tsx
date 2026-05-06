"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { StatTile } from "@/components/ui/StatTile";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP } from "@/lib/theme/tokens";

type ReportStatus = "idle" | "generating" | "ready";

type Report = {
  id: string;
  title: string;
  description: string;
  lastGenerated: string;
  icon: string;
  iconBg: string;
  iconColor: string;
};

const REPORTS: Report[] = [
  {
    id: "revenue_summary",
    title: "Revenue Summary",
    description: "Monthly revenue breakdown by ownership, location, and planet. Includes paid/failed invoice analysis.",
    lastGenerated: "May 1, 2026",
    icon: "💰",
    iconBg: TLP.amberLight,
    iconColor: TLP.amber,
  },
  {
    id: "enrollment_trends",
    title: "Enrollment Trends",
    description: "Student enrollment trends by planet over the past 6 months. Identifies growth and churn patterns.",
    lastGenerated: "May 1, 2026",
    icon: "📈",
    iconBg: TLP.tealLight,
    iconColor: TLP.teal,
  },
  {
    id: "coach_utilization",
    title: "Coach Utilization",
    description: "Coach capacity vs actual hours taught per location. Highlights under- and over-utilization.",
    lastGenerated: "Apr 28, 2026",
    icon: "🧑‍🏫",
    iconBg: TLP.blueLight,
    iconColor: TLP.blue,
  },
  {
    id: "attendance_rate",
    title: "Attendance Rate",
    description: "Network-wide attendance statistics by location and planet. Tracks present, absent, and makeup sessions.",
    lastGenerated: "May 1, 2026",
    icon: "✅",
    iconBg: TLP.greenLight,
    iconColor: TLP.green,
  },
  {
    id: "price_change_history",
    title: "Price Change History",
    description: "Full audit log of all pricing requests: submitted, reviewed, approved, and rejected, with timestamps.",
    lastGenerated: "Apr 29, 2026",
    icon: "💲",
    iconBg: TLP.purpleLight,
    iconColor: TLP.purple,
  },
];

export default function ReportsPage() {
  const [reportStatuses, setReportStatuses] = useState<Record<string, ReportStatus>>(
    Object.fromEntries(REPORTS.map((r) => [r.id, "idle"])),
  );
  const [previewReport, setPreviewReport] = useState<Report | null>(null);

  function handleGenerate(report: Report) {
    setReportStatuses((prev) => ({ ...prev, [report.id]: "generating" }));
    setTimeout(() => {
      setReportStatuses((prev) => ({ ...prev, [report.id]: "ready" }));
      setPreviewReport(report);
    }, 1800);
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Reports"
        subtitle="Network KPIs and downloadable management reports"
      />

      {/* KPI summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <StatTile
          label="Enrolled Students"
          value={52}
          delta="Network-wide"
          deltaColor={TLP.gray500}
          icon="🎓"
          iconBg={TLP.tealLight}
          iconColor={TLP.teal}
        />
        <StatTile
          label="Avg Attendance"
          value="92%"
          delta="↑ 3% vs last month"
          deltaColor={TLP.green}
          icon="✅"
          iconBg={TLP.greenLight}
          iconColor={TLP.green}
        />
        <StatTile
          label="Top Planet"
          value="Chess"
          delta="38% of enrollments"
          deltaColor={TLP.gray500}
          icon="♟"
          iconBg={TLP.tealLight}
          iconColor={TLP.teal}
        />
        <StatTile
          label="Net Revenue"
          value="$3,652"
          delta="April 2026"
          deltaColor={TLP.green}
          icon="💰"
          iconBg={TLP.amberLight}
          iconColor={TLP.amber}
        />
      </div>

      {/* Report tiles grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {REPORTS.map((report) => {
          const status = reportStatuses[report.id];
          return (
            <Card key={report.id} style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: report.iconBg,
                    color: report.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {report.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TLP.navy, marginBottom: 4 }}>
                    {report.title}
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500, lineHeight: 1.5 }}>
                    {report.description}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: `1px solid ${TLP.gray100}`,
                }}
              >
                <span style={{ fontSize: 11, color: TLP.gray400 }}>
                  Last generated: {report.lastGenerated}
                </span>

                {status === "idle" && (
                  <Button variant="secondary" size="sm" onClick={() => handleGenerate(report)}>
                    Generate
                  </Button>
                )}

                {status === "generating" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TLP.teal, fontWeight: 600 }}>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: `2px solid ${TLP.teal}`,
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Generating…
                  </div>
                )}

                {status === "ready" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewReport(report)}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon="⬇"
                    >
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Report ready modal */}
      <Modal
        open={!!previewReport}
        onClose={() => setPreviewReport(null)}
        title={previewReport ? `Report Ready: ${previewReport.title}` : ""}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPreviewReport(null)}>
              Close
            </Button>
            <Button variant="primary" icon="⬇">
              Download CSV
            </Button>
          </>
        }
      >
        {previewReport && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: TLP.greenLight,
                borderRadius: 10,
                border: `1px solid ${TLP.green}30`,
              }}
            >
              <span style={{ fontSize: 22 }}>{previewReport.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: TLP.green, fontSize: 14 }}>Report Generated Successfully</div>
                <div style={{ fontSize: 12, color: TLP.gray600 }}>
                  {previewReport.title} · Generated just now
                </div>
              </div>
            </div>

            <div
              style={{
                background: TLP.gray50,
                borderRadius: 10,
                border: `1px solid ${TLP.gray200}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "8px 14px",
                  background: TLP.gray100,
                  borderBottom: `1px solid ${TLP.gray200}`,
                  fontSize: 11,
                  fontWeight: 700,
                  color: TLP.gray600,
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                }}
              >
                Preview (first 5 rows)
              </div>
              <div style={{ padding: "12px 14px", fontSize: 12, fontFamily: "monospace", color: TLP.gray700, lineHeight: 1.8 }}>
                {previewReport.id === "revenue_summary" && (
                  <>
                    <div style={{ color: TLP.gray500 }}>month,ownership,location,planet,revenue,enrollments</div>
                    <div>Apr 2026,TLP,Surrey Central,Chess,$1200,9</div>
                    <div>Apr 2026,TLP,Surrey Central,Math,$900,6</div>
                    <div>Apr 2026,TLP,Surrey Central,Finance,$500,4</div>
                    <div>Apr 2026,TLP,Abbotsford,Math,$400,3</div>
                    <div>Apr 2026,TLP,Langley,English,$600,4</div>
                  </>
                )}
                {previewReport.id === "enrollment_trends" && (
                  <>
                    <div style={{ color: TLP.gray500 }}>month,planet,new_enrollments,cancelled,net</div>
                    <div>Feb 2026,Chess,8,0,+8</div>
                    <div>Feb 2026,Math,6,0,+6</div>
                    <div>Mar 2026,Chess,2,0,+2</div>
                    <div>Mar 2026,Finance,3,0,+3</div>
                    <div>Apr 2026,Chess,1,0,+1</div>
                  </>
                )}
                {previewReport.id === "coach_utilization" && (
                  <>
                    <div style={{ color: TLP.gray500 }}>coach,location,batches_assigned,capacity_pct,status</div>
                    <div>Priya Patel,Surrey Central,4,80%,active</div>
                    <div>Aiden Chen,Abbotsford,2,40%,active</div>
                    <div>Sara Wong,Langley,2,40%,active</div>
                    <div>Mike Thompson,Surrey Central,2,40%,active</div>
                    <div>James Park,Surrey Central,1,20%,on_leave</div>
                  </>
                )}
                {previewReport.id === "attendance_rate" && (
                  <>
                    <div style={{ color: TLP.gray500 }}>location,planet,sessions,present,absent,rate</div>
                    <div>Surrey Central,Chess,24,22,2,91.7%</div>
                    <div>Surrey Central,Math,16,15,1,93.8%</div>
                    <div>Surrey Central,Finance,8,8,0,100%</div>
                    <div>Langley,English,8,7,1,87.5%</div>
                    <div>Toronto Downtown,Chess,12,11,1,91.7%</div>
                  </>
                )}
                {previewReport.id === "price_change_history" && (
                  <>
                    <div style={{ color: TLP.gray500 }}>id,ownership,course,current,requested,status,submitted,reviewed</div>
                    <div>pcr_3,MLA,Math G5 1x,$159,$175,rejected,Feb 10,Feb 14</div>
                    <div>pcr_2,MLA,Finance Basics 1x,$129,$139,approved,Mar 1,Mar 5</div>
                    <div>pcr_1,MLA,Chess PP 1x,$139,$149,pending,Apr 15,—</div>
                    <div>pcr_4,MLA,Finance Invest 1x,$169,$179,pending,Apr 28,—</div>
                    <div>pcr_5,MLA,English G5 1x,$159,$169,pending,May 1,—</div>
                  </>
                )}
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 12, color: TLP.gray500 }}>
              Download the full report as CSV for use in Excel or Google Sheets.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
