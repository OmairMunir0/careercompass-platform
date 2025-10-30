"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Plus, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Skill {
  _id: string;
  name: string;
}

interface ProficiencyLevel {
  _id: string;
  name: string;
}

interface UserSkill {
  _id: string;
  skillId: Skill;
  proficiencyLevelId?: ProficiencyLevel | null;
}

interface EditableSkill {
  skillId: string;
  proficiencyLevelId?: string | null;
}

export default function SkillManager() {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [levels, setLevels] = useState<ProficiencyLevel[]>([]);
  const [newSkill, setNewSkill] = useState<EditableSkill>({
    skillId: "",
    proficiencyLevelId: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [userRes, skillRes, levelRes] = await Promise.all([
        axiosInstance.get("/user-skills/me"),
        axiosInstance.get("/skills"),
        axiosInstance.get("/proficiency-levels"),
      ]);
      setSkills(userRes.data);
      setAllSkills(skillRes.data);
      setLevels(levelRes.data);
    } catch {
      toast.error("Failed to load skills.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newSkill.skillId) return;
    try {
      const updated = [
        ...skills,
        {
          _id: crypto.randomUUID(),
          skillId: allSkills.find((s) => s._id === newSkill.skillId)!,
          proficiencyLevelId: levels.find((l) => l._id === newSkill.proficiencyLevelId) || null,
        },
      ];
      await saveSkills(updated);
      toast.success("Skill added!");
      setNewSkill({ skillId: "", proficiencyLevelId: null });
      fetchAll();
    } catch {
      toast.error("Failed to add skill.");
    }
  };

  const handleDelete = async (skillId: string) => {
    try {
      await axiosInstance.delete(`/user-skills/me/${skillId}`);
      setSkills((prev) => prev.filter((s) => s.skillId._id !== skillId));
      toast.success("Skill removed!");
    } catch {
      toast.error("Failed to remove skill.");
    }
  };

  const saveSkills = async (updated: UserSkill[]) => {
    try {
      const payload = updated.map((s) => ({
        skillId: s.skillId._id,
        proficiencyLevelId: s.proficiencyLevelId?._id || null,
      }));
      await axiosInstance.put("/user-skills/me", { skills: payload });
      toast.success("Skills saved!");
    } catch {
      toast.error("Failed to save skills.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center text-gray-600 text-sm py-6">
        Loading skills...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Add new skill */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Add New Skill</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
            <select
              value={newSkill.skillId}
              onChange={(e) => setNewSkill({ ...newSkill, skillId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="">Select a skill</option>
              {allSkills.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
            <select
              value={newSkill.proficiencyLevelId ?? ""}
              onChange={(e) =>
                setNewSkill({ ...newSkill, proficiencyLevelId: e.target.value || null })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="">Select level</option>
              {levels.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-3">
        {skills.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No skills added yet.</p>
        ) : (
          skills.map((s) => (
            <div
              key={s._id}
              className="flex justify-between items-center border border-gray-200 bg-white rounded-md p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium text-gray-900">{s.skillId.name}</p>
                <p className="text-sm text-gray-600">
                  {s.proficiencyLevelId?.name || "No proficiency selected"}
                </p>
              </div>
              <button
                onClick={() => handleDelete(s.skillId._id)}
                className="p-2 rounded hover:bg-red-50"
                title="Remove skill"
              >
                <Trash className="h-4 w-4 text-red-600" />
              </button>
            </div>
          ))
        )}
      </div>

      {skills.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => saveSkills(skills)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
          >
            <Save className="h-4 w-4" /> Save All
          </button>
        </div>
      )}
    </div>
  );
}
