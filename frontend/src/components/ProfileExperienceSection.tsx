"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Experience as ExperienceType } from "@/lib/schema.type";

interface Props {
  profileId: string;
  experiences: ExperienceType[];
  isEditing: boolean;
  setExperiences: (exps: ExperienceType[]) => void;
}

const ProfileExperienceSection: React.FC<Props> = ({
  profileId,
  experiences,
  isEditing,
  setExperiences,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceType | null>(null);

  const ExperienceForm: React.FC<{
    experience?: ExperienceType;
    onSave: (exp: ExperienceType) => void;
    onCancel: () => void;
  }> = ({ experience, onSave, onCancel }) => {
    const [formData, setFormData] = useState<ExperienceType>({
      id: experience?.id ?? Date.now().toString(),
      profileId: experience?.profileId ?? profileId,
      jobTitle: experience?.jobTitle ?? "",
      company: experience?.company ?? "",
      location: experience?.location ?? null,
      startDate: experience?.startDate ?? "",
      endDate: experience?.endDate ?? null,
      description: experience?.description ?? null,
      isCurrent: experience?.isCurrent ?? false,
    });

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(formData);
        }}
        className="bg-gray-50 p-4 rounded-lg space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Company"
            value={formData.company}
            onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Position / Job Title"
            value={formData.jobTitle}
            onChange={(e) => setFormData((p) => ({ ...p, jobTitle: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="month"
            value={formData.startDate}
            onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="month"
            value={formData.endDate ?? ""}
            onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value || null }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
            disabled={formData.isCurrent}
          />
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isCurrent}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                isCurrent: e.target.checked,
                endDate: e.target.checked ? null : p.endDate,
              }))
            }
            className="rounded border-gray-300 text-purple-600"
          />
          <span className="text-sm text-gray-700">I currently work here</span>
        </label>

        <textarea
          placeholder="Description"
          value={formData.description ?? ""}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={4}
        />

        <div className="flex space-x-2">
          <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md">
            Save
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md">
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {isEditing && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      )}

      {showForm && (
        <ExperienceForm
          experience={editingExperience ?? undefined}
          onSave={(exp) => {
            if (editingExperience) {
              setExperiences(experiences.map((e) => (e.id === exp.id ? exp : e)));
              setEditingExperience(null);
            } else {
              setExperiences([...experiences, exp]);
            }
            setShowForm(false);
          }}
          onCancel={() => {
            setEditingExperience(null);
            setShowForm(false);
          }}
        />
      )}

      <div className="space-y-2">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="p-4 border border-gray-200 rounded-md flex justify-between items-start"
          >
            <div>
              <p className="font-semibold text-gray-900">{exp.jobTitle}</p>
              <p className="text-gray-700">{exp.company}</p>
              <p className="text-gray-500 text-sm">
                {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
              </p>
            </div>
            {isEditing && (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingExperience(exp);
                    setShowForm(true);
                  }}
                  className="text-purple-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setExperiences(experiences.filter((e) => e.id !== exp.id))}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileExperienceSection;
