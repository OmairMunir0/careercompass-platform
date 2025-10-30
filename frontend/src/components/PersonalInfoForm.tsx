"use client";

import React from "react";
import type { Profile as ProfileType } from "@/lib/schema.type";

interface Props {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const PersonalInfoForm: React.FC<Props> = ({ personalInfo, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            name="firstName"
            value={personalInfo.firstName}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            name="lastName"
            value={personalInfo.lastName}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            name="email"
            value={personalInfo.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            name="phone"
            value={personalInfo.phone}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            name="location"
            value={personalInfo.location}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            name="bio"
            value={personalInfo.bio}
            onChange={onChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
