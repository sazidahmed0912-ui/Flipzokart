import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
    length?: number;
    value: string[];
    onChange: (otp: string[]) => void;
    disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({ length = 6, value, onChange, disabled }) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, length);
    }, [length]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value;
        if (isNaN(Number(val))) return;

        const newOtp = [...value];
        // Take the last character if user types in a filled field
        newOtp[index] = val.substring(val.length - 1);
        onChange(newOtp);

        // Move to next input if value is entered
        if (val && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!value[index] && index > 0) {
                // If current is empty, delete previous and move focus
                const newOtp = [...value];
                newOtp[index - 1] = '';
                onChange(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else {
                // If current is not empty, it just deletes the value (default behavior), 
                // but we might want to manually clear it if default behavior isn't enough or for control
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (!pastedData) return;

        const newOtp = [...value];
        const pasteItems = pastedData.slice(0, length).split('');

        pasteItems.forEach((char, i) => {
            // Assuming we start pasting from index 0 or the focused index? 
            // Usually paste fills from the start or focused index. 
            // Let's implement filling from the first empty slot or just overwrite all if focusing the first one.
            // Simplest user expectation: Paste full OTP -> fills all.
            if (!isNaN(Number(char))) {
                newOtp[i] = char;
            }
        });

        onChange(newOtp);

        // Focus the box after the last pasted character
        const nextIndex = Math.min(pasteItems.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
    };

    return (
        <div className="flex justify-center items-center gap-1.5 sm:gap-2 w-full">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index]}
                    onChange={e => handleChange(e, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-9 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 border border-[#d1d5db] rounded-[8px] text-center text-lg font-semibold bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1 min-w-0 max-w-[50px]"
                />
            ))}
        </div>
    );
};
