"use client";

import { useState } from "react";
import {
  Mic,
  Quote,
  FileText,
  Pencil,
  Home,
  Bell,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { LipSyncForm, type LipSyncData } from "./LipSyncForm";
import { TestimonialForm, type TestimonialData } from "./TestimonialForm";
import { DocumentForm, type DocumentData } from "./DocumentForm";
import { PropertyTourForm, type PropertyTourData } from "./PropertyTourForm";
import { ListingUpdateForm, type ListingUpdateData } from "./ListingUpdateForm";
import { TrendVideoForm, type TrendVideoData } from "./TrendVideoForm";

// ─── Workflow Types ──────────────────────────────────────────────

export type WorkflowType =
  | "lip_sync"
  | "testimonial"
  | "document"
  | "manual"
  | "property_tour"
  | "listing_update"
  | "trend_video";

export interface WorkflowSubmitData {
  workflow: WorkflowType;
  workflowData: { [key: string]: unknown };
  prompt: string;
  format: string;
  model: string;
}

interface WorkflowDefinition {
  id: WorkflowType;
  label: string;
  description: string;
  icon: typeof Mic;
  category: "universal" | "real_estate";
}

const WORKFLOWS: WorkflowDefinition[] = [
  {
    id: "lip_sync",
    label: "Lip Sync",
    description: "Animate your photo with AI-generated voice from a script",
    icon: Mic,
    category: "universal",
  },
  {
    id: "testimonial",
    label: "Testimonial",
    description: "Turn a customer review into a video",
    icon: Quote,
    category: "universal",
  },
  {
    id: "document",
    label: "Document Presentation",
    description: "Turn a PDF or slide deck into a video presentation",
    icon: FileText,
    category: "universal",
  },
  {
    id: "manual",
    label: "Manual",
    description: "Start from scratch with full control",
    icon: Pencil,
    category: "universal",
  },
  {
    id: "property_tour",
    label: "Property Tour",
    description: "30-second property showcase video",
    icon: Home,
    category: "real_estate",
  },
  {
    id: "listing_update",
    label: "Listing Update",
    description: "Announce a listing event",
    icon: Bell,
    category: "real_estate",
  },
  {
    id: "trend_video",
    label: "Trend Video",
    description: "Fast-paced visual showcase with music",
    icon: TrendingUp,
    category: "real_estate",
  },
];

// ─── Component ──────────────────────────────────────────────────

interface WorkflowSelectorProps {
  industry: string;
  isGenerating: boolean;
  onSelectManual: () => void;
  onSubmitWorkflow: (data: WorkflowSubmitData) => void;
}

export function WorkflowSelector({
  industry,
  isGenerating,
  onSelectManual,
  onSubmitWorkflow,
}: WorkflowSelectorProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowType | null>(null);

  // Filter workflows based on industry
  const availableWorkflows = WORKFLOWS.filter(
    (w) => w.category === "universal" || (w.category === "real_estate" && industry === "real_estate")
  );

  const universalWorkflows = availableWorkflows.filter((w) => w.category === "universal");
  const realEstateWorkflows = availableWorkflows.filter((w) => w.category === "real_estate");

  const handleWorkflowClick = (workflow: WorkflowDefinition) => {
    if (workflow.id === "manual") {
      onSelectManual();
      return;
    }
    setActiveWorkflow(workflow.id);
  };

  const handleBack = () => {
    setActiveWorkflow(null);
  };

  // ─── Workflow Form Handlers ─────────────────────────────────

  const handleLipSyncSubmit = (data: LipSyncData) => {
    const durationFormatMap: Record<string, string> = {
      "15": "talking_head_15",
      "30": "educational_30",
      "60": "educational_30",
    };
    onSubmitWorkflow({
      workflow: "lip_sync",
      workflowData: { ...data },
      prompt: `Create a ${data.tone} lip sync video about: ${data.script}`,
      format: durationFormatMap[data.duration] || "talking_head_15",
      model: "kling_2.6",
    });
  };

  const handleTestimonialSubmit = (data: TestimonialData) => {
    const namePrefix = data.customerName ? `${data.customerName} says: ` : "";
    onSubmitWorkflow({
      workflow: "testimonial",
      workflowData: { ...data },
      prompt: `Transform this customer testimonial into a video. ${namePrefix}"${data.testimonialText}"`,
      format: "testimonial_15",
      model: "seedance_2.0",
    });
  };

  const handleDocumentSubmit = (data: DocumentData) => {
    const stylePrompts: Record<string, string> = {
      educational: "Present the key points in an educational, explanatory style",
      pitch: "Present the content as a compelling pitch, emphasizing value and benefits",
      summary: "Give a quick, high-level summary of the most important points",
    };
    onSubmitWorkflow({
      workflow: "document",
      workflowData: { ...data },
      prompt: `${stylePrompts[data.presentationStyle]}. Document content: ${data.documentText}`,
      format: "educational_30",
      model: "kling_2.6",
    });
  };

  const handlePropertyTourSubmit = (data: PropertyTourData) => {
    const details = [
      data.bedrooms && `${data.bedrooms} bedrooms`,
      data.bathrooms && `${data.bathrooms} bathrooms`,
      data.sqft && `${data.sqft} sq ft`,
      data.price && `listed at ${data.price}`,
    ].filter(Boolean).join(", ");
    const features = data.keyFeatures ? ` Key features: ${data.keyFeatures}.` : "";
    onSubmitWorkflow({
      workflow: "property_tour",
      workflowData: { ...data },
      prompt: `Create a 30-second property tour video for ${data.address}. ${details}.${features} Showcase the property with a professional, inviting tone.`,
      format: "property_tour_30",
      model: "kling_2.6",
    });
  };

  const handleListingUpdateSubmit = (data: ListingUpdateData) => {
    const typeLabels: Record<string, string> = {
      new_listing: "New Listing",
      open_house: "Open House",
      price_change: "Price Change",
      just_sold: "Just Sold",
    };
    onSubmitWorkflow({
      workflow: "listing_update",
      workflowData: { ...data },
      prompt: `Create a ${typeLabels[data.eventType]} announcement video for ${data.address}. Details: ${data.eventDetails}`,
      format: "quick_tip_8",
      model: "seedance_2.0",
    });
  };

  const handleTrendVideoSubmit = (data: TrendVideoData) => {
    onSubmitWorkflow({
      workflow: "trend_video",
      workflowData: { ...data },
      prompt: `Create a fast-paced ${data.visualStyle} trend video about: ${data.topic}. Music vibe: ${data.musicStyle}. Quick cuts, visually engaging, designed for social media reels.`,
      format: "educational_30",
      model: "seedance_2.0",
    });
  };

  // ─── Active Workflow Form ─────────────────────────────────────

  if (activeWorkflow) {
    const workflowDef = WORKFLOWS.find((w) => w.id === activeWorkflow);
    if (!workflowDef) return null;

    return (
      <div className="animate-fade-in">
        {/* Back button + title */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[13px] text-white/70 hover:text-white/70 transition-colors mb-4 group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to workflows
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.06]">
            <workflowDef.icon className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-white/90">{workflowDef.label}</h2>
            <p className="text-[12px] text-white/70">{workflowDef.description}</p>
          </div>
        </div>

        {/* Render the correct form */}
        {activeWorkflow === "lip_sync" && (
          <LipSyncForm onSubmit={handleLipSyncSubmit} isGenerating={isGenerating} />
        )}
        {activeWorkflow === "testimonial" && (
          <TestimonialForm onSubmit={handleTestimonialSubmit} isGenerating={isGenerating} />
        )}
        {activeWorkflow === "document" && (
          <DocumentForm onSubmit={handleDocumentSubmit} isGenerating={isGenerating} />
        )}
        {activeWorkflow === "property_tour" && (
          <PropertyTourForm onSubmit={handlePropertyTourSubmit} isGenerating={isGenerating} />
        )}
        {activeWorkflow === "listing_update" && (
          <ListingUpdateForm onSubmit={handleListingUpdateSubmit} isGenerating={isGenerating} />
        )}
        {activeWorkflow === "trend_video" && (
          <TrendVideoForm onSubmit={handleTrendVideoSubmit} isGenerating={isGenerating} />
        )}
      </div>
    );
  }

  // ─── Workflow Card Grid ───────────────────────────────────────

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Section: Universal Workflows */}
      <div>
        <p className="text-[11px] font-medium text-white/70 uppercase tracking-wider mb-3">
          Workflows
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {universalWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onClick={() => handleWorkflowClick(workflow)}
            />
          ))}
        </div>
      </div>

      {/* Section: Real Estate Workflows */}
      {realEstateWorkflows.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-white/70 uppercase tracking-wider mb-3">
            Real Estate
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {realEstateWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onClick={() => handleWorkflowClick(workflow)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Workflow Card ─────────────────────────────────────────────────

function WorkflowCard({
  workflow,
  onClick,
}: {
  workflow: WorkflowDefinition;
  onClick: () => void;
}) {
  const Icon = workflow.icon;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.02] transition-all text-left group active:scale-[0.98]"
    >
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.06] transition-colors border border-white/[0.04] group-hover:border-white/[0.08]">
        <Icon className="w-5 h-5 text-white/60 group-hover:text-white/70 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-white/70 group-hover:text-white/90 transition-colors">
          {workflow.label}
        </div>
        <p className="text-[12px] text-white/60 mt-0.5 line-clamp-1 group-hover:text-white/70 transition-colors">
          {workflow.description}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </button>
  );
}
