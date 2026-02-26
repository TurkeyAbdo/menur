"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ThemeBuilderForm from "../../ThemeBuilderForm";

export default function EditThemePage() {
  const { id } = useParams<{ id: string }>();
  const [theme, setTheme] = useState<{
    id: string;
    name: string;
    nameAr: string | null;
    config: {
      colors: Record<string, string>;
      fonts: { heading: string; body: string };
      layout: { itemStyle: string; categoryStyle: string };
      decoration: { type: string; color: string };
      features: { showPhotos: boolean; showDecorations: boolean; customFont: boolean };
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/themes/custom")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.themes || []).find(
          (t: { id: string }) => t.id === id
        );
        if (found) {
          setTheme({
            id: found.id,
            name: found.name,
            nameAr: found.nameAr,
            config: found.config,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Theme not found
      </div>
    );
  }

  return <ThemeBuilderForm initialData={theme} />;
}
