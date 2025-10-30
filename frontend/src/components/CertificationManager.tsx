"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Pen, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import CertificationForm, { Certification } from "./CertificationForm";
import { PrimaryButton, SecondaryButton } from "./ui";

export default function CertificationManager() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selected, setSelected] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get<Certification[]>("/user-certifications/me");
      setCertifications(data);
    } catch {
      toast.error("Failed to load certifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const handleSuccess = () => {
    setSelected(null);
    setIsDrawerOpen(false);
    fetchCertifications();
  };

  const handleAddNew = () => {
    setSelected({
      name: "",
      issuingOrganization: "",
      issueDate: "",
      expiryDate: null,
      credentialUrl: "",
    });
    setIsDrawerOpen(true);
  };

  const handleEdit = (cert: Certification) => {
    setSelected(cert);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this certification?")) return;

    try {
      await axiosInstance.delete(`/user-certifications/${id}`);
      toast.success("Certification deleted!");
      fetchCertifications();
    } catch {
      toast.error("Failed to delete certification.");
    }
  };

  return (
    <div className="p-2 text-gray-800 bg-white space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Certifications</h2>
        <PrimaryButton onClick={handleAddNew}>+ Add New</PrimaryButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[120px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : certifications.length === 0 ? (
        <p className="text-gray-600">No certifications added yet.</p>
      ) : (
        <ul className="space-y-3">
          {certifications.map((cert) => (
            <li
              key={cert.id}
              className="border border-gray-300 rounded-md p-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div className="cursor-pointer" onClick={() => handleEdit(cert)}>
                <div className="font-medium">{cert.name}</div>
                <div className="text-sm text-gray-700">{cert.issuingOrganization}</div>
                <div className="text-xs text-gray-500">
                  {cert.issueDate} → {cert.expiryDate ?? "Present"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(cert)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Pen className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cert.id)}
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
              <CertificationForm
                key={selected.id || "new"}
                certification={selected}
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
