"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Save,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { showToast } from "@/components/ui/toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type QuestionType =
  | "multiple_choice"
  | "multiple_select"
  | "true_false"
  | "short_answer"
  | "essay"
  | "matching"
  | "fill_blank"
  | "drag_drop";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
  options?: string[];
  correctAnswers?: (string | number)[];
  matchingPairs?: { left: string; right: string }[];
  blanks?: { text: string; answer: string }[];
  dragItems?: { id: string; label: string; category: string }[];
  explanation?: string;
}

export interface QuizSettings {
  passingScore: number;
  retakeLimit: number | null;
  randomizeQuestions: boolean;
  timeLimit: number | null; // in minutes
  showCorrectAnswers: boolean;
}

interface QuizBuilderProps {
  lessonId: string;
  initialQuestions?: QuizQuestion[];
  initialSettings?: QuizSettings;
  onSave: (questions: QuizQuestion[], settings: QuizSettings) => Promise<void>;
}

const DEFAULT_SETTINGS: QuizSettings = {
  passingScore: 70,
  retakeLimit: null,
  randomizeQuestions: false,
  timeLimit: null,
  showCorrectAnswers: true,
};

function SortableQuestionItem({
  question,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  question: QuizQuestion;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeLabel = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      multiple_choice: "Multiple Choice",
      multiple_select: "Multiple Select",
      true_false: "True/False",
      short_answer: "Short Answer",
      essay: "Essay",
      matching: "Matching",
      fill_blank: "Fill in the Blank",
      drag_drop: "Drag & Drop",
    };
    return labels[type];
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "shadow-lg ring-2 ring-primary" : ""} transition-all`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {getTypeLabel(question.type)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {question.points} {question.points === 1 ? "point" : "points"}
                  </span>
                </div>
                <p className="font-medium">{question.question || "Untitled Question"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-8 w-8 p-0"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={isLast}
              className="h-8 w-8 p-0"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-8">
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuizBuilder({
  lessonId,
  initialQuestions = [],
  initialSettings = DEFAULT_SETTINGS,
  onSave,
}: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [settings, setSettings] = useState<QuizSettings>(initialSettings);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"questions" | "settings">("questions");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type,
      question: "",
      points: 1,
      options: type === "multiple_choice" || type === "multiple_select" ? [""] : undefined,
      correctAnswers: [],
      matchingPairs: type === "matching" ? [{ left: "", right: "" }] : undefined,
      blanks: type === "fill_blank" ? [{ text: "", answer: "" }] : undefined,
      dragItems: type === "drag_drop" ? [] : undefined,
    };
    setEditingQuestion(newQuestion);
  };

  const handleSaveQuestion = (question: QuizQuestion) => {
    if (editingQuestion?.id && questions.find((q) => q.id === editingQuestion.id)) {
      // Update existing
      setQuestions(questions.map((q) => (q.id === question.id ? question : q)));
    } else {
      // Add new
      setQuestions([...questions, question]);
    }
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    setQuestions(arrayMove(questions, index, newIndex));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over?.id);
      setQuestions(arrayMove(questions, oldIndex, newIndex));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(questions, settings);
      showToast("Quiz saved successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to save quiz", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "questions" | "settings")}>
        <TabsList>
          <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quiz Questions</h3>
            <div className="flex gap-2">
              <Select onValueChange={(value) => handleAddQuestion(value as QuestionType)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add Question Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="multiple_select">Multiple Select</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                  <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                  <SelectItem value="drag_drop">Drag & Drop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {questions.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No questions yet. Add your first question to get started.
                    </CardContent>
                  </Card>
                ) : (
                  questions.map((question, index) => (
                    <SortableQuestionItem
                      key={question.id}
                      question={question}
                      onEdit={() => setEditingQuestion(question)}
                      onDelete={() => handleDeleteQuestion(question.id)}
                      onMoveUp={() => handleMoveQuestion(index, "up")}
                      onMoveDown={() => handleMoveQuestion(index, "down")}
                      isFirst={index === 0}
                      isLast={index === questions.length - 1}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="passing-score">Passing Score (%)</Label>
                <Input
                  id="passing-score"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.passingScore}
                  onChange={(e) =>
                    setSettings({ ...settings, passingScore: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retake-limit">Retake Limit</Label>
                <Input
                  id="retake-limit"
                  type="number"
                  min="0"
                  value={settings.retakeLimit || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      retakeLimit: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Unlimited"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for unlimited retakes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input
                  id="time-limit"
                  type="number"
                  min="0"
                  value={settings.timeLimit || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      timeLimit: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="No time limit"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for no time limit
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="randomize">Randomize Questions</Label>
                  <p className="text-xs text-muted-foreground">
                    Questions will appear in random order for each attempt
                  </p>
                </div>
                <Switch
                  id="randomize"
                  checked={settings.randomizeQuestions}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, randomizeQuestions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-answers">Show Correct Answers</Label>
                  <p className="text-xs text-muted-foreground">
                    Display correct answers after submission
                  </p>
                </div>
                <Switch
                  id="show-answers"
                  checked={settings.showCorrectAnswers}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showCorrectAnswers: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingQuestion && (
        <QuestionEditor
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button onClick={handleSave} disabled={saving || questions.length === 0}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function QuestionEditor({
  question,
  onSave,
  onCancel,
}: {
  question: QuizQuestion;
  onSave: (question: QuizQuestion) => void;
  onCancel: () => void;
}) {
  const [editedQuestion, setEditedQuestion] = useState<QuizQuestion>(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleSave = () => {
    // Validate question based on type
    if (!editedQuestion.question.trim()) {
      showToast("Question text is required", "error");
      return;
    }

    if (
      (editedQuestion.type === "multiple_choice" || editedQuestion.type === "multiple_select") &&
      (!editedQuestion.options || editedQuestion.options.length < 2)
    ) {
      showToast("At least 2 options are required", "error");
      return;
    }

    if (
      (editedQuestion.type === "multiple_choice" || editedQuestion.type === "multiple_select") &&
      (!editedQuestion.correctAnswers || editedQuestion.correctAnswers.length === 0)
    ) {
      showToast("At least one correct answer must be selected", "error");
      return;
    }

    onSave(editedQuestion);
  };

  const addOption = () => {
    setEditedQuestion({
      ...editedQuestion,
      options: [...(editedQuestion.options || []), ""],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editedQuestion.options || [])];
    newOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = editedQuestion.options?.filter((_, i) => i !== index) || [];
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const toggleCorrectAnswer = (index: number) => {
    const currentAnswers = editedQuestion.correctAnswers || [];
    const isCorrect = currentAnswers.includes(index);

    if (editedQuestion.type === "multiple_choice") {
      // Only one answer for multiple choice
      setEditedQuestion({
        ...editedQuestion,
        correctAnswers: isCorrect ? [] : [index],
      });
    } else {
      // Multiple answers for multiple select
      setEditedQuestion({
        ...editedQuestion,
        correctAnswers: isCorrect
          ? currentAnswers.filter((a) => a !== index)
          : [...currentAnswers, index],
      });
    }
  };

  const addMatchingPair = () => {
    setEditedQuestion({
      ...editedQuestion,
      matchingPairs: [...(editedQuestion.matchingPairs || []), { left: "", right: "" }],
    });
  };

  const updateMatchingPair = (index: number, side: "left" | "right", value: string) => {
    const newPairs = [...(editedQuestion.matchingPairs || [])];
    newPairs[index] = { ...newPairs[index], [side]: value };
    setEditedQuestion({ ...editedQuestion, matchingPairs: newPairs });
  };

  const removeMatchingPair = (index: number) => {
    const newPairs = editedQuestion.matchingPairs?.filter((_, i) => i !== index) || [];
    setEditedQuestion({ ...editedQuestion, matchingPairs: newPairs });
  };

  const addBlank = () => {
    setEditedQuestion({
      ...editedQuestion,
      blanks: [...(editedQuestion.blanks || []), { text: "", answer: "" }],
    });
  };

  const updateBlank = (index: number, field: "text" | "answer", value: string) => {
    const newBlanks = [...(editedQuestion.blanks || [])];
    newBlanks[index] = { ...newBlanks[index], [field]: value };
    setEditedQuestion({ ...editedQuestion, blanks: newBlanks });
  };

  const removeBlank = (index: number) => {
    const newBlanks = editedQuestion.blanks?.filter((_, i) => i !== index) || [];
    setEditedQuestion({ ...editedQuestion, blanks: newBlanks });
  };

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>Edit Question</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Question Type</Label>
          <p className="text-sm text-muted-foreground capitalize">
            {editedQuestion.type.replace("_", " ")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-text">Question Text *</Label>
          <Textarea
            id="question-text"
            value={editedQuestion.question}
            onChange={(e) =>
              setEditedQuestion({ ...editedQuestion, question: e.target.value })
            }
            placeholder="Enter your question here..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            min="0"
            value={editedQuestion.points}
            onChange={(e) =>
              setEditedQuestion({
                ...editedQuestion,
                points: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>

        {(editedQuestion.type === "multiple_choice" || editedQuestion.type === "multiple_select") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
            {editedQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant={editedQuestion.correctAnswers?.includes(index) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCorrectAnswer(index)}
                >
                  {editedQuestion.correctAnswers?.includes(index) ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </Button>
                {editedQuestion.options && editedQuestion.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Click the checkmark to mark an option as correct
            </p>
          </div>
        )}

        {editedQuestion.type === "true_false" && (
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={editedQuestion.correctAnswers?.includes(0) ? "default" : "outline"}
                onClick={() => setEditedQuestion({ ...editedQuestion, correctAnswers: [0] })}
                className="flex-1"
              >
                True
              </Button>
              <Button
                type="button"
                variant={editedQuestion.correctAnswers?.includes(1) ? "default" : "outline"}
                onClick={() => setEditedQuestion({ ...editedQuestion, correctAnswers: [1] })}
                className="flex-1"
              >
                False
              </Button>
            </div>
          </div>
        )}

        {(editedQuestion.type === "short_answer" || editedQuestion.type === "essay") && (
          <div className="space-y-2">
            <Label>Expected Answer (Optional)</Label>
            <Textarea
              value={editedQuestion.correctAnswers?.[0]?.toString() || ""}
              onChange={(e) =>
                setEditedQuestion({
                  ...editedQuestion,
                  correctAnswers: [e.target.value],
                })
              }
              placeholder="Enter expected answer or leave blank for manual grading"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              For essay questions, this is used as a reference for manual grading
            </p>
          </div>
        )}

        {editedQuestion.type === "matching" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Matching Pairs</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMatchingPair}>
                <Plus className="h-4 w-4 mr-1" />
                Add Pair
              </Button>
            </div>
            {editedQuestion.matchingPairs?.map((pair, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={pair.left}
                  onChange={(e) => updateMatchingPair(index, "left", e.target.value)}
                  placeholder="Left item"
                />
                <span className="text-muted-foreground">→</span>
                <Input
                  value={pair.right}
                  onChange={(e) => updateMatchingPair(index, "right", e.target.value)}
                  placeholder="Right item"
                />
                {editedQuestion.matchingPairs && editedQuestion.matchingPairs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMatchingPair(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {editedQuestion.type === "fill_blank" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fill in the Blank Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addBlank}>
                <Plus className="h-4 w-4 mr-1" />
                Add Blank
              </Button>
            </div>
            {editedQuestion.blanks?.map((blank, index) => (
              <div key={index} className="space-y-2">
                <Input
                  value={blank.text}
                  onChange={(e) => updateBlank(index, "text", e.target.value)}
                  placeholder="Text with [blank] placeholder"
                />
                <Input
                  value={blank.answer}
                  onChange={(e) => updateBlank(index, "answer", e.target.value)}
                  placeholder="Correct answer"
                />
                {editedQuestion.blanks && editedQuestion.blanks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlank(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Use [blank] in the text to indicate where the blank should appear
            </p>
          </div>
        )}

        {editedQuestion.type === "drag_drop" && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Drag and drop question builder coming soon. For now, use matching questions.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="explanation">Explanation (Optional)</Label>
          <Textarea
            id="explanation"
            value={editedQuestion.explanation || ""}
            onChange={(e) =>
              setEditedQuestion({ ...editedQuestion, explanation: e.target.value })
            }
            placeholder="Explain why this answer is correct..."
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Question</Button>
        </div>
      </CardContent>
    </Card>
  );
}

