"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, FileText, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { CourseStructure } from "@/lib/ai/prompts";
import { showToast } from "@/components/ui/toast";

interface StripeProduct {
  id: string;
  name: string;
  default_price: string;
  unit_amount?: number;
  currency?: string;
}

interface CourseWizardProps {
  onComplete: (courseData: any) => void;
}

type WizardStep = "mode" | "input" | "generating" | "review" | "stripe" | "final";

export function CourseWizard({ onComplete }: CourseWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("mode");
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [loading, setLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  
  // AI Mode state
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [courseLevel, setCourseLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [generatedStructure, setGeneratedStructure] = useState<CourseStructure | null>(null);
  
  // Manual Mode state
  const [manualFormData, setManualFormData] = useState({
    title: "",
    slug: "",
    description: "",
    short_description: "",
    price: "0",
    image_url: "",
  });
  
  // Stripe state
  const [productMode, setProductMode] = useState<"create" | "select">("create");
  const [stripeProducts, setStripeProducts] = useState<StripeProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  
  // Final course data
  const [courseData, setCourseData] = useState<any>(null);

  useEffect(() => {
    if (productMode === "select" && stripeProducts.length === 0) {
      setStripeLoading(true);
      fetch("/api/admin/stripe/products")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.products) {
            setStripeProducts(data.products);
          }
        })
        .catch((err) => console.error("Error fetching products:", err))
        .finally(() => setStripeLoading(false));
    }
  }, [productMode, stripeProducts.length]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleModeSelect = (selectedMode: "ai" | "manual") => {
    setMode(selectedMode);
    setStep("input");
  };

  const handleAIGenerate = async () => {
    if (!topic.trim()) {
      showToast("Please enter a course topic", "warning");
      return;
    }

    setStep("generating");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/courses/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "structure",
          topic,
          targetAudience: targetAudience || undefined,
          courseLevel: courseLevel || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedStructure(data.data);
        setCourseData({
          title: data.data.title,
          slug: generateSlug(data.data.title),
          description: data.data.description,
          short_description: data.data.short_description,
          price: "0",
          image_url: "",
          modules: data.data.modules,
        });
        setStep("review");
      } else {
        showToast(data.error || "Failed to generate course structure", "error");
        setStep("input");
      }
    } catch (error) {
      console.error("Error generating course:", error);
      showToast("Failed to generate course structure", "error");
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  const handleManualNext = () => {
    if (!manualFormData.title.trim()) {
      showToast("Please enter a course title", "warning");
      return;
    }

    setCourseData({
      ...manualFormData,
      price: parseFloat(manualFormData.price),
      slug: manualFormData.slug || generateSlug(manualFormData.title),
      modules: [],
    });
    setStep("stripe");
  };

  const handleReviewNext = () => {
    setStep("stripe");
  };

  const handleStripeNext = () => {
    if (productMode === "select" && !selectedProductId) {
      showToast("Please select a Stripe product", "warning");
      return;
    }

    const finalData = { ...courseData };
    
    if (productMode === "select" && selectedProductId) {
      const product = stripeProducts.find((p) => p.id === selectedProductId);
      if (product) {
        finalData.stripe_product_id = product.id;
        finalData.stripe_price_id = product.default_price;
      }
    }

    setCourseData(finalData);
    setStep("final");
  };

  const handleCreateCourse = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (data.success) {
        // Create modules if we have generated structure
        if (generatedStructure && generatedStructure.modules.length > 0) {
          for (const module of generatedStructure.modules) {
            const moduleResponse = await fetch(`/api/admin/courses/${data.course.id}/modules`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: module.title,
                description: module.description,
              }),
            });

            const moduleData = await moduleResponse.json();

            if (moduleData.success && module.lessons.length > 0) {
              // Create lessons for this module
              for (const lesson of module.lessons) {
                await fetch(`/api/admin/modules/${moduleData.module.id}/lessons`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: lesson.title,
                    description: lesson.description,
                    content_type: lesson.content_type,
                  }),
                });
              }
            }
          }
        }

        onComplete(data.course);
        router.push(`/admin/courses/${data.course.id}/builder`);
      } else {
        showToast(data.error || "Failed to create course", "error");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      showToast("Failed to create course", "error");
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "mode":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Choose Creation Method</h2>
              <p className="text-muted-foreground">
                Start with AI-powered generation or create manually
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleModeSelect("ai")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>Quick Start with AI</CardTitle>
                  </div>
                  <CardDescription>
                    Enter a topic and let AI generate a complete course structure with modules and lessons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Choose AI Quick Start
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleModeSelect("manual")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Manual Creation</CardTitle>
                  </div>
                  <CardDescription>
                    Build your course step by step with full control over every detail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Choose Manual
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "input":
        if (mode === "ai") {
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Tell us about your course</h2>
                <p className="text-muted-foreground">
                  Describe what you want to teach, and AI will create a complete course structure
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Course Topic *</Label>
                  <textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    placeholder="e.g., Google Business Profile optimization for local businesses"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Small business owners, Marketing professionals"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseLevel">Course Level</Label>
                  <Select value={courseLevel} onValueChange={(val: any) => setCourseLevel(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleAIGenerate} disabled={loading || !topic.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Course Structure
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setStep("mode")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Course Details</h2>
                <p className="text-muted-foreground">
                  Enter the basic information for your course
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-title">Course Title *</Label>
                  <Input
                    id="manual-title"
                    value={manualFormData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setManualFormData({
                        ...manualFormData,
                        title,
                        slug: generateSlug(title),
                      });
                    }}
                    required
                    placeholder="e.g., Google Business Profile Mastery"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-slug">URL Slug *</Label>
                  <Input
                    id="manual-slug"
                    value={manualFormData.slug}
                    onChange={(e) =>
                      setManualFormData({ ...manualFormData, slug: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    URL: /courses/{manualFormData.slug || "your-slug"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-short-desc">Short Description</Label>
                  <Input
                    id="manual-short-desc"
                    value={manualFormData.short_description}
                    onChange={(e) =>
                      setManualFormData({ ...manualFormData, short_description: e.target.value })
                    }
                    placeholder="Brief one-liner for marketing"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-desc">Full Description</Label>
                  <textarea
                    id="manual-desc"
                    value={manualFormData.description}
                    onChange={(e) =>
                      setManualFormData({ ...manualFormData, description: e.target.value })
                    }
                    className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    placeholder="Detailed course description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-price">Price (USD) *</Label>
                    <Input
                      id="manual-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={manualFormData.price}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, price: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manual-image">Image URL</Label>
                    <Input
                      id="manual-image"
                      type="url"
                      value={manualFormData.image_url}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, image_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleManualNext} disabled={!manualFormData.title.trim()}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setStep("mode")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          );
        }

      case "generating":
        return (
          <div className="space-y-6 text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Generating Course Structure</h2>
              <p className="text-muted-foreground">
                Our AI is creating modules, lessons, and content for your course...
              </p>
            </div>
          </div>
        );

      case "review":
        if (!generatedStructure) return null;

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review Generated Course</h2>
              <p className="text-muted-foreground">
                Review the AI-generated structure. You can edit it after creation.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{generatedStructure.title}</CardTitle>
                <CardDescription>{generatedStructure.short_description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {generatedStructure.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Course Structure</h3>
                  <div className="space-y-3">
                    {generatedStructure.modules.map((module, moduleIdx) => (
                      <div key={moduleIdx} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-1">
                          Module {moduleIdx + 1}: {module.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                          {module.lessons.map((lesson, lessonIdx) => (
                            <li key={lessonIdx}>
                              {lesson.title} ({lesson.content_type})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleReviewNext}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setStep("input")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        );

      case "stripe":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Stripe Product Integration</h2>
              <p className="text-muted-foreground">
                Connect your course to a Stripe product for payment processing
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <RadioGroup
                  value={productMode}
                  onValueChange={(val) => setProductMode(val as "create" | "select")}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="create" id="create" />
                    <Label htmlFor="create" className="cursor-pointer">
                      Create new Stripe product automatically
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="select" id="select" />
                    <Label htmlFor="select" className="cursor-pointer">
                      Link to existing Stripe product
                    </Label>
                  </div>
                </RadioGroup>

                {productMode === "select" && (
                  <div className="mt-4">
                    <Label>Select Product</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger className="w-full mt-1.5">
                        <SelectValue
                          placeholder={
                            stripeLoading ? "Loading products..." : "Choose a product"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {stripeProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={handleStripeNext}
                disabled={productMode === "select" && !selectedProductId}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setStep(mode === "ai" ? "review" : "input")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        );

      case "final":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Ready to Create</h2>
              <p className="text-muted-foreground">
                Review your course details and create it
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{courseData?.title}</CardTitle>
                {courseData?.short_description && (
                  <CardDescription>{courseData.short_description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug:</span>
                  <span>{courseData?.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span>${courseData?.price || "0"}</span>
                </div>
                {generatedStructure && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modules:</span>
                    <span>{generatedStructure.modules.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleCreateCourse} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Course...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Create Course
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setStep("stripe")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {["mode", "input", "review", "stripe", "final"].map((s, idx) => (
          <div key={s} className="flex items-center">
            <div
              className={`h-2 w-2 rounded-full ${
                step === s
                  ? "bg-primary"
                  : ["mode", "input", "review", "stripe", "final"].indexOf(step) > idx
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
            {idx < 4 && (
              <div
                className={`h-0.5 w-8 ${
                  ["mode", "input", "review", "stripe", "final"].indexOf(step) > idx
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {renderStep()}
    </div>
  );
}


