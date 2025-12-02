"use client";

import { DropDownInput, PasswordInput, TextInput } from "@/components/ui";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAuthStore } from "@/store/authStore";
import { Building, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const Register: React.FC = () => {
  const { register } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "candidate" as "candidate" | "recruiter",
    companyName: "",
    companyWebsite: "",
    position: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (formData.role === "recruiter" && !formData.companyName.trim())
      newErrors.companyName = "Company name is required for recruiters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        companyName: formData.companyName || undefined,
        companyWebsite: formData.companyWebsite || undefined,
        position: formData.position || undefined,
      });

      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <DropDownInput
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { label: "Job Seeker", value: "candidate" },
                { label: "Recruiter", value: "recruiter" },
              ]}
              error={errors.role}
            />

            <div className="grid grid-cols-2 gap-4">
              <TextInput
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                icon={User}
                error={errors.firstName}
              />
              <TextInput
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                icon={User}
                error={errors.lastName}
              />
            </div>

            <TextInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              icon={Mail}
              error={errors.email}
            />

            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              error={errors.password}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
            />

            {formData.role === "recruiter" && (
              <>
                <TextInput
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  icon={Building}
                  error={errors.companyName}
                />
                <TextInput
                  id="companyWebsite"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="Company Website"
                  icon={Building}
                  error={errors.companyWebsite}
                />
                <TextInput
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Your Position (Optional)"
                />
              </>
            )}
          </div>

          <PrimaryButton type="submit" isLoading={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </PrimaryButton>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
