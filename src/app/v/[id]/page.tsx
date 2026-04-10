import { Metadata } from "next";
import prisma from "@/lib/prisma";
import PublicVideoClient from "./PublicVideoClient";

interface PageProps {
  params: { id: string };
}

async function getVideo(id: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        thumbnailUrl: true,
        duration: true,
        contentType: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!video) return null;
    if (video.status !== "complete" && video.status !== "published") return null;

    return video;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const video = await getVideo(params.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.theofficial.ai";

  if (!video) {
    return {
      title: "Video Not Found | Official AI",
      description: "This video is no longer available.",
    };
  }

  const creatorName = `${video.user.firstName} ${video.user.lastName}`;
  const title = `${video.title} | Made with Official AI`;
  const description =
    video.description ||
    `AI-generated video by ${creatorName}. Create your own AI videos at Official AI.`;

  return {
    title,
    description,
    openGraph: {
      type: "video.other",
      title,
      description,
      url: `${siteUrl}/v/${video.id}`,
      siteName: "Official AI",
      images: video.thumbnailUrl
        ? [
            {
              url: video.thumbnailUrl,
              width: 1280,
              height: 720,
              alt: video.title,
            },
          ]
        : [
            {
              url: `${siteUrl}/og-image.png`,
              width: 1200,
              height: 630,
              alt: "Official AI",
            },
          ],
      videos: video.videoUrl
        ? [
            {
              url: video.videoUrl,
              width: 1280,
              height: 720,
              type: "video/mp4",
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: video.thumbnailUrl
        ? [video.thumbnailUrl]
        : [`${siteUrl}/og-image.png`],
    },
  };
}

export default async function PublicVideoPage({ params }: PageProps) {
  const video = await getVideo(params.id);

  if (!video) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Video Not Found
          </h1>
          <p className="text-white/40 mb-6">
            This video is no longer available or has not been published yet.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#050508] text-[14px] font-medium hover:bg-white/90 transition-all"
          >
            Go to Official AI
          </a>
        </div>
      </div>
    );
  }

  return (
    <PublicVideoClient
      video={{
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        contentType: video.contentType,
        createdAt: video.createdAt.toISOString(),
        creator: {
          name: `${video.user.firstName} ${video.user.lastName}`,
          avatarUrl: video.user.avatarUrl,
        },
      }}
    />
  );
}
