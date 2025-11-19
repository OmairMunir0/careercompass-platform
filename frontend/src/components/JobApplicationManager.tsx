"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Pen, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/date";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { PrimaryButton, SecondaryButton } from "./ui";

export interface ApplicationFormData {
  _id?: string;
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

interface Application {
  _id: string;
  job: { _id: string; title: string };
  coverLetter?: string;
  resumeUrl?: string;
  status: { _id: string; name: string };
  appliedAt: string;
}

export default function ApplicationManager() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<ApplicationFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get<Application[]>("/job-applications/me");
      setApplications(data);
    } catch {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSuccess = () => {
    setSelected(null);
    setIsDrawerOpen(false);
    fetchApplications();
  };

  const handleAddNew = () => {
    setSelected({ jobId: "", coverLetter: "", resumeUrl: "" });
    setIsDrawerOpen(true);
  };

  const handleEdit = (app: Application) => {
    setSelected({
      _id: app._id,
      jobId: app.job._id,
      coverLetter: app.coverLetter,
      resumeUrl: app.resumeUrl,
    });
    setIsDrawerOpen(true);
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await axiosInstance.put(`/job-applications/${id}/withdraw`);
      toast.success("Application withdrawn!");
      fetchApplications();
    } catch {
      toast.error("Failed to withdraw application.");
    }
  };

  return (
    <div className="p-4 bg-white space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Applications</h2>
        <PrimaryButton onClick={handleAddNew}>+ New Application</PrimaryButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[120px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : applications.length === 0 ? (
        <p className="text-gray-600">No applications submitted yet.</p>
      ) : (
        <ul className="space-y-3">
          {applications.map((app) => (
            <li
              key={app._id}
              className="border border-gray-300 rounded-md p-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div className="cursor-pointer" onClick={() => handleEdit(app)}>
                <div className="font-medium">{app.job.title}</div>
                <div className="text-sm text-gray-700">Status: {app.status.name}</div>
                <div className="text-xs text-gray-500">Applied: {formatDate(app.appliedAt)}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(app)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Pen className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => handleWithdraw(app._id)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-end border-b-2 border-gray-200 px-4 py-3">
            <SecondaryButton onClick={() => setIsDrawerOpen(false)}>Close</SecondaryButton>
          </div>
          <div className="px-4 pb-3 overflow-y-auto">
            {selected && (
              <ApplicationForm
                key={selected._id || "new"}
                data={selected}
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

// Form component
interface ApplicationFormProps {
  data: ApplicationFormData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function ApplicationForm({ data, onSuccess, onCancel }: ApplicationFormProps) {
  const isEdit = !!data._id;
  const [form, setForm] = useState<ApplicationFormData>(data);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && data._id) {
        await axiosInstance.put(`/job-applications/${data._id}`, form);
        toast.success("Application updated!");
      } else {
        await axiosInstance.post(`/job-applications`, form);
        toast.success("Application submitted!");
      }
      onSuccess?.();
    } catch {
      toast.error("Failed to save application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 w-[400px]">
      <input
        type="text"
        name="jobId"
        value={form.jobId}
        onChange={handleChange}
        placeholder="Job ID"
        className="w-full border px-3 py-2 rounded-md"
        required
      />
      <textarea
        name="coverLetter"
        value={form.coverLetter ?? ""}
        onChange={handleChange}
        placeholder="Cover Letter (optional)"
        className="w-full border px-3 py-2 rounded-md"
        rows={4}
      />
      <input
        type="text"
        name="resumeUrl"
        value={form.resumeUrl ?? ""}
        onChange={handleChange}
        placeholder="Resume URL (optional)"
        className="w-full border px-3 py-2 rounded-md"
      />

      <div className="flex gap-2 mt-2">
        <PrimaryButton type="submit" isLoading={loading}>
          {isEdit ? "Update" : "Submit"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
      </div>
    </form>
  );
}
