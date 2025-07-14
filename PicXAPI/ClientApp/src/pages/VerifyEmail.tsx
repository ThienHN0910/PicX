import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();

    const email = localStorage.getItem('unverifiedEmail');

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return; // chỉ cho số
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // tự động chuyển sang ô tiếp theo
        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            setMessage('Vui lòng nhập đầy đủ 6 chữ số.');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            await axios.post('/api/email/verify-otp', {
                email,
                otp: fullOtp
            });

            setMessage('Xác thực thành công!');
            localStorage.removeItem('unverifiedEmail');
            setTimeout(() => navigate('/login'), 1500);
        } catch {
            setMessage('OTP không đúng hoặc đã hết hạn.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        try {
            await axios.post('/api/email/send-otp', email, {
                headers: { 'Content-Type': 'text/plain' }
            });
            setMessage('Mã OTP mới đã được gửi đến email.');
        } catch {
            setMessage('Gửi lại OTP thất bại.');
        }
    };
    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 mt-10">
            <h2 className="text-2xl font-bold text-center mb-4">Xác thực Email</h2>
            <p className="text-center text-sm text-gray-600 mb-6">
                Nhập mã OTP được gửi đến: <strong>{email}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={(el) => (inputsRef.current[index] = el)}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:border-[#10d194]"
                            disabled={isSubmitting}
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 text-white bg-[#10d194] hover:bg-[#0bb78d] rounded-md"
                >
                    {isSubmitting ? 'Đang xác thực...' : 'Xác thực'}
                </button>
            </form>

            <button
                onClick={handleResend}
                className="mt-4 w-full text-sm text-[#10d194] hover:underline"
                disabled={isSubmitting}
            >
                Gửi lại mã OTP
            </button>

            {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
        </div>
    );
};

export default VerifyEmail;

