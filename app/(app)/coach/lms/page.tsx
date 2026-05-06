"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { PLANETS } from "@/lib/mock/planets";
import { LEVELS_BY_PLANET, LEVEL_BY_ID } from "@/lib/mock/levels";
import {
  LMS_MODULES,
  LMS_TOPICS,
  LMS_QUIZZES,
  LMS_QUIZ_QUESTIONS,
  MODULES_BY_LEVEL,
  TOPICS_BY_MODULE,
} from "@/lib/mock/lmsContent";
import type { LmsModule, LmsTopic, LmsContentType } from "@/lib/types";

const COACH_PLANET_IDS = ["pl_chess", "pl_math"];

type TopicStatus = "published" | "draft";

interface ExtraModule extends LmsModule {
  status: TopicStatus;
}

interface ExtraTopic extends LmsTopic {
  status: TopicStatus;
}

const CONTENT_TYPE_OPTIONS = [
  { value: "text", label: "Text / Rich Content" },
  { value: "youtube", label: "YouTube Video" },
  { value: "pdf", label: "PDF Upload" },
];

export default function LmsPage() {
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const [extraModules, setExtraModules] = useState<ExtraModule[]>([]);
  const [extraTopics, setExtraTopics] = useState<ExtraTopic[]>([]);

  const [showAddModule, setShowAddModule] = useState<string | null>(null);
  const [showAddTopic, setShowAddTopic] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicType, setNewTopicType] = useState<LmsContentType>("text");

  const [editorBody, setEditorBody] = useState("");
  const [editorUrl, setEditorUrl] = useState("");
  const [publishedTopics, setPublishedTopics] = useState<Set<string>>(new Set());
  const [justSaved, setJustSaved] = useState(false);

  const coachPlanets = PLANETS.filter((p) => COACH_PLANET_IDS.includes(p.id));

  function getModules(levelId: string): ExtraModule[] {
    const base = (MODULES_BY_LEVEL[levelId] ?? []).map((m) => ({
      ...m,
      status: "published" as TopicStatus,
    }));
    const extra = extraModules.filter((m) => m.levelId === levelId);
    return [...base, ...extra];
  }

  function getTopics(moduleId: string): ExtraTopic[] {
    const base = (TOPICS_BY_MODULE[moduleId] ?? []).map((t) => ({
      ...t,
      status: "published" as TopicStatus,
    }));
    const extra = extraTopics.filter((t) => t.moduleId === moduleId);
    return [...base, ...extra];
  }

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function selectTopic(topic: ExtraTopic) {
    setSelectedTopicId(topic.id);
    setEditorBody(topic.contentBody ?? "");
    setEditorUrl(topic.contentUrl ?? "");
    setJustSaved(false);
  }

  function handleAddModule() {
    if (!newModuleTitle.trim() || !showAddModule) return;
    const newMod: ExtraModule = {
      id: `mod_new_${Date.now()}`,
      levelId: showAddModule,
      title: newModuleTitle.trim(),
      sortOrder: 99,
      status: "draft",
    };
    setExtraModules((prev) => [...prev, newMod]);
    setNewModuleTitle("");
    setShowAddModule(null);
  }

  function handleAddTopic() {
    if (!newTopicTitle.trim() || !showAddTopic) return;
    const newTopic: ExtraTopic = {
      id: `top_new_${Date.now()}`,
      moduleId: showAddTopic,
      title: newTopicTitle.trim(),
      contentType: newTopicType,
      sortOrder: 99,
      status: "draft",
    };
    setExtraTopics((prev) => [...prev, newTopic]);
    setNewTopicTitle("");
    setNewTopicType("text");
    setShowAddTopic(null);
  }

  function handlePublish() {
    if (!selectedTopicId) return;
    setPublishedTopics((prev) => new Set([...prev, selectedTopicId]));
    setJustSaved(true);
  }

  const selectedTopic = selectedTopicId
    ? ([...LMS_TOPICS, ...extraTopics].find((t) => t.id === selectedTopicId) as ExtraTopic | undefined) ?? null
    : null;

  const topicStatus: TopicStatus =
    selectedTopicId && publishedTopics.has(selectedTopicId)
      ? "published"
      : selectedTopic?.status === "published"
        ? "published"
        : "draft";

  const selectedModuleQuiz = selectedModuleId
    ? LMS_QUIZZES.find((q) => q.referenceId === selectedModuleId)
    : null;

  const quizQuestions = selectedModuleQuiz
    ? LMS_QUIZ_QUESTIONS.filter((q) => q.quizId === selectedModuleQuiz.id)
    : [];

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="LMS Authoring"
        subtitle="Manage course content for your planets"
      />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, minHeight: 600 }}>
        {/* Left sidebar: content tree */}
        <div
          style={{
            background: TLP.white,
            borderRadius: 12,
            border: `1px solid ${TLP.gray100}`,
            boxShadow: "0 1px 4px rgba(13,27,62,0.08)",
            overflow: "auto",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${TLP.gray100}`,
              fontSize: 12,
              fontWeight: 700,
              color: TLP.gray500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Content Tree
          </div>

          {coachPlanets.map((planet) => {
            const ps = planetStyle(planet.name);
            const levels = LEVELS_BY_PLANET[planet.id] ?? [];

            return (
              <div key={planet.id}>
                {/* Planet header */}
                <div
                  style={{
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: ps.bg,
                    borderBottom: `1px solid ${TLP.gray100}`,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{ps.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ps.color }}>
                    {planet.name}
                  </span>
                </div>

                {levels.map((level) => {
                  const modules = getModules(level.id);
                  const isLevelSelected = selectedLevelId === level.id;

                  return (
                    <div key={level.id}>
                      {/* Level row */}
                      <div
                        style={{
                          padding: "8px 16px 8px 28px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          background: isLevelSelected ? TLP.tealLight : "transparent",
                          borderBottom: `1px solid ${TLP.gray100}`,
                        }}
                        onClick={() => {
                          setSelectedLevelId(level.id);
                          setSelectedModuleId(null);
                          setSelectedTopicId(null);
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: isLevelSelected ? TLP.teal : TLP.gray700,
                          }}
                        >
                          {level.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAddModule(level.id);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 14,
                            color: TLP.gray400,
                            padding: "0 2px",
                            lineHeight: 1,
                          }}
                          title="Add Module"
                        >
                          +
                        </button>
                      </div>

                      {/* Modules */}
                      {modules.map((mod) => {
                        const isExpanded = expandedModules.has(mod.id);
                        const topics = getTopics(mod.id);
                        const isModSelected = selectedModuleId === mod.id;

                        return (
                          <div key={mod.id}>
                            <div
                              style={{
                                padding: "7px 16px 7px 38px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                cursor: "pointer",
                                background: isModSelected ? "#f0faf9" : "transparent",
                                borderBottom: `1px solid ${TLP.gray100}`,
                              }}
                              onClick={() => {
                                toggleModule(mod.id);
                                setSelectedModuleId(mod.id);
                                setSelectedTopicId(null);
                              }}
                            >
                              <span style={{ fontSize: 10, color: TLP.gray400 }}>
                                {isExpanded ? "▼" : "▶"}
                              </span>
                              <span
                                style={{
                                  fontSize: 12,
                                  color: isModSelected ? TLP.teal : TLP.gray700,
                                  flex: 1,
                                  fontWeight: isModSelected ? 700 : 500,
                                }}
                              >
                                {mod.title}
                              </span>
                              {mod.status === "draft" && (
                                <Badge label="Draft" color={TLP.amber} bg={TLP.amberLight} />
                              )}
                            </div>

                            {/* Topics */}
                            {isExpanded &&
                              topics.map((topic) => {
                                const isTopicSelected = selectedTopicId === topic.id;
                                return (
                                  <div
                                    key={topic.id}
                                    style={{
                                      padding: "6px 16px 6px 54px",
                                      cursor: "pointer",
                                      background: isTopicSelected ? TLP.tealLight : "transparent",
                                      borderBottom: `1px solid ${TLP.gray100}`,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                    onClick={() => {
                                      setSelectedModuleId(mod.id);
                                      selectTopic(topic);
                                    }}
                                  >
                                    <span style={{ fontSize: 11, color: TLP.gray400 }}>
                                      {topic.contentType === "youtube"
                                        ? "▶"
                                        : topic.contentType === "pdf"
                                          ? "📄"
                                          : "📝"}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: isTopicSelected ? TLP.teal : TLP.gray700,
                                        flex: 1,
                                        fontWeight: isTopicSelected ? 700 : 400,
                                      }}
                                    >
                                      {topic.title}
                                    </span>
                                    {topic.status === "draft" && !publishedTopics.has(topic.id) && (
                                      <Badge label="Draft" color={TLP.amber} bg={TLP.amberLight} />
                                    )}
                                  </div>
                                );
                              })}

                            {/* Add topic button */}
                            {isExpanded && (
                              <div
                                style={{
                                  padding: "5px 16px 5px 54px",
                                  borderBottom: `1px solid ${TLP.gray100}`,
                                }}
                              >
                                <button
                                  onClick={() => setShowAddTopic(mod.id)}
                                  style={{
                                    fontSize: 11,
                                    color: TLP.teal,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    fontFamily: "inherit",
                                    fontWeight: 600,
                                  }}
                                >
                                  + Add Topic
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Right panel: content editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!selectedTopicId && !selectedModuleId ? (
            <Card style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: TLP.navy, marginBottom: 8 }}>
                Select a topic to edit
              </div>
              <div style={{ fontSize: 13, color: TLP.gray500 }}>
                Choose a planet, level, module, and topic from the tree on the left.
              </div>
            </Card>
          ) : null}

          {/* Topic editor */}
          {selectedTopic && (
            <Card style={{ padding: "20px 24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 18,
                  gap: 12,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TLP.navy }}>
                    {selectedTopic.title}
                  </h2>
                  <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 4 }}>
                    Content type: {selectedTopic.contentType}
                  </div>
                </div>
                <Badge
                  label={topicStatus === "published" ? "Published" : "Draft"}
                  color={topicStatus === "published" ? TLP.green : TLP.amber}
                  bg={topicStatus === "published" ? TLP.greenLight : TLP.amberLight}
                  size="md"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <Select
                  label="Content Type"
                  value={selectedTopic.contentType}
                  onChange={() => {}}
                  options={CONTENT_TYPE_OPTIONS}
                />
              </div>

              {selectedTopic.contentType === "text" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: TLP.navy,
                      marginBottom: 6,
                    }}
                  >
                    Content Body
                  </label>
                  <textarea
                    value={editorBody || selectedTopic.contentBody || ""}
                    onChange={(e) => setEditorBody(e.target.value)}
                    rows={8}
                    placeholder="Enter content text here..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: `1.5px solid ${TLP.gray200}`,
                      fontSize: 13,
                      color: TLP.gray700,
                      fontFamily: "inherit",
                      resize: "vertical",
                      boxSizing: "border-box",
                      outline: "none",
                      lineHeight: 1.6,
                    }}
                  />
                </div>
              )}

              {selectedTopic.contentType === "youtube" && (
                <div>
                  <Input
                    label="YouTube URL"
                    type="url"
                    value={editorUrl || selectedTopic.contentUrl || ""}
                    onChange={(e) => setEditorUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {(editorUrl || selectedTopic.contentUrl) && (
                    <div style={{ marginTop: 10 }}>
                      <a
                        href={editorUrl || selectedTopic.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 13,
                          color: TLP.teal,
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        Open video in new tab →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {selectedTopic.contentType === "pdf" && (
                <div
                  style={{
                    border: `2px dashed ${TLP.gray200}`,
                    borderRadius: 10,
                    padding: "32px 24px",
                    textAlign: "center",
                    color: TLP.gray500,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Upload PDF</div>
                  <div style={{ fontSize: 12 }}>PDF upload is not wired in this prototype.</div>
                  <Button variant="secondary" size="sm" style={{ marginTop: 12 }}>
                    Choose File
                  </Button>
                </div>
              )}

              <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
                <Button variant="primary" onClick={handlePublish}>
                  {justSaved ? "Saved ✓" : "Publish Changes"}
                </Button>
                <Button variant="secondary">Preview</Button>
                {justSaved && (
                  <span style={{ fontSize: 12, color: TLP.green, fontWeight: 600 }}>
                    Changes published (prototype — not persisted)
                  </span>
                )}
              </div>
            </Card>
          )}

          {/* Module quiz section */}
          {selectedModuleId && (
            <Card style={{ padding: "20px 24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TLP.navy }}>
                  Module Quiz
                </h3>
                {!selectedModuleQuiz && (
                  <Button variant="secondary" size="sm">
                    + Add Quiz
                  </Button>
                )}
              </div>

              {selectedModuleQuiz ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy, marginBottom: 4 }}>
                    {selectedModuleQuiz.title}
                    <span style={{ color: TLP.gray500, fontWeight: 400, marginLeft: 8 }}>
                      Passing: {selectedModuleQuiz.passingScorePct}%
                    </span>
                  </div>
                  {quizQuestions.map((q, i) => (
                    <div
                      key={q.id}
                      style={{
                        padding: "10px 14px",
                        background: TLP.gray50,
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 600, color: TLP.navy, marginBottom: 6 }}>
                        {i + 1}. {q.questionText}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {q.options.map((opt) => (
                          <span
                            key={opt}
                            style={{
                              padding: "2px 10px",
                              borderRadius: 20,
                              fontSize: 12,
                              background: opt === q.correctAnswer ? TLP.greenLight : TLP.gray100,
                              color: opt === q.correctAnswer ? TLP.green : TLP.gray600,
                              fontWeight: opt === q.correctAnswer ? 700 : 400,
                            }}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" style={{ alignSelf: "flex-start" }}>
                    + Add Question
                  </Button>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: TLP.gray400 }}>
                  No quiz for this module yet. Add one using the button above.
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Add Module Modal */}
      <Modal
        open={!!showAddModule}
        onClose={() => {
          setShowAddModule(null);
          setNewModuleTitle("");
        }}
        title="Add Module"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModule(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddModule}
              disabled={!newModuleTitle.trim()}
            >
              Add Module
            </Button>
          </>
        }
      >
        <Input
          label="Module Title"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="e.g. Advanced Tactics"
          autoFocus
        />
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: TLP.gray500,
          }}
        >
          New modules will be created as <strong>Draft</strong> and visible only to coaches.
        </div>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        open={!!showAddTopic}
        onClose={() => {
          setShowAddTopic(null);
          setNewTopicTitle("");
          setNewTopicType("text");
        }}
        title="Add Topic"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddTopic(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddTopic}
              disabled={!newTopicTitle.trim()}
            >
              Add Topic
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Topic Title"
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            placeholder="e.g. Knight Fork Patterns"
            autoFocus
          />
          <Select
            label="Content Type"
            value={newTopicType}
            onChange={(e) => setNewTopicType(e.target.value as LmsContentType)}
            options={CONTENT_TYPE_OPTIONS}
          />
        </div>
      </Modal>
    </div>
  );
}
