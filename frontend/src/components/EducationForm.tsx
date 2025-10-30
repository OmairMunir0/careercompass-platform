"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { PrimaryButton, SecondaryButton, TextAreaInput, TextInput } from "./ui";

export interface Education {
  _id: string;
  degree: string;
  institution: string;
  fieldOfStudy?: string | null;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
}

interface EducationFormProps {
  education?: Education;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EducationForm({ education, onSuccess, onCancel }: EducationFormProps) {
  const isEdit = !!education?._id;
  const defaultForm: Education = education || {
    _id: "",
    degree: "",
    institution: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: null,
    description: "",
  };

  const [form, setForm] = useState<Education>(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => setForm(defaultForm), [education]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && education._id) {
        await axiosInstance.put(`/user-educations/${education._id}`, form);
        toast.success("Education updated!");
      } else {
        await axiosInstance.post("/user-educations", form);
        toast.success("Education added!");
      }
      onSuccess?.();
    } catch {
      toast.error("Failed to save education.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <TextInput
        name="degree"
        value={form.degree}
        onChange={handleChange}
        placeholder="Degree"
        required
      />
      <TextInput
        name="institution"
        value={form.institution}
        onChange={handleChange}
        placeholder="Institution"
        required
      />
      <TextInput
        name="fieldOfStudy"
        value={form.fieldOfStudy ?? ""}
        onChange={handleChange}
        placeholder="Field of Study"
      />
      <div className="grid grid-cols-2 gap-x-4">
        <TextInput
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          placeholder="Start Date"
          required
        />
        <TextInput
          name="endDate"
          type="date"
          value={form.endDate ?? ""}
          onChange={handleChange}
          placeholder="End Date"
        />
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
          {isEdit ? "Update Education" : "Add Education"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
      </div>
    </form>
  );
}
