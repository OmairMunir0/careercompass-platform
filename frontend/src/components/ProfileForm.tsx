"use client";

import { ISafeUser, UpdateMeDto, userService } from "@/services/userService";
import { useAuthStore } from "@/store/authStore";
import { Briefcase, Building, Clipboard, Mail, MapPin, Phone, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { PrimaryButton, SecondaryButton, TextAreaInput, TextInput } from "./ui";

const PersonalInfoForm: React.FC = () => {
  const storeUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const defaultInfo = {
    firstName: "",
    lastName: "",
    publicEmail: "",
    phone: "",
    location: "",
    bio: "",
    companyName: "",
    companyWebsite: "",
    position: "",
  };

  const [personalInfo, setPersonalInfo] =
    useState<Pick<ISafeUser, keyof typeof defaultInfo>>(defaultInfo);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = storeUser ?? (await userService.getMe()).data;
        setPersonalInfo({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          publicEmail: user.publicEmail || "",
          phone: user.phone || "",
          location: user.location || "",
          bio: user.bio || "",
          companyName: user.companyName || "",
          companyWebsite: user.companyWebsite || "",
          position: user.position || "",
        });
      } catch (err) {
        console.error("Failed to load user:", err);
        toast.error("Failed to load user information.");
      }
    };
    loadUser();
  }, [storeUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: UpdateMeDto = { ...personalInfo };
      const updatedUser = (await userService.updateMe(payload)).data as ISafeUser;
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update user information.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPersonalInfo(defaultInfo);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <TextInput
          id="firstName"
          name="firstName"
          placeholder="First Name"
          value={personalInfo.firstName}
          onChange={handleChange}
          icon={User}
        />

        <TextInput
          id="lastName"
          name="lastName"
          placeholder="Last Name"
          value={personalInfo.lastName}
          onChange={handleChange}
          icon={User}
        />

        <TextInput
          id="publicEmail"
          name="publicEmail"
          placeholder="Public Email"
          value={personalInfo.publicEmail || ""}
          onChange={handleChange}
          icon={Mail}
        />

        <TextInput
          id="phone"
          name="phone"
          placeholder="Phone"
          value={personalInfo.phone || ""}
          onChange={handleChange}
          icon={Phone}
        />

        <TextInput
          id="location"
          name="location"
          placeholder="Location"
          value={personalInfo.location || ""}
          onChange={handleChange}
          icon={MapPin}
        />

        <TextInput
          id="companyName"
          name="companyName"
          placeholder="Company Name"
          value={personalInfo.companyName || ""}
          onChange={handleChange}
          icon={Building}
        />

        <TextInput
          id="companyWebsite"
          name="companyWebsite"
          placeholder="Company Website"
          value={personalInfo.companyWebsite || ""}
          onChange={handleChange}
          icon={Clipboard}

        />

        <TextInput
          id="position"
          name="position"
          placeholder="Position"
          value={personalInfo.position || ""}
          onChange={handleChange}
          icon={Briefcase}
        />

        <TextAreaInput
          id="bio"
          name="bio"
          placeholder="Bio"
          value={personalInfo.bio || ""}
          onChange={handleChange}
          className="md:col-span-2"
        />
      </div>

      <div className="flex gap-4">
        <PrimaryButton onClick={handleSave} isLoading={loading}>
          Save
        </PrimaryButton>
        <SecondaryButton onClick={handleClear}>Clear Form</SecondaryButton>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
