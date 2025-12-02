"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Pen, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import EducationForm, { Education } from "./EducationForm";
import { PrimaryButton, SecondaryButton } from "./ui";
import { formatDate } from "@/lib/date";


export default function EducationManager() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [selected, setSelected] = useState<Education | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchEducations = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get<Education[]>("/user-educations/me");
      setEducations(data);
    } catch {
      toast.error("Failed to load education records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducations();
  }, []);

  const handleSuccess = () => {
    setSelected(null);
    setIsDrawerOpen(false);
    fetchEducations();
  };

  const handleAddNew = () => {
    setSelected({
      _id: "",
      degree: "",
      institution: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: null,
      description: "",
    });
    setIsDrawerOpen(true);
  };

  const handleEdit = (edu: Education) => {
    setSelected(edu);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (_id: string) => {
    if (!_id) return;
    if (!confirm("Are you sure you want to delete this education?")) return;

    try {
      await axiosInstance.delete(`/user-educations/${_id}`);
      toast.success("Education deleted!");
      fetchEducations();
    } catch {
      toast.error("Failed to delete education.");
    }
  };

  return (
    <div className="p-2 text-gray-800 bg-white space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Education</h2>
        <PrimaryButton onClick={handleAddNew}>+ Add New</PrimaryButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[120px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : educations.length === 0 ? (
        <p className="text-gray-600">No education records yet.</p>
      ) : (
        <ul className="space-y-3">
          {educations.map((edu) => (
            <li
              key={edu._id}
              className="border border-gray-300 rounded-md p-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div className="cursor-pointer" onClick={() => handleEdit(edu)}>
                <div className="font-medium">{edu.degree}</div>
                <div className="text-sm text-gray-700">{edu.institution}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(edu.startDate)} → {formatDate(edu.endDate) ?? "Present"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(edu)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Pen className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(edu._id)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Trash className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-end border-b-2 border-gray-200 px-4 py-3">
            <SecondaryButton
              type="button"
              className="self-end text-gray-500 hover:text-gray-700"
              onClick={() => setIsDrawerOpen(false)}
            >
              Close
            </SecondaryButton>
          </div>
          <div className="px-4 pb-3 overflow-y-auto">
            {selected && (
              <EducationForm
                key={selected._id || "new"}
                education={selected}
                onSuccess={handleSuccess}
                onCancel={() => setIsDrawerOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsDrawerOpen(false)} />
      )}
    </div>
  );
}
