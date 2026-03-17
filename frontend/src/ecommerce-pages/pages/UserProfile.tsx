import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { User, Mail, Phone, MapPin, Camera, Lock, Check, Shield, Clock, Globe, Briefcase } from "lucide-react";
import api from "../../services/baseapi";
import { setUser } from "../../redux/userSlice";
import { updateUserDetails, getUserDetails } from "../../services/userdetailsservice";
import { requestPasswordResetService, confirmPasswordResetService } from "../../services/resetpasswordservices";
import { handleError } from "../../utils/handleError";

const UserProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: any) => state.user);

    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        country: "",
        state: "",
        city: "",
        postal_code: "",
        address: "",
    });

    const [resetStep, setResetStep] = useState<"request" | "confirm">("request");
    const [resetData, setResetData] = useState({
        token: "",
        new_password: "",
        confirm_password: "",
    });

    const fetchFullProfile = async () => {
        try {
            const data = await getUserDetails();
            setUserData(data);
            setFormData({
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                email: data.email || "",
                mobile_number: data.mobile_number || "",
                country: data.country || "",
                state: data.state || "",
                city: data.city || "",
                postal_code: data.postal_code || "",
                address: data.address || "",
            });
            if (data.user_image) {
                const imageUrl = data.user_image.startsWith('http') 
                    ? data.user_image 
                    : `${import.meta.env.VITE_API_IMG_URL}${data.user_image}`;
                setImagePreview(imageUrl);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
            // If it fails, we should at least stop showing only the spinner
            // but let's assume it works if the user is authenticated correctly
        }
    };

    useEffect(() => {
        fetchFullProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleResetDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setResetData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            const data = new FormData();
            data.append("user_image", file);
            try {
                setLoading(true);
                await updateUserDetails(data);
                const updatedUserRes = await api.get("me/");
                dispatch(setUser(updatedUserRes.data));
                toast.success("Profile picture updated!");
            } catch (err) {
                handleError(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const submissionData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== "email") {
                    submissionData.append(key, value);
                }
            });

            await updateUserDetails(submissionData);

            const updatedUserRes = await api.get("me/");
            dispatch(setUser(updatedUserRes.data));
            await fetchFullProfile();

            toast.success("Profile updated successfully!");
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestResetToken = async () => {
        setLoading(true);
        try {
            await requestPasswordResetService(userData.email);
            toast.success("Security code sent! Please check your email.");
            setResetStep("confirm");
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPasswordReset = async () => {
        if (!resetData.token) {
            toast.error("Please enter the security code!");
            return;
        }
        if (resetData.new_password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        if (resetData.new_password !== resetData.confirm_password) {
            toast.error("New passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            await confirmPasswordResetService({
                email: userData.email,
                token: resetData.token,
                new_password: resetData.new_password,
            });
            toast.success("Password reset successfully!");
            setResetStep("request");
            setResetData({ token: "", new_password: "", confirm_password: "" });
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    if (!userData) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CC9200]"></div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-[#1C1C1E] tracking-tight">Account Settings</h1>
                        <p className="text-gray-500 mt-2 font-medium">Manage your personal information and security preferences.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="bg-[#CC9200] hover:bg-[#B38000] text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-[#CC9200]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? "Saving..." : <><Check size={18} /> Save Settings</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Profile & Info */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Profile Identity Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CC9200]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />

                            <div className="relative">
                                <div className="w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-100">
                                    <div className="w-full h-full relative">
                                        <img
                                            src={imagePreview || "/images/user/default.png"}
                                            alt="User"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {loading && (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <label className="absolute -bottom-2 -right-2 p-3 bg-white text-[#CC9200] rounded-2xl shadow-xl hover:bg-[#CC9200] hover:text-white transition-all cursor-pointer border border-gray-50">
                                    <Camera size={20} strokeWidth={2.5} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>

                            <div className="flex-1">
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-700 text-xs font-black rounded-full uppercase tracking-wider mb-4 border border-green-100">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Verified
                                </span>
                                <h2 className="text-3xl font-extrabold text-[#1C1C1E]">{userData.first_name} {userData.last_name}</h2>
                                <p className="text-gray-400 font-medium mt-1 mb-6">{userData.email}</p>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                        <Briefcase size={16} className="text-[#CC9200]" />
                                        <span className="text-sm font-bold text-gray-700">{userData.role_name || user?.user_type_name || "Customer"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                        <Clock size={16} className="text-[#CC9200]" />
                                        <span className="text-sm font-bold text-gray-700">Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Editable Information */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-[#1C1C1E] mb-8 flex items-center gap-3">
                                <User size={24} className="text-[#CC9200]" /> Personal Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold text-[#1C1C1E]"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold text-[#1C1C1E]"
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="w-full px-6 py-4 bg-gray-100 border-gray-100 border-2 rounded-2xl text-gray-400 font-bold flex items-center gap-3 cursor-not-allowed">
                                        <Shield size={18} opacity={0.5} /> {userData.email}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input
                                            type="text"
                                            name="mobile_number"
                                            value={formData.mobile_number}
                                            onChange={handleInputChange}
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold text-[#1C1C1E]"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Details */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-[#1C1C1E] mb-8 flex items-center gap-3">
                                <MapPin size={24} className="text-[#CC9200]" /> Delivery Information
                            </h3>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold text-[#1C1C1E] resize-none"
                                        placeholder="Enter full address"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold text-[#1C1C1E]"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest ml-1">State / Province</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold text-[#1C1C1E]"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest ml-1">Country</label>
                                        <div className="relative">
                                            <Globe size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold text-[#1C1C1E]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest ml-1">Postal Code</label>
                                        <input
                                            type="text"
                                            name="postal_code"
                                            value={formData.postal_code}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold text-[#1C1C1E]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Security & Sidebar */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Password Change Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-[#1C1C1E] mb-8 flex items-center gap-3">
                                <Lock size={24} className="text-[#CC9200]" /> Password Security
                            </h3>

                            {resetStep === "request" ? (
                                <div className="space-y-6">
                                    <p className="text-sm font-medium text-gray-500 mb-4">
                                        Forgot your password or want to set a new one? We will send a secure OTP code to your registered email addressing finishing in <span className="font-bold text-[#1C1C1E]">{userData?.email?.split('@')[0].slice(-3)}@{userData?.email?.split('@')[1]}</span>.
                                    </p>
                                    <button
                                        onClick={handleRequestResetToken}
                                        disabled={loading}
                                        className="w-full py-5 bg-[#1C1C1E] px-2 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50 mt-4 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                                    >
                                        <Mail size={18} /> Request Security Code
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-xs font-bold text-[#CC9200] bg-[#CC9200]/10 p-3 rounded-xl border border-[#CC9200]/20 mb-4">
                                        A code has been sent to your email. Please enter it below along with your new password.
                                    </p>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Security Code (OTP)</label>
                                        <input
                                            type="text"
                                            name="token"
                                            value={resetData.token}
                                            onChange={handleResetDataChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold tracking-widest text-center text-lg"
                                            placeholder="XXXXXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                                        <input
                                            type="password"
                                            name="new_password"
                                            value={resetData.new_password}
                                            onChange={handleResetDataChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold"
                                            placeholder="Min. 6 chars"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={resetData.confirm_password}
                                            onChange={handleResetDataChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-gray-100 border-2 rounded-2xl focus:border-[#CC9200] focus:bg-white outline-none transition-all font-bold"
                                            placeholder="Repeat new"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => {
                                                setResetStep("request");
                                                setResetData({ token: "", new_password: "", confirm_password: "" });
                                            }}
                                            disabled={loading}
                                            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmPasswordReset}
                                            disabled={loading || !resetData.token || !resetData.new_password}
                                            className="flex-[2] py-4 bg-[#1C1C1E] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-black/10"
                                        >
                                            Reset Password
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Safety Insights */}
                        <div className="bg-[#1C1C1E] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#CC9200]" />
                            <h4 className="text-lg font-black mb-6 flex items-center gap-2">
                                <Shield size={18} className="text-[#CC9200]" /> Security Tip
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                Use a strong, unique password for your account. Enable two-factor authentication for maximum protection.
                            </p>
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[11px] text-[#CC9200] font-black uppercase tracking-widest">Account Status</p>
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                </div>
                                <p className="text-xs text-white font-black">ACTIVE & PROTECTED</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;