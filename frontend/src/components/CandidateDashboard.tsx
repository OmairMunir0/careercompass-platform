"use client";

import { useAuthStore } from "@/store/authStore";
import { Heart, LucideIcon, MessageSquare, Search, User, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { TextInput, TextAreaInput, PrimaryButton } from "@/components/ui";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface StatCard {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

interface ActionCard {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

const CandidateDashboard = () => {
  const { user } = useAuthStore();
  if (!user) return null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      toast.success("Message sent successfully");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // --- Static demo stats (replace with API data later)
  const stats: StatCard[] = [
    {
      label: "Job Applications",
      value: 12,
      icon: Search,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Saved Jobs",
      value: 8,
      icon: Heart,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Messages",
      value: 3,
      icon: MessageSquare,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Profile Views",
      value: 24,
      icon: User,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  // --- Quick actions
  const actions: ActionCard[] = [
    {
      title: "Browse Jobs",
      description: "Find your perfect opportunity",
      icon: Search,
      href: "/find-jobs",
    },
    {
      title: "Saved Jobs",
      description: "Review your saved positions",
      icon: Heart,
      href: "/saved-jobs",
    },
    {
      title: "Update Profile",
      description: "Keep your profile current",
      icon: User,
      href: "/profile",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
        <p className="text-purple-100">Ready to find your next opportunity? Let's get started.</p>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className={`p-2 rounded-lg ${color.split(" ")[0]}`}>
              <Icon className={`h-6 w-6 ${color.split(" ")[1]}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div> */}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map(({ title, description, icon: Icon, href }) => (
          <Link
            key={title}
            href={href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
              <Icon className="h-8 w-8 text-purple-600" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Contact</h2>
          <p className="text-gray-600 mb-6">Reach out for support or inquiries.</p>
          <div className="flex items-center gap-6 mb-6 text-gray-700">
            <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-purple-600" /><span>l226910@lhr.nu.edu.pk</span></div>
            <div className="flex items-center gap-2"><Phone className="h-5 w-5 text-purple-600" /><span>+92 3213232323</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-purple-600" /><span>Lahore, Pakistan</span></div>
          </div>
          <form onSubmit={handleContactSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput name="name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your Name" required />
              <TextInput name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required />
            </div>
            <TextAreaInput name="message" value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Message" rows={5} required />
            <PrimaryButton type="submit" isLoading={sending} className="mt-2">Send Message</PrimaryButton>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-0 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900">Location</h2>
            <p className="text-gray-600 mb-4">Find us on the map.</p>
          </div>
          <div className="w-full h-[320px]">
            <iframe
              title="SkillSeeker Location"
              src="https://www.google.com/maps?q=Lahore,+Pakistan&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <footer className="mt-12 bg-gray-100 rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-gray-700">© {new Date().getFullYear()} SkillSeeker. All rights reserved.</div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-purple-700">Privacy</Link>
            <Link href="/terms" className="hover:text-purple-700">Terms</Link>
            <Link href="/contact" className="hover:text-purple-700">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CandidateDashboard;
