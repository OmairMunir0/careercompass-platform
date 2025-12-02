"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Pen, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PrimaryButton, SecondaryButton, TextAreaInput, TextInput } from "./ui";

interface Experience {
  _id: string;
  jobTitle: string;
  company: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  isCurrent: boolean;
}

interface ExperienceFormProps {
  experience?: Experience;
  onSuccess?: () => void;
  experiences?: Experience[]; // existing experiences to display
  onEditExperience?: (exp: Experience) => void; // optional callback to edit from list
}

export default function ExperienceForm({
  experience,
  onSuccess,
  experiences = [],
  onEditExperience,
}: ExperienceFormProps) {
  const isEdit = !!experience?._id;
  const defaultForm: Experience = experience || {
    _id: "",
    jobTitle: "",
    company: "",
    location: "",
    startDate: "",
    endDate: null,
    description: "",
    isCurrent: false,
  };

  const [form, setForm] = useState<Experience>(defaultForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && experience?._id) {
        await axiosInstance.put(`/user-experiences/${experience._id}`, form);
        toast.success("Experience updated!");
      } else {
        await axiosInstance.post("/user-experiences", form);
        toast.success("Experience added!");
      }
      onSuccess?.();
    } catch {
      toast.error("Failed to save experience.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this experience?")) return;

    try {
      await axiosInstance.delete(`/user-experiences/${id}`);
      toast.success("Experience deleted!");
      onSuccess?.();
    } catch {
      toast.error("Failed to delete experience.");
    }
  };

  const handleClear = () => setForm(defaultForm);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {/* Existing experiences list with edit/delete */}
      {experiences.length > 0 && (
        <div className="mb-4 p-2 border border-gray-300 rounded-md bg-gray-50">
          <h4 className="font-medium text-gray-800 mb-2">Your Existing Experiences</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {experiences.map((exp) => (
              <li
                key={exp._id}
                className="flex justify-between items-center border p-2 rounded hover:bg-gray-100"
              >
                <div>
                  {exp.jobTitle} at {exp.company} ({exp.startDate} →{" "}
                  {exp.isCurrent ? "Present" : exp.endDate ?? "—"})
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditExperience?.(exp)}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <Pen className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(exp._id)}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <Trash className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TextInput
        name="jobTitle"
        value={form.jobTitle}
        onChange={handleChange}
        placeholder="Job Title"
        required
      />
      <TextInput
        name="company"
        value={form.company}
        onChange={handleChange}
        placeholder="Company"
        required
      />
      <TextInput
        name="location"
        value={form.location ?? ""}
        onChange={handleChange}
        placeholder="Location"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <TextInput
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          placeholder="Start Date"
          type="date"
          required
        />
        {!form.isCurrent && (
          <TextInput
            name="endDate"
            value={form.endDate ?? ""}
            onChange={handleChange}
            placeholder="End Date"
            type="date"
          />
        )}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isCurrent"
          checked={form.isCurrent}
          onChange={handleChange}
          id="isCurrent"
          className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label htmlFor="isCurrent" className="text-sm text-gray-700">
          Currently working here
        </label>
      </div>
      <TextAreaInput
        name="description"
        value={form.description ?? ""}
        onChange={handleChange}
        placeholder="Description"
        rows={4}
      />

      <div className="flex gap-3">
        <PrimaryButton type="submit" isLoading={loading}>
          {isEdit ? "Update Experience" : "Add Experience"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={handleClear}>
          Reset Form
        </SecondaryButton>
      </div>
    </form>
  );
}
