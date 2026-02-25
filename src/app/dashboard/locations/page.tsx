"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  Plus,
  MapPin,
  Trash2,
  Edit2,
  X,
  Check,
  Phone,
  Clock,
  Loader2,
} from "lucide-react";

interface OpeningHours {
  [day: string]: { open: string; close: string };
}

interface Location {
  id: string;
  name: string;
  nameAr: string | null;
  address: string;
  addressAr: string | null;
  city: string;
  region: string | null;
  phone: string | null;
  openingHours: OpeningHours | null;
  isActive: boolean;
}

const DAYS = [
  { key: "sunday", label: "Sunday", labelAr: "الأحد" },
  { key: "monday", label: "Monday", labelAr: "الاثنين" },
  { key: "tuesday", label: "Tuesday", labelAr: "الثلاثاء" },
  { key: "wednesday", label: "Wednesday", labelAr: "الأربعاء" },
  { key: "thursday", label: "Thursday", labelAr: "الخميس" },
  { key: "friday", label: "Friday", labelAr: "الجمعة" },
  { key: "saturday", label: "Saturday", labelAr: "السبت" },
];

const emptyForm = () => ({
  name: "",
  nameAr: "",
  address: "",
  addressAr: "",
  city: "",
  region: "",
  phone: "",
  openingHours: Object.fromEntries(
    DAYS.map((d) => [d.key, { open: "09:00", close: "22:00" }])
  ) as OpeningHours,
});

export default function LocationsPage() {
  const t = useTranslations("dashboard");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");

  const fetchLocations = () => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data) => {
        setLocations(data.locations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEdit = (loc: Location) => {
    setForm({
      name: loc.name,
      nameAr: loc.nameAr || "",
      address: loc.address,
      addressAr: loc.addressAr || "",
      city: loc.city,
      region: loc.region || "",
      phone: loc.phone || "",
      openingHours: (loc.openingHours as OpeningHours) ||
        Object.fromEntries(
          DAYS.map((d) => [d.key, { open: "09:00", close: "22:00" }])
        ),
    });
    setEditingId(loc.id);
    setShowForm(true);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.address || !form.city) {
      setError("Name, address, and city are required");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/locations/${editingId}` : "/api/locations";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setShowForm(false);
      fetchLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  const updateHours = (day: string, field: "open" | "close", value: string) => {
    setForm((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value },
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("locations")}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Location
        </button>
      </div>

      {/* Location Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Location" : "Add Location"}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-4 space-y-4">
              {/* Names */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location Name (عربي)
                  </label>
                  <input
                    type="text"
                    value={form.nameAr}
                    onChange={(e) =>
                      setForm({ ...form, nameAr: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location Name (English) *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address (عربي)
                  </label>
                  <input
                    type="text"
                    value={form.addressAr}
                    onChange={(e) =>
                      setForm({ ...form, addressAr: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address (English) *
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* City, Region, Phone */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Region
                  </label>
                  <input
                    type="text"
                    value={form.region}
                    onChange={(e) =>
                      setForm({ ...form, region: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Opening Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Clock className="mb-0.5 inline h-4 w-4" /> Opening Hours
                </label>
                <div className="mt-2 space-y-2">
                  {DAYS.map((day) => (
                    <div
                      key={day.key}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="w-24 text-gray-600">
                        {day.labelAr}
                      </span>
                      <input
                        type="time"
                        value={form.openingHours[day.key]?.open || "09:00"}
                        onChange={(e) =>
                          updateHours(day.key, "open", e.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="time"
                        value={form.openingHours[day.key]?.close || "22:00"}
                        onChange={(e) =>
                          updateHours(day.key, "close", e.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" />
                    {editingId ? "Update" : "Add"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Cards */}
      {locations.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No locations yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your restaurant branches and locations
          </p>
          <button
            onClick={openAdd}
            className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className={`rounded-xl border bg-white p-6 transition hover:shadow-md ${
                loc.isActive ? "border-gray-200" : "border-red-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {loc.nameAr || loc.name}
                    </h3>
                    {loc.nameAr && loc.name && (
                      <p className="text-xs text-gray-400">{loc.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {loc.isActive ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span>{loc.addressAr || loc.address}</span>
                </p>
                <p className="ps-5 text-xs text-gray-400">
                  {loc.city}{loc.region ? ` - ${loc.region}` : ""}
                </p>
                {loc.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span dir="ltr">{loc.phone}</span>
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => openEdit(loc)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
