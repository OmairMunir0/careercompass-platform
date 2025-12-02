"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Pen, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ExperienceForm from "./ExperienceForm";
import { formatDate } from "@/lib/date";
import { PrimaryButton, SecondaryButton } from "./ui";

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

export default function ExperienceManager() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selected, setSelected] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get<Experience[]>("/user-experiences/me");
      setExperiences(data);
    } catch {
      toast.error("Failed to load experiences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleSuccess = () => {
    setSelected(null);
    setIsDrawerOpen(false);
    fetchExperiences();
  };

  const handleAddNew = () => {
    setSelected({
      _id: "",
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: null,
      description: "",
      isCurrent: false,
    });
    setIsDrawerOpen(true);
  };

  const handleEdit = (exp: Experience) => {
    setSelected(exp);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this experience?")) return;
    try {
      await axiosInstance.delete(`/user-experiences/${id}`);
      toast.success("Experience deleted!");
      fetchExperiences();
    } catch {
      toast.error("Failed to delete experience.");
    }
  };

  return (
    <div className="p-2 text-gray-800 bg-white space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Experience</h2>
        <PrimaryButton onClick={handleAddNew}>+ Add New</PrimaryButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[120px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : experiences.length === 0 ? (
        <p className="text-gray-600">No experience records yet.</p>
      ) : (
        <ul className="space-y-3">
          {experiences.map((exp) => (
            <li
              key={exp._id}
              className="border border-gray-300 rounded-md p-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div className="cursor-pointer" onClick={() => handleEdit(exp)}>
                <div className="font-medium">{exp.jobTitle}</div>
                <div className="text-sm text-gray-700">{exp.company}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(exp.startDate, "MMM yyyy")} → {exp.isCurrent ? "Present" : exp.endDate ? formatDate(exp.endDate, "MMM yyyy") : "—"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(exp)}
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
              <ExperienceForm
                key={selected._id || "new"}
                experience={selected}
                onSuccess={handleSuccess}
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
