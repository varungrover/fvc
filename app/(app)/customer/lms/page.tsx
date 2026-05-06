"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { MEMBERS_BY_CUSTOMER } from "@/lib/mock/members";
import { ENROLLMENTS_BY_MEMBER } from "@/lib/mock/enrollments";
import { BATCH_BY_ID } from "@/lib/mock/batches";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import {
  LMS_MODULES,
  LMS_QUIZZES,
  LMS_QUIZ_QUESTIONS,
  LMS_QUIZ_ATTEMPTS,
  TOPICS_BY_MODULE,
  MODULES_BY_LEVEL,
} from "@/lib/mock/lmsContent";
import type { Member, Level, LmsModule, LmsTopic, LmsQuiz } from "@/lib/types";

const CUSTOMER_ID = "cust_raj";
const AVATAR_COLORS = [TLP.teal, TLP.purple, TLP.navy, TLP.blue];

function getMemberLevels(member: Member): { level: Level; planetName: string }[] {
  const enrollments = (ENROLLMENTS_BY_MEMBER[member.id] ?? []).filter(
    (e) => e.status === "active",
  );
  const seen = new Set<string>();
  return enrollments
    .map((e) => {
      const batch = BATCH_BY_ID[e.batchId];
      const level = batch ? LEVEL_BY_ID[batch.levelId] : null;
      const planet = level ? PLANET_BY_ID[level.planetId] : null;
      if (!level || seen.has(level.id)) return null;
      seen.add(level.id);
      return { level, planetName: planet?.name ?? "" };
    })
    .filter(Boolean) as { level: Level; planetName: string }[];
}

function getModuleQuiz(moduleId: string): LmsQuiz | null {
  return (
    LMS_QUIZZES.find((q) => q.referenceType === "module" && q.referenceId === moduleId) ?? null
  );
}

function hasPassed(quizId: string, memberId: string): boolean {
  const quiz = LMS_QUIZZES.find((q) => q.id === quizId);
  if (!quiz) return false;
  const attempt = LMS_QUIZ_ATTEMPTS.find(
    (a) => a.quizId === quizId && a.memberId === memberId,
  );
  return !!(attempt && attempt.score >= quiz.passingScorePct);
}

function isModuleLocked(modules: LmsModule[], moduleIndex: number, memberId: string): boolean {
  // A module is locked if the previous module has a quiz that hasn't been passed
  if (moduleIndex === 0) return false;
  const prev = modules[moduleIndex - 1];
  const prevQuiz = getModuleQuiz(prev.id);
  if (!prevQuiz) return false;
  return !hasPassed(prevQuiz.id, memberId);
}

export default function LmsPage() {
  const members = MEMBERS_BY_CUSTOMER[CUSTOMER_ID] ?? [];
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id ?? "");
  const selectedMember = members.find((m) => m.id === selectedMemberId) ?? members[0];

  const levels = selectedMember ? getMemberLevels(selectedMember) : [];
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const activeLevelId = selectedLevelId ?? levels[0]?.level.id ?? null;

  const modules = activeLevelId
    ? (MODULES_BY_LEVEL[activeLevelId] ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
    modules[0]?.id ?? null,
  );
  const [selectedTopic, setSelectedTopic] = useState<LmsTopic | null>(null);
  const [quizState, setQuizState] = useState<{
    quiz: LmsQuiz;
    answers: Record<string, string>;
    submitted: boolean;
    score: number;
  } | null>(null);

  const activeLevelInfo = levels.find((l) => l.level.id === activeLevelId);

  function handleLevelChange(levelId: string) {
    setSelectedLevelId(levelId);
    setExpandedModuleId(null);
    setSelectedTopic(null);
    setQuizState(null);
  }

  function handleModuleClick(mod: LmsModule, locked: boolean) {
    if (locked) return;
    setExpandedModuleId((prev) => (prev === mod.id ? null : mod.id));
    setSelectedTopic(null);
  }

  function handleTopicClick(topic: LmsTopic) {
    setSelectedTopic(topic);
    setQuizState(null);
  }

  function openQuiz(quiz: LmsQuiz) {
    setQuizState({ quiz, answers: {}, submitted: false, score: 0 });
  }

  function submitQuiz() {
    if (!quizState) return;
    const questions = LMS_QUIZ_QUESTIONS.filter((q) => q.quizId === quizState.quiz.id);
    const correct = questions.filter(
      (q) => quizState.answers[q.id] === q.correctAnswer,
    ).length;
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setQuizState((s) => s && { ...s, submitted: true, score });
  }

  const completedTopics = selectedMember
    ? (TOPICS_BY_MODULE[expandedModuleId ?? ""] ?? []).length
    : 0;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header: member picker */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: TLP.navy }}>
          Learning Portal
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          {members.map((m, i) => {
            const isActive = m.id === selectedMemberId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMemberId(m.id);
                  setSelectedLevelId(null);
                  setExpandedModuleId(null);
                  setSelectedTopic(null);
                  setQuizState(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `2px solid ${isActive ? TLP.teal : TLP.gray200}`,
                  background: isActive ? TLP.tealLight : TLP.white,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? TLP.teal : TLP.gray600,
                  fontFamily: "inherit",
                }}
              >
                <Avatar
                  name={m.fullName}
                  size={22}
                  color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                />
                {m.fullName.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {levels.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <h3 style={{ margin: "0 0 8px", color: TLP.navy }}>No enrolled courses</h3>
          <p style={{ margin: 0, color: TLP.gray500, fontSize: 14 }}>
            {selectedMember?.fullName} isn't enrolled in any courses yet.
          </p>
        </Card>
      ) : (
        <>
          {/* Level tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {levels.map(({ level, planetName }) => {
              const ps = planetStyle(planetName);
              const isActive = level.id === activeLevelId;
              return (
                <button
                  key={level.id}
                  onClick={() => handleLevelChange(level.id)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 8,
                    border: `2px solid ${isActive ? ps.color : TLP.gray200}`,
                    background: isActive ? ps.bg : TLP.white,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? ps.color : TLP.gray600,
                    fontFamily: "inherit",
                  }}
                >
                  {ps.icon} {planetName} · {level.name}
                </button>
              );
            })}
          </div>

          {/* Main: course outline + content */}
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
            {/* Course outline */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {modules.length === 0 ? (
                <Card style={{ padding: 24, textAlign: "center" }}>
                  <p style={{ margin: 0, color: TLP.gray500, fontSize: 13 }}>
                    No content available yet.
                  </p>
                </Card>
              ) : (
                modules.map((mod, idx) => {
                  const locked = isModuleLocked(
                    modules,
                    idx,
                    selectedMember?.id ?? "",
                  );
                  const quiz = getModuleQuiz(mod.id);
                  const passed = quiz && selectedMember
                    ? hasPassed(quiz.id, selectedMember.id)
                    : false;
                  const topics = (TOPICS_BY_MODULE[mod.id] ?? []).sort(
                    (a, b) => a.sortOrder - b.sortOrder,
                  );
                  const isExpanded = expandedModuleId === mod.id && !locked;

                  return (
                    <div key={mod.id}>
                      <button
                        onClick={() => handleModuleClick(mod, locked)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: `1.5px solid ${isExpanded ? TLP.teal : TLP.gray200}`,
                          background: isExpanded ? TLP.tealLight : locked ? TLP.gray50 : TLP.white,
                          cursor: locked ? "not-allowed" : "pointer",
                          textAlign: "left",
                          fontFamily: "inherit",
                          opacity: locked ? 0.6 : 1,
                          transition: "all 0.15s",
                        }}
                      >
                        <span style={{ fontSize: 16, flexShrink: 0 }}>
                          {locked ? "🔒" : passed ? "✅" : "📖"}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: locked ? TLP.gray400 : TLP.navy,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {idx + 1}. {mod.title}
                          </div>
                          <div style={{ fontSize: 11, color: TLP.gray500, marginTop: 1 }}>
                            {topics.length} topic{topics.length !== 1 ? "s" : ""}
                            {quiz ? (locked ? "" : passed ? " · Quiz passed" : " · Quiz") : ""}
                          </div>
                        </div>
                        {!locked && (
                          <span
                            style={{
                              fontSize: 12,
                              color: TLP.gray400,
                              transform: isExpanded ? "rotate(90deg)" : "none",
                              transition: "transform 0.15s",
                              flexShrink: 0,
                            }}
                          >
                            ▶
                          </span>
                        )}
                      </button>

                      {/* Topics list */}
                      {isExpanded && (
                        <div
                          style={{
                            marginLeft: 12,
                            marginTop: 4,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {topics.map((topic) => {
                            const isActive = selectedTopic?.id === topic.id;
                            return (
                              <button
                                key={topic.id}
                                onClick={() => handleTopicClick(topic)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "8px 12px",
                                  borderRadius: 8,
                                  border: "none",
                                  background: isActive ? TLP.navy : "transparent",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  fontFamily: "inherit",
                                  fontSize: 12,
                                  fontWeight: isActive ? 600 : 400,
                                  color: isActive ? "#fff" : TLP.gray600,
                                  transition: "all 0.1s",
                                  width: "100%",
                                }}
                              >
                                <span style={{ flexShrink: 0 }}>
                                  {topic.contentType === "youtube"
                                    ? "▶"
                                    : topic.contentType === "pdf"
                                      ? "📄"
                                      : "📝"}
                                </span>
                                <span style={{ flex: 1 }}>{topic.title}</span>
                              </button>
                            );
                          })}

                          {/* Quiz button */}
                          {quiz && !passed && (
                            <button
                              onClick={() => openQuiz(quiz)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: `1.5px solid ${TLP.amber}`,
                                background: TLP.amberLight,
                                cursor: "pointer",
                                textAlign: "left",
                                fontFamily: "inherit",
                                fontSize: 12,
                                fontWeight: 700,
                                color: TLP.navy,
                                marginTop: 4,
                                width: "100%",
                              }}
                            >
                              <span>📝</span>
                              <span>Take Module Quiz</span>
                            </button>
                          )}
                          {quiz && passed && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                color: TLP.green,
                                marginTop: 4,
                              }}
                            >
                              ✅ Quiz passed
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Content viewer */}
            <div>
              {!selectedTopic ? (
                <Card style={{ padding: 40, textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                  <h3 style={{ margin: "0 0 8px", color: TLP.navy }}>
                    {activeLevelInfo
                      ? `${activeLevelInfo.planetName} · ${activeLevelInfo.level.name}`
                      : "Select a topic"}
                  </h3>
                  <p style={{ margin: 0, color: TLP.gray500, fontSize: 14 }}>
                    {modules.length > 0
                      ? "Select a module on the left to get started."
                      : "Content coming soon."}
                  </p>
                </Card>
              ) : (
                <TopicViewer topic={selectedTopic} />
              )}
            </div>
          </div>
        </>
      )}

      {/* Quiz Modal */}
      {quizState && (
        <QuizModal
          quizState={quizState}
          setQuizState={setQuizState}
          onClose={() => setQuizState(null)}
        />
      )}
    </div>
  );
}

// ── Topic Content Viewer ───────────────────────────────────────────

function TopicViewer({ topic }: { topic: LmsTopic }) {
  return (
    <Card style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>
          {topic.contentType === "youtube" ? "▶" : topic.contentType === "pdf" ? "📄" : "📝"}
        </span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TLP.navy }}>
          {topic.title}
        </h2>
        <Badge
          label={topic.contentType === "youtube" ? "Video" : topic.contentType === "pdf" ? "PDF" : "Reading"}
          color={TLP.gray600}
          bg={TLP.gray100}
        />
      </div>

      {topic.contentType === "text" && topic.contentBody && (
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: TLP.gray700,
            background: TLP.bg,
            borderRadius: 10,
            padding: "20px 24px",
          }}
        >
          {topic.contentBody}
        </div>
      )}

      {topic.contentType === "youtube" && topic.contentUrl && (
        <div>
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              borderRadius: 10,
              overflow: "hidden",
              background: TLP.gray100,
            }}
          >
            <iframe
              src={topic.contentUrl.replace("watch?v=", "embed/")}
              title={topic.title}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: TLP.gray400 }}>
            Video opens in an embedded player. Click "full screen" for a better view.
          </p>
        </div>
      )}

      {topic.contentType === "pdf" && topic.contentUrl && (
        <div
          style={{
            padding: 24,
            background: TLP.bg,
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <p style={{ margin: "0 0 16px", color: TLP.gray600, fontSize: 14 }}>
            PDF attachment
          </p>
          <Button
            variant="primary"
            onClick={() => window.open(topic.contentUrl, "_blank")}
          >
            Open PDF ↗
          </Button>
        </div>
      )}
    </Card>
  );
}

// ── Quiz Modal ─────────────────────────────────────────────────────

type QuizModalState = {
  quiz: LmsQuiz;
  answers: Record<string, string>;
  submitted: boolean;
  score: number;
};

function QuizModal({
  quizState,
  setQuizState,
  onClose,
}: {
  quizState: QuizModalState;
  setQuizState: React.Dispatch<React.SetStateAction<QuizModalState | null>>;
  onClose: () => void;
}) {
  const questions = LMS_QUIZ_QUESTIONS.filter((q) => q.quizId === quizState.quiz.id).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  const allAnswered = questions.every((q) => quizState.answers[q.id]);

  function submitQuiz() {
    const correct = questions.filter(
      (q) => quizState.answers[q.id] === q.correctAnswer,
    ).length;
    const score =
      questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setQuizState((s) => s && { ...s, submitted: true, score });
  }

  const passed =
    quizState.submitted && quizState.score >= quizState.quiz.passingScorePct;

  return (
    <Modal
      open
      onClose={onClose}
      title={quizState.quiz.title}
      width={580}
      footer={
        quizState.submitted ? (
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitQuiz} disabled={!allAnswered}>
              Submit Quiz
            </Button>
          </>
        )
      }
    >
      {quizState.submitted ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{passed ? "🎉" : "😕"}</div>
          <h3 style={{ margin: "0 0 8px", color: passed ? TLP.green : TLP.red, fontSize: 20 }}>
            {passed ? "Passed!" : "Not quite"}
          </h3>
          <p style={{ margin: "0 0 16px", fontSize: 14, color: TLP.gray600 }}>
            You scored <strong>{quizState.score}%</strong> · Passing score:{" "}
            {quizState.quiz.passingScorePct}%
          </p>
          <ProgressBar
            value={quizState.score}
            max={100}
            color={passed ? TLP.green : TLP.red}
            height={8}
          />
          {!passed && (
            <p style={{ marginTop: 12, fontSize: 13, color: TLP.gray500 }}>
              Review the topics and try again when you're ready.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {questions.map((q, qi) => (
            <div key={q.id}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: TLP.navy,
                  marginBottom: 10,
                }}
              >
                {qi + 1}. {q.questionText}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {q.options.map((option) => {
                  const isSelected = quizState.answers[q.id] === option;
                  return (
                    <label
                      key={option}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 14px",
                        borderRadius: 8,
                        border: `1.5px solid ${isSelected ? TLP.teal : TLP.gray200}`,
                        background: isSelected ? TLP.tealLight : TLP.white,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? TLP.teal : TLP.gray700,
                        transition: "all 0.1s",
                      }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={isSelected}
                        onChange={() =>
                          setQuizState((s) =>
                            s && { ...s, answers: { ...s.answers, [q.id]: option } },
                          )
                        }
                        style={{ accentColor: TLP.teal }}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
