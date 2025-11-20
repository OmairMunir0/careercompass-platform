"use client";

import React, { useState } from "react";
import { apiRequest } from "@/lib/auth";

const ContactSection: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error">(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // Try hitting a generic contact endpoint. If backend doesn't have it,
      // the request will fail and we'll show an error.
      await apiRequest("/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, subject, message }),
      });
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Simple Google Maps embed that uses a query string. Replace the query
  // with your preferred location or coordinates.
  const mapQuery = encodeURIComponent("1600 Amphitheatre Parkway, Mountain View, CA");
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <div className="mt-12 bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Contact / Location</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              className="mt-1 block w-full border rounded-md p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full border rounded-md p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              className="mt-1 block w-full border rounded-md p-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              className="mt-1 block w-full border rounded-md p-2 min-h-[120px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
            {status === "success" && (
              <span className="text-green-600">Message sent — thanks!</span>
            )}
            {status === "error" && (
              <span className="text-red-600">Failed to send — try again later.</span>
            )}
          </div>
        </form>

        <div className="h-64 md:h-auto">
          <iframe
            title="Location map"
            src={mapSrc}
            width="100%"
            height="100%"
            className="rounded-md border-0"
            loading="lazy"
          />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500">Replace the embedded address with your desired location.</p>
    </div>
  );
};

export default ContactSection;
