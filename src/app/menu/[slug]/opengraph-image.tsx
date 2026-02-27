/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const alt = "Menu on Menur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { name: true, nameAr: true, logo: true },
  });

  const name = restaurant?.name || "Menu";
  const logo = restaurant?.logo;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {logo && (
          <img
            src={logo}
            alt=""
            width={120}
            height={120}
            style={{
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.3)",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            marginTop: logo ? 24 : 0,
            fontSize: 52,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            maxWidth: "80%",
            lineHeight: 1.2,
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 24,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          View Menu on Menur
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          menur.app
        </div>
      </div>
    ),
    { ...size },
  );
}
