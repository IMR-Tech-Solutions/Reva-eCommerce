import { useState } from "react";
import { useSearchParams } from "react-router";
import { loginService, registerService } from "../../services/authservices";
import { requestPasswordResetService, confirmPasswordResetService } from "../../services/resetpasswordservices";
import { setEcommerceTokens, removeEcommerceTokens } from "../../authentication/auth";
import api from "../../services/baseapi";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  address: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  address?: string;
}

function Accounts() {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
    state: "",
    city: "",
    postal_code: "",
    address: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [forgotStep, setForgotStep] = useState<"none" | "request" | "confirm">("none");
  const [forgotData, setForgotData] = useState({
    email: "",
    token: "",
    new_password: "",
    confirm_password: "",
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!isLoginMode) {
      if (!formData.name.trim()) newErrors.name = "Full name is required";
      else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) newErrors.phone = "Enter a valid phone number";

      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.email.trim()) newErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      if (isLoginMode) {
        const data = await loginService({
          email: formData.email,
          password: formData.password,
        });
        setEcommerceTokens({ access: data.access, refresh: data.refresh });

        // Enforce Customer role (Block Admin Role ID 1)
        try {
          const userRes = await api.get("me/");
          if (Number(userRes.data.role_id) === 1) {
            removeEcommerceTokens();
            setIsLoading(false);
            setErrors({ email: "Admins must login via the administrative dashboard." });
            return;
          }
          toast.success("Login successful");
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 2000);
        } catch (err) {
          toast.success("Login successful");
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 2000);
        }
      } else {
        // Split name into first and last name
        const names = formData.name.trim().split(" ");
        const first_name = names[0];
        const last_name = names.length > 1 ? names.slice(1).join(" ") : "";

        await registerService({
          email: formData.email,
          password: formData.password,
          first_name,
          last_name: last_name || "User", // fallback just in case
          mobile_number: formData.phone,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          postal_code: formData.postal_code,
          address: formData.address,
        });

        toast.success("Account created successfully. Please login.");
        // Page refresh as requested, will default back to login mode
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      setIsLoading(false);
      let errorMessage = "Authentication failed. Please try again.";
      if (error.response?.data) {
        const data = error.response.data;
        if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else {
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMessage = `${data[firstKey][0]}`;
          } else if (firstKey && typeof data[firstKey] === 'string') {
            errorMessage = data[firstKey];
          }
        }
      }
      setErrors((prev) => ({ ...prev, email: errorMessage }));
      console.error("Auth error", error, error.response?.data);
    }
  };

  const handleForgotDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForgotData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestResetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotData.email.trim()) {
      setErrors({ email: "Email address is required" });
      return;
    }
    setIsLoading(true);
    try {
      await requestPasswordResetService(forgotData.email);
      toast.success("Security code sent! Please check your email.");
      setForgotStep("confirm");
      setErrors({});
    } catch (error: any) {
      let errorMessage = "Failed to send reset code.";
      if (error.response?.data?.error) errorMessage = error.response.data.error;
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotData.token) {
      toast.error("Please enter the security code!");
      return;
    }
    if (forgotData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (forgotData.new_password !== forgotData.confirm_password) {
      toast.error("New passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordResetService({
        email: forgotData.email,
        token: forgotData.token,
        new_password: forgotData.new_password,
      });
      toast.success("Password reset successfully! Please login.");
      setForgotStep("none");
      setForgotData({ email: "", token: "", new_password: "", confirm_password: "" });
    } catch (error: any) {
      let errorMessage = "Failed to reset password.";
      if (error.response?.data?.error) errorMessage = error.response.data.error;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    "w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm placeholder-[var(--color-gray-light)] text-[var(--color-secondary)] outline-none transition-all";
  const inputNormal =
    "border-gray-200 bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";
  const inputError =
    "border-[var(--color-error)] bg-red-50 focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/20";

  const getInputClass = (field: keyof FormErrors, withPR = false) =>
    `${inputBase} ${errors[field] ? inputError : inputNormal} ${withPR ? "pr-10" : ""}`;

  // ── Reusable Components ──
  const ErrorMsg = ({ msg }: { msg: string }) => (
    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--color-error)" }}>
      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );

  const FieldIcon = ({ children }: { children: React.ReactNode }) => (
    <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-gray-light)" }}>
      {children}
    </span>
  );

  const Label = ({ text }: { text: string }) => (
    <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-gray-dark)" }}>
      {text}
    </label>
  );

  // ── SVG Eye Icons ──
  const EyeOpenIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeClosedIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.06-3.476M6.93 6.93A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.972 9.972 0 01-4.138 5.273M3 3l18 18" />
    </svg>
  );

  const TogglePasswordBtn = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
    >
      {show ? <EyeClosedIcon /> : <EyeOpenIcon />}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-lg">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 shadow-md"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-secondary)" }}>
            {forgotStep !== "none" ? "Reset your password" : isLoginMode ? "Sign in to your account" : "Create Account"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-gray)" }}>
            {forgotStep !== "none" ? "Follow the steps to regain access" : isLoginMode ? "Enter your credentials to continue" : "Join and start shopping today"}
          </p>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {forgotStep === "request" && (
            <form onSubmit={handleRequestResetToken} noValidate>
              <div className="mb-5">
                <Label text="Email Address" />
                <div className="relative">
                  <FieldIcon>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </FieldIcon>
                  <input type="email" name="email" value={forgotData.email}
                    onChange={handleForgotDataChange} placeholder="Enter registered email"
                    className={getInputClass("email")} />
                </div>
                {errors.email && <ErrorMsg msg={errors.email} />}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full font-bold py-3 rounded-lg text-sm sm:text-base disabled:opacity-60 flex items-center justify-center gap-2 transition-colors mt-2"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-secondary)" }}
              >
                {isLoading ? "Sending..." : "Request OTP Code"}
              </button>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => { setForgotStep("none"); setErrors({}); }} className="text-sm text-gray-500 hover:text-gray-800 underline">
                  Back to login
                </button>
              </div>
            </form>
          )}

          {forgotStep === "confirm" && (
            <form onSubmit={handleConfirmPasswordReset} noValidate>
              <p className="text-sm text-[#CC9200] font-bold bg-[#CC9200]/10 p-3 rounded-lg mb-4 text-center">
                OTP sent to {forgotData.email}
              </p>
              <div className="mb-5">
                <Label text="Enter OTP Code" />
                <input type="text" name="token" value={forgotData.token}
                  onChange={handleForgotDataChange} placeholder="XXXXXX"
                  className={`${inputBase} ${inputNormal} text-center tracking-widest font-bold text-lg`} />
              </div>
              <div className="mb-5">
                <Label text="New Password" />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="new_password"
                    value={forgotData.new_password} onChange={handleForgotDataChange}
                    placeholder="Min. 6 chars"
                    className={getInputClass("password", true)} />
                  <TogglePasswordBtn show={showPassword} onToggle={() => setShowPassword(v => !v)} />
                </div>
              </div>
              <div className="mb-5">
                <Label text="Confirm New Password" />
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirm_password"
                    value={forgotData.confirm_password} onChange={handleForgotDataChange}
                    placeholder="Repeat new"
                    className={getInputClass("password", true)} />
                  <TogglePasswordBtn show={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full font-bold py-3 rounded-lg text-sm sm:text-base disabled:opacity-60 flex items-center justify-center gap-2 transition-colors mt-2"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-secondary)" }}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => { setForgotStep("none"); setErrors({}); }} className="text-sm text-gray-500 hover:text-gray-800 underline">
                  Back to login
                </button>
              </div>
            </form>
          )}

          {forgotStep === "none" && (
            <form onSubmit={handleSubmit} noValidate>

              {/* ── SIGN UP ONLY FIELDS ── */}
              {!isLoginMode && (
                <>
                  {/* Full Name */}
                  <div className="mb-5">
                    <Label text="Full Name" />
                    <div className="relative">
                      <FieldIcon>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </FieldIcon>
                      <input type="text" name="name" value={formData.name}
                        onChange={handleChange} placeholder="John Doe"
                        className={getInputClass("name")} />
                    </div>
                    {errors.name && <ErrorMsg msg={errors.name} />}
                  </div>
                </>
              )}

              {/* ── Email ── */}
              <div className="mb-5">
                <Label text="Email Address" />
                <div className="relative">
                  <FieldIcon>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </FieldIcon>
                  <input type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="john@example.com"
                    className={getInputClass("email")} />
                </div>
                {errors.email && <ErrorMsg msg={errors.email} />}
              </div>

              {/* ── Phone (Sign Up only) ── */}
              {!isLoginMode && (
                <div className="mb-5">
                  <Label text="Phone Number" />
                  <div className="relative">
                    <FieldIcon>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </FieldIcon>
                    <input type="tel" name="phone" value={formData.phone}
                      onChange={handleChange} placeholder="+91 98765 43210"
                      className={getInputClass("phone")} />
                  </div>
                  {errors.phone && <ErrorMsg msg={errors.phone} />}
                </div>
              )}

              {/* ── Password ── */}
              <div className="mb-5">
                <div className="flex justify-between mb-1.5">
                  <Label text="Password" />
                  {isLoginMode && (
                    <button type="button" onClick={() => { setForgotStep("request"); setErrors({}); }} className="text-xs font-semibold cursor-pointer hover:underline"
                      style={{ color: "var(--color-primary-dark)" }}>
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <FieldIcon>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </FieldIcon>
                  <input type={showPassword ? "text" : "password"} name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={getInputClass("password", true)} />
                  <TogglePasswordBtn show={showPassword} onToggle={() => setShowPassword(v => !v)} />
                </div>
                {errors.password && <ErrorMsg msg={errors.password} />}
              </div>

              {/* ── Confirm Password (Sign Up only) ── */}
              {!isLoginMode && (
                <div className="mb-5">
                  <Label text="Confirm Password" />
                  <div className="relative">
                    <FieldIcon>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </FieldIcon>
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                      value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Re-enter your password"
                      className={getInputClass("confirmPassword", true)} />
                    <TogglePasswordBtn show={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} />
                  </div>
                  {errors.confirmPassword && <ErrorMsg msg={errors.confirmPassword} />}
                </div>
              )}

              {/* ── ADDRESS FIELDS (Sign Up only) ── */}
              {!isLoginMode && (
                <>
                  {/* Divider */}
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs font-semibold tracking-wide uppercase"
                      style={{ color: "var(--color-gray-light)" }}>
                      Address Details (Optional)
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  {/* Full Address — full width */}
                  <div className="mb-5">
                    <Label text="Full Address" />
                    <div className="relative">
                      <FieldIcon>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </FieldIcon>
                      <input type="text" name="address" value={formData.address}
                        onChange={handleChange} placeholder="123, Street Name, Area"
                        className={getInputClass("address")} />
                    </div>
                    {errors.address && <ErrorMsg msg={errors.address} />}
                  </div>

                  {/* Country + State — 2 col on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <Label text="Country" />
                      <div className="relative">
                        <FieldIcon>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </FieldIcon>
                        <input type="text" name="country" value={formData.country}
                          onChange={handleChange} placeholder="India"
                          className={getInputClass("country")} />
                      </div>
                      {errors.country && <ErrorMsg msg={errors.country} />}
                    </div>

                    <div>
                      <Label text="State" />
                      <div className="relative">
                        <FieldIcon>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </FieldIcon>
                        <input type="text" name="state" value={formData.state}
                          onChange={handleChange} placeholder="Maharashtra"
                          className={getInputClass("state")} />
                      </div>
                      {errors.state && <ErrorMsg msg={errors.state} />}
                    </div>
                  </div>

                  {/* City + Postal Code — 2 col on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <Label text="City" />
                      <div className="relative">
                        <FieldIcon>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </FieldIcon>
                        <input type="text" name="city" value={formData.city}
                          onChange={handleChange} placeholder="Pune"
                          className={getInputClass("city")} />
                      </div>
                      {errors.city && <ErrorMsg msg={errors.city} />}
                    </div>

                    <div>
                      <Label text="Postal Code" />
                      <div className="relative">
                        <FieldIcon>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        </FieldIcon>
                        <input type="text" name="postal_code" value={formData.postal_code}
                          onChange={handleChange} placeholder="411001"
                          className={getInputClass("postal_code")} />
                      </div>
                      {errors.postal_code && <ErrorMsg msg={errors.postal_code} />}
                    </div>
                  </div>


                </>
              )}

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full font-bold py-3 rounded-lg text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors mt-2"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-light)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary)")}
                onMouseDown={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-dark)")}
                onMouseUp={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-light)")}
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isLoginMode ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  isLoginMode ? "Sign In" : "Create Account"
                )}
              </button>

            </form>
          )}

          {forgotStep === "none" && (
            <>
              {/* ── Divider ── */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs" style={{ color: "var(--color-gray-light)" }}>
                  {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* ── Toggle ── */}
              <button
                onClick={() => { setIsLoginMode(!isLoginMode); setErrors({}); }}
                className="w-full border border-gray-200 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: "var(--color-gray-dark)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.color = "var(--color-gray-dark)";
                }}
              >
                {isLoginMode ? "Sign Up Now" : "Sign In Instead"}
              </button>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-xs mt-6" style={{ color: "var(--color-gray-light)" }}>
          By {isLoginMode ? "signing in" : "creating an account"}, you agree to our{" "}
          <span className="cursor-pointer hover:underline" style={{ color: "var(--color-primary-dark)" }}>
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="cursor-pointer hover:underline" style={{ color: "var(--color-primary-dark)" }}>
            Privacy Policy
          </span>.
        </p>
      </div>
    </div>
  );
}

export default Accounts;
