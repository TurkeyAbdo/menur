"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import ThemePicker, { type ThemeOption } from "@/components/ThemePicker";

interface Variant {
  name: string;
  nameAr: string;
  priceModifier: string;
}

interface MenuItem {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  photo: File | null;
  photoPreview: string;
  existingPhotoUrl: string;
  availability: "AVAILABLE" | "UNAVAILABLE";
  isSpecial: boolean;
  timeSlot: "ALL" | "BREAKFAST" | "LUNCH" | "DINNER";
  variants: Variant[];
}

interface Category {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  expanded: boolean;
  items: MenuItem[];
}

const emptyItem = (): MenuItem => ({
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  price: "",
  photo: null,
  photoPreview: "",
  existingPhotoUrl: "",
  availability: "AVAILABLE",
  isSpecial: false,
  timeSlot: "ALL",
  variants: [],
});

const emptyCategory = (): Category => ({
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  expanded: true,
  items: [emptyItem()],
});

export default function EditMenuPage() {
  const t = useTranslations("menu.builder");
  const router = useRouter();
  const params = useParams();
  const menuId = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [menuName, setMenuName] = useState("");
  const [menuNameAr, setMenuNameAr] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [menuDescriptionAr, setMenuDescriptionAr] = useState("");
  const [layout, setLayout] = useState<"SCROLLABLE" | "TABBED">("SCROLLABLE");
  const [currentStatus, setCurrentStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [categories, setCategories] = useState<Category[]>([emptyCategory()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load themes
  useEffect(() => {
    fetch("/api/themes")
      .then((r) => r.json())
      .then((data) => setThemes(data.themes || []))
      .catch(() => {});
  }, []);

  // Load existing menu data
  useEffect(() => {
    fetch(`/api/menus/${menuId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        const menu = data.menu;
        setMenuName(menu.name || "");
        setMenuNameAr(menu.nameAr || "");
        setMenuDescription(menu.description || "");
        setMenuDescriptionAr(menu.descriptionAr || "");
        setLayout(menu.layout || "SCROLLABLE");
        setCurrentStatus(menu.status || "DRAFT");
        setSelectedTheme(menu.themeId || "");

        if (menu.categories && menu.categories.length > 0) {
          setCategories(
            menu.categories.map((cat: {
              name: string;
              nameAr: string | null;
              description: string | null;
              descriptionAr: string | null;
              items: {
                name: string;
                nameAr: string | null;
                description: string | null;
                descriptionAr: string | null;
                price: number | string;
                photo: string | null;
                availability: string;
                isSpecial: boolean;
                timeSlot: string;
                variants: {
                  name: string;
                  nameAr: string | null;
                  priceModifier: number | string;
                }[];
              }[];
            }) => ({
              name: cat.name || "",
              nameAr: cat.nameAr || "",
              description: cat.description || "",
              descriptionAr: cat.descriptionAr || "",
              expanded: true,
              items: cat.items.map((item) => ({
                name: item.name || "",
                nameAr: item.nameAr || "",
                description: item.description || "",
                descriptionAr: item.descriptionAr || "",
                price: String(item.price || ""),
                photo: null,
                photoPreview: item.photo || "",
                existingPhotoUrl: item.photo || "",
                availability: (item.availability as "AVAILABLE" | "UNAVAILABLE") || "AVAILABLE",
                isSpecial: item.isSpecial || false,
                timeSlot: (item.timeSlot as "ALL" | "BREAKFAST" | "LUNCH" | "DINNER") || "ALL",
                variants: item.variants.map((v) => ({
                  name: v.name || "",
                  nameAr: v.nameAr || "",
                  priceModifier: String(v.priceModifier || ""),
                })),
              })),
            }))
          );
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Menu not found");
        setLoading(false);
      });
  }, [menuId]);

  const updateCategory = (idx: number, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat, i) => (i === idx ? { ...cat, ...updates } : cat))
    );
  };

  const removeCategory = (idx: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (catIdx: number, itemIdx: number, updates: Partial<MenuItem>) => {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci === catIdx
          ? {
              ...cat,
              items: cat.items.map((item, ii) =>
                ii === itemIdx ? { ...item, ...updates } : item
              ),
            }
          : cat
      )
    );
  };

  const removeItem = (catIdx: number, itemIdx: number) => {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci === catIdx
          ? { ...cat, items: cat.items.filter((_, ii) => ii !== itemIdx) }
          : cat
      )
    );
  };

  const addVariant = (catIdx: number, itemIdx: number) => {
    updateItem(catIdx, itemIdx, {
      variants: [
        ...categories[catIdx].items[itemIdx].variants,
        { name: "", nameAr: "", priceModifier: "" },
      ],
    });
  };

  const updateVariant = (
    catIdx: number,
    itemIdx: number,
    varIdx: number,
    updates: Partial<Variant>
  ) => {
    const newVariants = [...categories[catIdx].items[itemIdx].variants];
    newVariants[varIdx] = { ...newVariants[varIdx], ...updates };
    updateItem(catIdx, itemIdx, { variants: newVariants });
  };

  const removeVariant = (catIdx: number, itemIdx: number, varIdx: number) => {
    const newVariants = categories[catIdx].items[itemIdx].variants.filter(
      (_, i) => i !== varIdx
    );
    updateItem(catIdx, itemIdx, { variants: newVariants });
  };

  const handlePhotoChange = (
    catIdx: number,
    itemIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateItem(catIdx, itemIdx, {
          photo: file,
          photoPreview: reader.result as string,
          existingPhotoUrl: "",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) return null;
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  };

  const handleSave = async (status: "DRAFT" | "PUBLISHED") => {
    setError("");
    if (!menuNameAr && !menuName) {
      setError("Menu name is required");
      return;
    }

    setSaving(true);

    try {
      // Upload new photos to Cloudinary
      const photoUrls: Record<string, string> = {};
      for (let ci = 0; ci < categories.length; ci++) {
        for (let ii = 0; ii < categories[ci].items.length; ii++) {
          const item = categories[ci].items[ii];
          if (item.photo) {
            // New file selected — upload it
            const url = await uploadPhoto(item.photo);
            if (url) photoUrls[`${ci}-${ii}`] = url;
          } else if (item.existingPhotoUrl) {
            // Keep existing Cloudinary URL
            photoUrls[`${ci}-${ii}`] = item.existingPhotoUrl;
          }
        }
      }

      const payload = {
        name: menuName,
        nameAr: menuNameAr,
        description: menuDescription,
        descriptionAr: menuDescriptionAr,
        layout,
        status,
        themeId: selectedTheme || undefined,
        categories: categories.map((cat, catIdx) => ({
          name: cat.name,
          nameAr: cat.nameAr,
          description: cat.description,
          descriptionAr: cat.descriptionAr,
          sortOrder: catIdx,
          items: cat.items.map((item, itemIdx) => ({
            name: item.name,
            nameAr: item.nameAr,
            description: item.description,
            descriptionAr: item.descriptionAr,
            price: parseFloat(item.price) || 0,
            photo: photoUrls[`${catIdx}-${itemIdx}`] || null,
            allergens: [],
            dietaryTags: [],
            availability: item.availability,
            isSpecial: item.isSpecial,
            timeSlot: item.timeSlot,
            sortOrder: itemIdx,
            variants: item.variants.map((v) => ({
              name: v.name,
              nameAr: v.nameAr,
              priceModifier: parseFloat(v.priceModifier) || 0,
            })),
          })),
        })),
      };

      const res = await fetch(`/api/menus/${menuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.tierLimit) {
          toast("error", data.error);
          return;
        }
        throw new Error(data.error || "Failed to save");
      }

      toast("success", status === "PUBLISHED" ? "Menu published!" : "Menu saved as draft");
      router.push("/dashboard/menus");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            currentStatus === "PUBLISHED"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {currentStatus}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Menu Info */}
      <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("menuName")} (عربي)
            </label>
            <input
              type="text"
              value={menuNameAr}
              onChange={(e) => setMenuNameAr(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("menuName")} (English)
            </label>
            <input
              type="text"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("menuDescription")} (عربي)
            </label>
            <textarea
              value={menuDescriptionAr}
              onChange={(e) => setMenuDescriptionAr(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("menuDescription")} (English)
            </label>
            <textarea
              value={menuDescription}
              onChange={(e) => setMenuDescription(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>

        {/* Layout selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("selectLayout")}
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLayout("SCROLLABLE")}
              className={`rounded-lg border-2 p-4 text-center text-sm font-medium transition ${
                layout === "SCROLLABLE"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {t("scrollable")}
            </button>
            <button
              type="button"
              onClick={() => setLayout("TABBED")}
              className={`rounded-lg border-2 p-4 text-center text-sm font-medium transition ${
                layout === "TABBED"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {t("tabbed")}
            </button>
          </div>
        </div>

        {/* Theme selection */}
        <ThemePicker
          themes={themes}
          selectedTheme={selectedTheme}
          onSelect={setSelectedTheme}
          label={t("selectTheme")}
        />
      </div>

      {/* Categories */}
      <div className="mt-6 space-y-4">
        {categories.map((cat, catIdx) => (
          <div
            key={catIdx}
            className="rounded-xl border border-gray-200 bg-white"
          >
            {/* Category header */}
            <div
              className="flex cursor-pointer items-center justify-between p-4"
              onClick={() =>
                updateCategory(catIdx, { expanded: !cat.expanded })
              }
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-300" />
                <span className="font-semibold text-gray-900">
                  {cat.nameAr || cat.name || `${t("addCategory")} ${catIdx + 1}`}
                </span>
                <span className="text-sm text-gray-400">
                  ({cat.items.length} {t("addItem").split(" ").pop()})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {categories.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategory(catIdx);
                    }}
                    className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                {cat.expanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Category content */}
            {cat.expanded && (
              <div className="border-t border-gray-200 p-4">
                {/* Category name fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t("categoryName")} (عربي)
                    </label>
                    <input
                      type="text"
                      value={cat.nameAr}
                      onChange={(e) =>
                        updateCategory(catIdx, { nameAr: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t("categoryName")} (English)
                    </label>
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) =>
                        updateCategory(catIdx, { name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="mt-6 space-y-4">
                  {cat.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          {t("addItem")} {itemIdx + 1}
                        </span>
                        {cat.items.length > 1 && (
                          <button
                            onClick={() => removeItem(catIdx, itemIdx)}
                            className="rounded p-1 text-red-400 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Item name */}
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs text-gray-500">
                            {t("itemName")} (عربي)
                          </label>
                          <input
                            type="text"
                            value={item.nameAr}
                            onChange={(e) =>
                              updateItem(catIdx, itemIdx, {
                                nameAr: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">
                            {t("itemName")} (English)
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(catIdx, itemIdx, {
                                name: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs text-gray-500">
                            {t("itemDescription")} (عربي)
                          </label>
                          <textarea
                            value={item.descriptionAr}
                            onChange={(e) =>
                              updateItem(catIdx, itemIdx, {
                                descriptionAr: e.target.value,
                              })
                            }
                            rows={2}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">
                            {t("itemDescription")} (English)
                          </label>
                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              updateItem(catIdx, itemIdx, {
                                description: e.target.value,
                              })
                            }
                            rows={2}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* Price + Photo */}
                      <div className="mt-3 flex gap-3">
                        <div className="w-40">
                          <label className="block text-xs text-gray-500">
                            {t("itemPrice")} (SAR)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(catIdx, itemIdx, {
                                price: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                            dir="ltr"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500">
                            {t("itemPhoto")}
                          </label>
                          <div className="mt-1 flex items-center gap-3">
                            {item.photoPreview ? (
                              <div className="relative">
                                <label className="cursor-pointer">
                                  <Image
                                    src={item.photoPreview}
                                    alt=""
                                    width={64}
                                    height={64}
                                    className="h-16 w-16 rounded-lg object-cover hover:opacity-75 transition"
                                    unoptimized
                                  />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                      handlePhotoChange(catIdx, itemIdx, e)
                                    }
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateItem(catIdx, itemIdx, {
                                      photo: null,
                                      photoPreview: "",
                                      existingPhotoUrl: "",
                                    })
                                  }
                                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400">
                                <ImagePlus className="h-5 w-5 text-gray-400" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handlePhotoChange(catIdx, itemIdx, e)
                                  }
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Time slot + Availability + Special */}
                      <div className="mt-3 flex flex-wrap gap-3">
                        <div>
                          <label className="block text-xs text-gray-500">
                            {t("timeSlot")}
                          </label>
                          <select
                            value={item.timeSlot}
                            onChange={(e) =>
                              updateItem(catIdx, itemIdx, {
                                timeSlot: e.target.value as MenuItem["timeSlot"],
                              })
                            }
                            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                          >
                            <option value="ALL">{t("all")}</option>
                            <option value="BREAKFAST">{t("breakfast")}</option>
                            <option value="LUNCH">{t("lunch")}</option>
                            <option value="DINNER">{t("dinner")}</option>
                          </select>
                        </div>
                        <label className="mt-5 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.availability === "UNAVAILABLE"}
                            onChange={(e) =>
                              updateItem(catIdx, itemIdx, {
                                availability: e.target.checked
                                  ? "UNAVAILABLE"
                                  : "AVAILABLE",
                              })
                            }
                            className="rounded border-gray-300 text-indigo-600"
                          />
                          <span className="text-sm text-gray-600">
                            {t("unavailable")}
                          </span>
                        </label>
                        <label className="mt-5 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.isSpecial}
                            onChange={(e) =>
                              updateItem(catIdx, itemIdx, {
                                isSpecial: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300 text-indigo-600"
                          />
                          <span className="text-sm text-gray-600">
                            {t("dailySpecial")}
                          </span>
                        </label>
                      </div>

                      {/* Variants (Sizes & Extras) */}
                      <div className="mt-3">
                        <label className="block text-xs text-gray-500">
                          {t("variants")}
                        </label>
                        {item.variants.map((variant, varIdx) => (
                          <div
                            key={varIdx}
                            className="mt-2 flex items-center gap-2"
                          >
                            <input
                              type="text"
                              placeholder={t("variantName") + " (عربي)"}
                              value={variant.nameAr}
                              onChange={(e) =>
                                updateVariant(catIdx, itemIdx, varIdx, {
                                  nameAr: e.target.value,
                                })
                              }
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                              dir="rtl"
                            />
                            <input
                              type="text"
                              placeholder={t("variantName") + " (EN)"}
                              value={variant.name}
                              onChange={(e) =>
                                updateVariant(catIdx, itemIdx, varIdx, {
                                  name: e.target.value,
                                })
                              }
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                              dir="ltr"
                            />
                            <input
                              type="number"
                              placeholder={t("variantPrice")}
                              value={variant.priceModifier}
                              onChange={(e) =>
                                updateVariant(catIdx, itemIdx, varIdx, {
                                  priceModifier: e.target.value,
                                })
                              }
                              className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                              dir="ltr"
                            />
                            <button
                              onClick={() =>
                                removeVariant(catIdx, itemIdx, varIdx)
                              }
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addVariant(catIdx, itemIdx)}
                          className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          <Plus className="h-3 w-3" />
                          {t("addVariant")}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add item button */}
                  <button
                    type="button"
                    onClick={() =>
                      updateCategory(catIdx, {
                        items: [...cat.items, emptyItem()],
                      })
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <Plus className="h-4 w-4" />
                    {t("addItem")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add category button */}
        <button
          type="button"
          onClick={() => setCategories([...categories, emptyCategory()])}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-500 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          <Plus className="h-4 w-4" />
          {t("addCategory")}
        </button>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex gap-3 pb-12">
        <button
          type="button"
          onClick={() => handleSave("DRAFT")}
          disabled={saving}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          ) : (
            t("saveDraft")
          )}
        </button>
        <button
          type="button"
          onClick={() => handleSave("PUBLISHED")}
          disabled={saving}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-white" />
          ) : (
            t("publish")
          )}
        </button>
      </div>
    </div>
  );
}
