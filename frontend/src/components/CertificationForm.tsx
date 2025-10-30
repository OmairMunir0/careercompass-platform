"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PrimaryButton, SecondaryButton, TextAreaInput, TextInput } from "./ui";

export interface Certification {
  id?: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialUrl?: string | null;
  description?: string | null;
  imageUrl?: string | null;
}

interface CertificationFormProps {
  certification?: Certification;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CertificationForm({
  certification,
  onSuccess,
  onCancel,
}: CertificationFormProps) {
  const isEdit = !!certification?.id;
  const defaultForm: Certification = certification || {
    name: "",
    issuingOrganization: "",
    issueDate: "",
    expiryDate: null,
    credentialUrl: "",
    description: "",
    imageUrl: "",
  };

  const [form, setForm] = useState<Certification>(defaultForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && certification?.id) {
        await axiosInstance.put(`/user-certifications/${certification.id}`, form);
        toast.success("Certification updated!");
      } else {
        await axiosInstance.post("/user-certifications", form);
        toast.success("Certification added!");
      }
      onSuccess?.();
    } catch {
      toast.error("Failed to save certification.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!certification?.id) return;
    if (!confirm("Are you sure you want to delete this certification?")) return;

    try {
      await axiosInstance.delete(`/user-certifications/${certification.id}`);
      toast.success("Certification deleted!");
      onSuccess?.();
    } catch {
      toast.error("Failed to delete certification.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 w-[400px]">
      <TextInput
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Certification Name"
        required
      />
      <TextInput
        name="issuingOrganization"
        value={form.issuingOrganization}
        onChange={handleChange}
        placeholder="Issuing Organization"
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <TextInput
          name="issueDate"
          value={form.issueDate}
          onChange={handleChange}
          type="date"
          placeholder="Issue Date"
          required
        />
        <TextInput
          name="expiryDate"
          value={form.expiryDate ?? ""}
          onChange={handleChange}
          type="date"
          placeholder="Expiry Date (optional)"
        />
      </div>
      <TextInput
        name="credentialUrl"
        value={form.credentialUrl ?? ""}
        onChange={handleChange}
        placeholder="Credential URL (optional)"
      />
      <TextAreaInput
        name="description"
        value={form.description ?? ""}
        onChange={handleChange}
        placeholder="Description (optional)"
        rows={3}
      />

      <div className="flex gap-2 mt-2">
        <PrimaryButton type="submit" isLoading={loading}>
          {isEdit ? "Update" : "Add"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        {isEdit && (
          <SecondaryButton
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </SecondaryButton>
        )}
      </div>
    </form>
  );
}
