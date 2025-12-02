"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";

interface Skill {
  id?: string;
  name: string;
  categoryId?: string | null;
  proficiencyLevelId?: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Proficiency {
  id: string;
  name: string;
}

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Proficiency[]>([]);
  const [selected, setSelected] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [skillsRes, catRes, levelRes] = await Promise.all([
        axiosInstance.get<Skill[]>("/skills"),
        axiosInstance.get<Category[]>("/skill-categories"),
        axiosInstance.get<Proficiency[]>("/proficiency-levels"),
      ]);
      setSkills(skillsRes.data);
      setCategories(catRes.data);
      setLevels(levelRes.data);
    } catch {
      setError("Failed to load skills data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSuccess = () => {
    setSelected(null);
    fetchAll();
  };

  return (
    <div className="p-2 text-gray-800 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
        <button
          onClick={() => setSelected({ name: "", categoryId: null, proficiencyLevelId: null })}
          className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 transition-colors"
        >
          + Add New
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center min-h-[120px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : skills.length === 0 ? (
        <p className="text-gray-600">No skills yet.</p>
      ) : (
        <ul className="space-y-3">
          {skills.map((s) => (
            <li
              key={s.id}
              className="border border-gray-300 rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelected(s)}
            >
              <div className="font-medium text-gray-900">{s.name}</div>
              <div className="text-sm text-gray-700">
                {categories.find((c) => c.id === s.categoryId)?.name || "Uncategorized"} •{" "}
                {levels.find((l) => l.id === s.proficiencyLevelId)?.name || "No Level"}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="border-t border-gray-200 mt-6 pt-6">
          <SkillForm
            key={selected.id || "new"}
            skill={selected.id ? selected : undefined}
            categories={categories}
            levels={levels}
            onSuccess={handleSuccess}
          />
        </div>
      )}
    </div>
  );
}

interface SkillFormProps {
  skill?: Skill;
  categories: Category[];
  levels: Proficiency[];
  onSuccess?: () => void;
}

function SkillForm({ skill, categories, levels, onSuccess }: SkillFormProps) {
  const isEdit = !!skill?.id;
  const [form, setForm] = useState<Skill>(
    skill || {
      name: "",
      categoryId: null,
      proficiencyLevelId: null,
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isEdit && skill?.id) {
        await axiosInstance.put(`/skills/${skill.id}`, form);
      } else {
        await axiosInstance.post("/skills", form);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save skill.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !skill?.id) return;
    if (!confirm("Are you sure you want to delete this skill?")) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/skills/${skill.id}`);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete skill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          name="categoryId"
          value={form.categoryId ?? ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency Level</label>
        <select
          name="proficiencyLevelId"
          value={form.proficiencyLevelId ?? ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
        >
          <option value="">Select proficiency</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Saving..." : isEdit ? "Update Skill" : "Add Skill"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-md text-white font-medium bg-red-600 hover:bg-red-700 transition-colors disabled:bg-gray-400"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
