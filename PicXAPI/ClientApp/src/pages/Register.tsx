import React, { useState } from "react";
import { UserPlus, Check, X, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal } from "../components/ui/Modal";
import { getGoogleOAuthURL } from "../utils/googleOAuth";
import Loading from "../components/Loading";

type Errors = {
    email?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
};

type Touched = {
    email?: boolean;
    name?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
};

const validateEmail = (email: string): boolean => {
    email = email.trim();
    if (email.includes(' ')) return false;

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) return false;

    const [local, domain] = email.split('@');
    if (!local || !domain) return false;
    if (local.startsWith('.') || local.endsWith('.')) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    if (local.includes('..') || domain.includes('..')) return false;
    if (domain.length > 255 || local.length > 64) return false;

    const domainParts = domain.split('.');
    if (domainParts.some(part => part.startsWith('-') || part.endsWith('-'))) return false;

    const tld = domainParts[domainParts.length - 1];
    if (!/^[a-zA-Z]{0,}$/.test(tld)) return false;

    return true;
};

const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
    };
};

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
    const [showTerms, setShowTerms] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<Errors>({});
    const [touched, setTouched] = useState<Touched>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    if (isSubmitting) {
        return <Loading message="Registering account..." />;
    }

    const validateField = (
        field: keyof Errors,
        value: string
    ) => {
        const fieldErrors: Errors = {};

        switch (field) {
            case "email":
                if (!value) {
                    fieldErrors.email = "Email is required";
                } else if (!validateEmail(value)) {
                    fieldErrors.email = "Invalid email";
                }
                break;

            case "name":
                if (!value) {
                    fieldErrors.name = "Name is required";
                } else if (value.length < 4) {
                    fieldErrors.name = "Name must be at least 4 characters";
                }
                break;

            case "password":
                if (!value) {
                    fieldErrors.password = "Password is required";
                } else {
                    const validation = validatePassword(value);
                    if (!validation.minLength) {
                        fieldErrors.password = "Password must be at least 8 characters";
                    } else if (!validation.hasUpperCase) {
                        fieldErrors.password = "Password must contain at least 1 uppercase letter";
                    } else if (!validation.hasLowerCase) {
                        fieldErrors.password = "Password must contain at least 1 lowercase letter";
                    } else if (!validation.hasNumbers) {
                        fieldErrors.password = "Password must contain at least 1 number";
                    } else if (!validation.hasSpecialChar) {
                        fieldErrors.password = "Password must contain at least 1 special character";
                    }
                }
                break;

            case "confirmPassword":
                if (!value) {
                    fieldErrors.confirmPassword = "Confirm password is required";
                } else if (value !== password) {
                    fieldErrors.confirmPassword = "Passwords do not match";
                }
                break;

            default:
                break;
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: fieldErrors[field],
        }));
    };

    const handleBlur = (field: keyof Errors) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        validateField(field, {
            email,
            name,
            password,
            confirmPassword,
        }[field] ?? "");
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (touched.email) {
            validateField("email", value);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        if (touched.name) {
            validateField("name", value);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (touched.password) {
            validateField("password", value);
        }
        if (confirmPassword && touched.confirmPassword) {
            validateField("confirmPassword", confirmPassword);
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (touched.confirmPassword) {
            validateField("confirmPassword", value);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        // Synchronously validate all fields
        const newErrors: Errors = {};
        if (!email) newErrors.email = "Email is required";
        else if (!validateEmail(email)) newErrors.email = "Invalid email";

        if (!name) newErrors.name = "Name is required";
        else if (name.length < 4) newErrors.name = "Name must be at least 4 characters";

        if (!password) newErrors.password = "Password is required";
        else {
            const validation = validatePassword(password);
            if (!validation.minLength) newErrors.password = "Password must be at least 8 characters";
            else if (!validation.hasUpperCase) newErrors.password = "Password must contain at least 1 uppercase letter";
            else if (!validation.hasLowerCase) newErrors.password = "Password must contain at least 1 lowercase letter";
            else if (!validation.hasNumbers) newErrors.password = "Password must contain at least 1 number";
            else if (!validation.hasSpecialChar) newErrors.password = "Password must contain at least 1 special character";
        }

        if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required";
        else if (confirmPassword !== password) newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        setTouched({
            email: true,
            name: true,
            password: true,
            confirmPassword: true,
        });

        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fix the errors before continuing");
            setIsSubmitting(false);
            return;
        }

        if (!acceptTerms) {
            toast.error("You need to agree to the terms and conditions!");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Email: email,
                    Name: name,
                    Password: password,
                }),

            });

            let data: { message?: string } = {};

            try {
                if (response.status !== 204) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        data = await response.json();
                    } else {
                        const text = await response.text();
                        data = { message: text };
                    }
                }
            } catch {
                data = { message: "Lỗi xử lý phản hồi từ máy chủ" };
            }

            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);
            console.log("Data:", data);
            if (response.ok) {
                toast.success(data?.message || "Registration successful");
                localStorage.setItem("unverifiedEmail", email);
                navigate("/verify-email");
            } else {
                switch (response.status) {
                    case 409:
                        toast.error("Email already exists in the system");
                        break;
                    case 400:
                        toast.error(data?.message || "Invalid registration information");
                        break;
                    case 500:
                        toast.error("Server error, please try again later");
                        break;
                    default:
                        toast.error(data?.message || "Registration failed");
                }
            }


            
        } catch (networkError) {
            toast.error("Cannot connect to server, please check your network connection");
            console.error("Network error:", networkError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleRegister = () => {
        window.location.href = getGoogleOAuthURL();
    };

    const PasswordRequirements: React.FC<{ password: string; show: boolean }> = ({ password, show }) => {
        if (!show || !password) return null;

        const requirements = validatePassword(password);

        return (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                <div className="space-y-1">
                    {[
                        { key: "minLength", text: "At least 8 characters", met: requirements.minLength },
                        { key: "hasUpperCase", text: "At least 1 uppercase letter (A-Z)", met: requirements.hasUpperCase },
                        { key: "hasLowerCase", text: "At least 1 lowercase letter (a-z)", met: requirements.hasLowerCase },
                        { key: "hasNumbers", text: "At least 1 number (0-9)", met: requirements.hasNumbers },
                        { key: "hasSpecialChar", text: "At least 1 special character (!@#$%^&*)", met: requirements.hasSpecialChar },
                    ].map((req) => (
                        <div key={req.key} className="flex items-center gap-2">
                            {req.met ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <X className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm ${req.met ? "text-green-600" : "text-red-600"}`}>
                                {req.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getFieldStatus = (
        field: keyof Errors,
        value: string
    ): "default" | "error" | "success" => {
        if (!touched[field]) return "default";
        if (errors[field]) return "error";
        if (value && !errors[field]) return "success";
        return "default";
    };

    const getFieldClasses = (status: "default" | "error" | "success"): string => {
        const baseClasses =
            "mt-1 block w-full rounded-md border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";

        switch (status) {
            case "error":
                return `${baseClasses} border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500`;
            case "success":
                return `${baseClasses} border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500`;
            default:
                return `${baseClasses} border-gray-300 focus:border-indigo-500 focus:ring-indigo-500`;
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
                <UserPlus className="h-12 w-12 text-[#10d194] mx-auto" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="mt-2 text-gray-600">Join our art marketplace</p>
            </div>

            {/* Social Register Buttons */}
            <div className="space-y-3 mb-6">
                <button
                    onClick={handleGoogleRegister}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.20-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Sign up with Google
                </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or create account with email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={() => handleBlur('email')}
                            className={getFieldClasses(getFieldStatus('email', email))}
                            placeholder="Enter your email"
                            required
                        />
                        {getFieldStatus('email', email) === 'success' && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                        {getFieldStatus('email', email) === 'error' && (
                            <X className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                        )}
                    </div>
                    {touched.email && errors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <X className="w-4 h-4" />
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            onBlur={() => handleBlur('name')}
                            className={getFieldClasses(getFieldStatus('name', name))}
                            placeholder="Enter your full name"
                            required
                        />
                        {getFieldStatus('name', name) === 'success' && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                        {getFieldStatus('name', name) === 'error' && (
                            <X className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                        )}
                    </div>
                    {touched.name && errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <X className="w-4 h-4" />
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={() => handleBlur('password')}
                            className={getFieldClasses(getFieldStatus('password', password))}
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {touched.password && errors.password && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <X className="w-4 h-4" />
                            {errors.password}
                        </p>
                    )}
                    <PasswordRequirements password={password} show={touched.password || password.length > 0} />
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            onBlur={() => handleBlur('confirmPassword')}
                            className={getFieldClasses(getFieldStatus('confirmPassword', confirmPassword))}
                            placeholder="Confirm your password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <X className="w-4 h-4" />
                            {errors.confirmPassword}
                        </p>
                    )}
                    {confirmPassword && password && confirmPassword === password && (
                        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Passwords match
                        </p>
                    )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="terms"
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="ml-3 text-sm text-gray-600">
                        I agree to the{' '}
                        <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-[#10d194] hover:text-[#1a9f8e] underline"
                        >
                            terms and conditions
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!acceptTerms}
                    className={`w-full text-white py-2 px-4 rounded-md focus:outline-none
                    ${acceptTerms
                            ? 'bg-[linear-gradient(180deg,_rgb(66,230,149),_rgb(59,178,184),_rgb(66,230,149))] bg-[length:100%_200%] bg-top hover:bg-bottom transition-all duration-500 ease-in-out active:scale-90'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    Create Account
                </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="px-2 bg-white text-[#10d194] hover:text-[#1a9f8e] cursor-pointer">
                    Sign in here
                </Link>
            </p>

            <Modal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
                title="Terms and Conditions for PicX Service Usage"
            >
                <div className="prose prose-sm max-w-none">
                    <p className="font-medium">By creating an account, you agree to the following terms:</p>

                    <h3 className="text-lg font-semibold mt-4">Information Commitment</h3>
                    <p>You confirm that the personal information provided is accurate and complete. Providing false information may result in account suspension or service denial.</p>

                    <h3 className="text-lg font-semibold mt-4">Content Ownership</h3>
                    <p>All images and data you upload to PicX must be legally owned by you. PicX is not responsible for content uploaded by users.</p>

                    <h3 className="text-lg font-semibold mt-4">Legal Usage</h3>
                    <p>You agree not to use PicX services for illegal activities, including but not limited to distributing pornographic, harmful, racist content or infringing on others' privacy rights.</p>

                    <h3 className="text-lg font-semibold mt-4">Account Security</h3>
                    <p>You are responsible for securing your account and are liable for all activities conducted through that account.</p>

                    <h3 className="text-lg font-semibold mt-4">Personal Data Processing</h3>
                    <p>Your personal information is collected and processed according to PicX's Privacy Policy. We commit not to share your information with third parties without permission.</p>

                    <h3 className="text-lg font-semibold mt-4">Service Termination</h3>
                    <p>PicX reserves the right to suspend or terminate user accounts if they violate terms of use or negatively impact the community.</p>
                </div>
            </Modal>
        </div>
    );
};

export default Register;
