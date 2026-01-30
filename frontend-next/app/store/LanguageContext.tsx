"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'bn' | 'as' | 'hi';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
    en: {
        'my_profile': 'My Profile',
        'orders': 'Orders',
        'wishlist': 'Wishlist',
        'coupons': 'Coupons',
        'sell_on_fzokart': 'Sell on Fzokart',
        'account_security': 'Account Security',
        'address_book': 'Address Book',
        'languages': 'Languages',
        'help_center': 'Help Center',
        'logout': 'Logout',
        'hello': 'Hello',
        'select_language': 'Select Language',
        'save_changes': 'Save Changes',
        'manage_addresses': 'Manage Addresses',
        'login_security': 'Login & Security'
    },
    bn: {
        'my_profile': 'আমার প্রোফাইল',
        'orders': 'অর্ডার',
        'wishlist': 'উুইশলিস্ট',
        'coupons': 'কুপন',
        'sell_on_fzokart': 'ফ্লিপজকার্টে বিক্রি করুন',
        'account_security': 'অ্যাকাউন্ট নিরাপত্তা',
        'address_book': 'ঠিকানা বই',
        'languages': 'ভাষা',
        'help_center': 'সহায়তা কেন্দ্র',
        'logout': 'লগআউট',
        'hello': 'হ্যালো',
        'select_language': 'ভাষা নির্বাচন করুন',
        'save_changes': 'পরিবর্তন সেভ করুন',
        'manage_addresses': 'ঠিকানা ব্যবস্থাপনা',
        'login_security': 'লগইন এবং নিরাপত্তা'
    },
    as: {
        'my_profile': 'মোৰ প্ৰফাইল',
        'orders': 'অৰ্ডাৰসমূহ',
        'wishlist': 'উইশলিষ্ট',
        'coupons': 'কুপন',
        'sell_on_fzokart': 'ফ্লিপজকার্টত বিক্ৰী কৰক',
        'account_security': 'একাউণ্ট সুৰক্ষা',
        'address_book': 'ঠিকনা',
        'languages': 'ভাষা',
        'help_center': 'সহায় কেন্দ্ৰ',
        'logout': 'লগআউট',
        'hello': 'নমস্কাৰ',
        'select_language': 'ভাষা নিৰ্বাচন কৰক',
        'save_changes': 'পৰিৱৰ্তন সংৰক্ষণ কৰক',
        'manage_addresses': 'ঠিকনা পৰিচালনা',
        'login_security': 'লগইন আৰু সুৰক্ষা'
    },
    hi: {
        'my_profile': 'मेरा प्रोफाइल',
        'orders': 'ऑर्डर',
        'wishlist': 'विशलिस्ट',
        'coupons': 'कूपन',
        'sell_on_fzokart': 'फ्लिपजोकार्ट पर बेचें',
        'account_security': 'खाता सुरक्षा',
        'address_book': 'पते',
        'languages': 'भाषा',
        'help_center': 'सहायता केंद्र',
        'logout': 'लॉग आउट',
        'hello': 'नमस्ते',
        'select_language': 'भाषा चुनें',
        'save_changes': 'बदलाव सहेजें',
        'manage_addresses': 'पते प्रबंधित करें',
        'login_security': 'लॉगिन और सुरक्षा'
    }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('app_language');
        if (saved) {
            setLanguage(saved as Language);
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('app_language', language);
        }
    }, [language, isInitialized]);

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations['en']] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
