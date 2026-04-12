import type { ComponentType } from "react";
import type { TemplateEntry, TemplateRenderProps } from "../types";
import { BreakingLiveStrip } from "./components/BreakingLiveStrip";
import { CalendarEventCard } from "./components/CalendarEventCard";
import { CommentPrompt } from "./components/CommentPrompt";
import { DefinitionCard } from "./components/DefinitionCard";
import { DualGuestLowerThird } from "./components/DualGuestLowerThird";
import { EndCardSimple } from "./components/EndCardSimple";
import { FullHeadline } from "./components/FullHeadline";
import { GoalBarGeneric } from "./components/GoalBarGeneric";
import { GuestTitleRole } from "./components/GuestTitleRole";
import { HeroTitleStack } from "./components/HeroTitleStack";
import { KeyboardTipOverlay } from "./components/KeyboardTipOverlay";
import { LocationDateStamp } from "./components/LocationDateStamp";
import { MinimalLowerThird } from "./components/MinimalLowerThird";
import { NumberedList } from "./components/NumberedList";
import { PollVs } from "./components/PollVs";
import { ProductPriceCallout } from "./components/ProductPriceCallout";
import { QuoteCard } from "./components/QuoteCard";
import { SectionBumper } from "./components/SectionBumper";
import { SocialHandleStrip } from "./components/SocialHandleStrip";
import { SponsorDisclosure } from "./components/SponsorDisclosure";
import { StepProgress } from "./components/StepProgress";
import { SubscribeCtaCard } from "./components/SubscribeCtaCard";
import { TimerCountdown } from "./components/TimerCountdown";
import { TEMPLATE_DEFINITIONS } from "./definitions";

const COMPONENTS: Record<string, ComponentType<TemplateRenderProps>> = {
  "minimal-lower-third": MinimalLowerThird,
  "social-handle-strip": SocialHandleStrip,
  "guest-title-role": GuestTitleRole,
  "subscribe-cta-card": SubscribeCtaCard,
  "comment-prompt": CommentPrompt,
  "hero-title-stack": HeroTitleStack,
  "full-headline": FullHeadline,
  "numbered-list": NumberedList,
  "quote-card": QuoteCard,
  "definition-card": DefinitionCard,
  "timer-countdown": TimerCountdown,
  "section-bumper": SectionBumper,
  "dual-guest-lower-third": DualGuestLowerThird,
  "sponsor-disclosure": SponsorDisclosure,
  "poll-vs": PollVs,
  "product-price-callout": ProductPriceCallout,
  "location-date-stamp": LocationDateStamp,
  "end-card-simple": EndCardSimple,
  "step-progress": StepProgress,
  "breaking-live-strip": BreakingLiveStrip,
  "calendar-event-card": CalendarEventCard,
  "keyboard-tip-overlay": KeyboardTipOverlay,
  "goal-bar-generic": GoalBarGeneric,
};

export function getTemplateEntry(id: string): TemplateEntry | undefined {
  const definition = TEMPLATE_DEFINITIONS.find((d) => d.id === id);
  const Component = COMPONENTS[id];
  if (!definition || !Component) return undefined;
  return { definition, Component };
}

export function allTemplateEntries(): TemplateEntry[] {
  return TEMPLATE_DEFINITIONS.map((definition) => {
    const Component = COMPONENTS[definition.id];
    if (!Component) throw new Error(`Missing component for template ${definition.id}`);
    return { definition, Component };
  });
}
