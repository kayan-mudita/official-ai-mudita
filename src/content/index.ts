import type { ReactElement } from "react";

import { pillarToc as aiVideoToc, PillarContent as AiVideoPillarContent, subTopicContent as aiVideoSubTopics } from "./pillar-ai-video-creation";
import { pillarToc as videoMarketingToc, PillarContent as VideoMarketingPillarContent, subTopicContent as videoMarketingSubTopics } from "./pillar-video-marketing-professionals";
import { pillarToc as socialMediaToc, PillarContent as SocialMediaPillarContent, subTopicContent as socialMediaSubTopics } from "./pillar-social-media-video-strategy";
import { pillarToc as realEstateToc, PillarContent as RealEstatePillarContent, subTopicContent as realEstateSubTopics } from "./pillar-ai-video-real-estate";
import { pillarToc as proServicesToc, PillarContent as ProServicesPillarContent, subTopicContent as proServicesSubTopics } from "./pillar-ai-video-professional-services";
import { pillarToc as atScaleToc, PillarContent as AtScalePillarContent, subTopicContent as atScaleSubTopics } from "./pillar-ai-content-at-scale";

export const pillarContent: Record<string, { toc: { id: string; label: string }[]; Content: () => ReactElement }> = {
  "ai-video-creation": { toc: aiVideoToc, Content: AiVideoPillarContent },
  "video-marketing-professionals": { toc: videoMarketingToc, Content: VideoMarketingPillarContent },
  "social-media-video-strategy": { toc: socialMediaToc, Content: SocialMediaPillarContent },
  "ai-video-real-estate": { toc: realEstateToc, Content: RealEstatePillarContent },
  "ai-video-professional-services": { toc: proServicesToc, Content: ProServicesPillarContent },
  "ai-content-at-scale": { toc: atScaleToc, Content: AtScalePillarContent },
};

export const subTopicContentRegistry: Record<string, Record<string, () => ReactElement>> = {
  "ai-video-creation": aiVideoSubTopics,
  "video-marketing-professionals": videoMarketingSubTopics,
  "social-media-video-strategy": socialMediaSubTopics,
  "ai-video-real-estate": realEstateSubTopics,
  "ai-video-professional-services": proServicesSubTopics,
  "ai-content-at-scale": atScaleSubTopics,
};
