import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    User,
    Package,
    Heart,
    Tag,
    Store,
    ShieldCheck,
    MapPin,
    HelpCircle,
    Globe,
    LogOut,
    ChevronRight,
    Check
} from 'lucide-react';
import { useApp } from '../../store/Context';
import { useLanguage } from '../../store/LanguageContext';
import Modal from '../../pages/CheckoutPage/components/Modal'; // Resusing existing Modal

const ProfileSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useApp();
    const { t, language, setLanguage } = useLanguage();
    const [isLangModalOpen, setLangModalOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const menuItems = [
        { key: "my_profile", path: "/profile", icon: User },
        { key: "orders", path: "/orders", icon: Package },
        { key: "wishlist", path: "/wishlist", icon: Heart },
        { key: "coupons", path: "/coupons", icon: Tag },
        { key: "sell_on_fzokart", path: "/sell", icon: Store },
        { key: "account_security", path: "/account-security", icon: ShieldCheck },
        { key: "address_book", path: "/address-book", icon: MapPin },
        // "Languages" inserted here in UI logic
        { key: "help_center", path: "/help-center", icon: HelpCircle },
    ];

    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'bn', name: 'Bengali', native: 'বাংলা' },
        { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    ];

    return (
    return (
        <div className="w-full lg:w-[280px] flex-shrink-0 space-y-4">
            {/* User Hello Card - Desktop Only (Mobile has header in main content) */}
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-4 hidden lg:flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f0f5ff] flex items-center justify-center border border-[#e0e0e0] overflow-hidden">
                    {user?.avatar ? (
                        <img src={user.avatar.startsWith('http') ? user.avatar : `/${user.avatar}`} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <img
                            src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-male_4811a1.svg"
                            alt="User"
                            className="w-8 h-8 opacity-80"
                        />
                    )}
                </div>
                <div>
                    <div className="text-xs text-gray-500 font-medium">{t('hello')},</div>
                    <div className="text-base font-bold text-[#1F2937]">{user?.name || "User"}</div>
                </div>
            </div>

            {/* Navigation Menu (Scrollable Tabs on Mobile) */}
            <div className="bg-white rounded-xl shadow-none lg:shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide py-2 lg:py-0 px-2 lg:px-0 gap-2 lg:gap-0">
                    {menuItems.map((item, i) => {
                        // Inject Language Option before Help Center
                        if (item.key === 'help_center') {
                            return (
                                <React.Fragment key="lang-fragment">
                                    <div
                                        onClick={() => setLangModalOpen(true)}
                                        className="flex items-center gap-2 lg:gap-4 px-4 lg:px-6 py-2.5 lg:py-4 cursor-pointer transition-all border border-gray-100 lg:border-0 lg:border-b lg:border-gray-50 flex-shrink-0 whitespace-nowrap text-gray-600 bg-white hover:bg-gray-50 rounded-full lg:rounded-none"
                                    >
                                        <Globe size={18} className="lg:w-5 lg:h-5 text-gray-400" />
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className="text-sm lg:text-base font-medium">{t('languages')}</span>
                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 hidden lg:block">
                                                {languages.find(l => l.code === language)?.native}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Render Help Center after */}
                                    <MenuItem
                                        item={item}
                                        isActive={location.pathname === item.path}
                                        onClick={handleNavigation}
                                        t={t}
                                    />
                                </React.Fragment>
                            );
                        }

                        return (
                            <MenuItem
                                key={i}
                                item={item}
                                isActive={location.pathname === item.path}
                                onClick={handleNavigation}
                                t={t}
                            />
                        );
                    })}
                </div>

                {/* Logout Button */}
                <div
                    onClick={handleLogout}
                    className="hidden lg:flex items-center gap-4 px-6 py-4 cursor-pointer text-gray-600 hover:bg-red-50 hover:text-red-600 border-t border-gray-100 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">{t('logout')}</span>
                </div>
            </div>

            {/* Language Modal */}
            <Modal isOpen={isLangModalOpen} onClose={() => setLangModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-6 text-gray-800">{t('select_language')}</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {languages.map(lang => (
                            <div
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code as any);
                                    setLangModalOpen(false);
                                }}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${language === lang.code ? 'border-[#2874F0] bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800">{lang.native}</span>
                                    <span className="text-sm text-gray-500">{lang.name}</span>
                                </div>
                                {language === lang.code && <CheckCircle className="text-[#2874F0]" size={20} />}
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Helper Sub-component
const MenuItem = ({ item, isActive, onClick, t }: any) => {
    const Icon = item.icon;
    return (
        <div
            onClick={() => onClick(item.path)}
            className={`flex items-center gap-2 lg:gap-4 px-4 lg:px-6 py-2.5 lg:py-4 cursor-pointer transition-all border lg:border-0 lg:border-b last:border-0 flex-shrink-0 whitespace-nowrap rounded-full lg:rounded-none
                ${isActive
                    ? "bg-[#2874F0] text-white border-[#2874F0] lg:bg-[#F5FAFF] lg:text-[#2874F0] lg:border-gray-50"
                    : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                }
            `}
        >
            <Icon size={18} className={`lg:w-5 lg:h-5 ${isActive ? "text-white lg:text-[#2874F0]" : "text-gray-400"}`} />
            <span className={`text-sm lg:text-base font-medium ${isActive ? 'font-bold' : ''}`}>{t(item.key)}</span>
            {isActive && <ChevronRight size={16} className="ml-auto text-[#2874F0] hidden lg:block" />}
        </div>
    )
}

const CheckCircle = ({ className, size }: any) => (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-[#2874F0] text-white ${className}`}>
        <Check size={14} strokeWidth={3} />
    </div>
)

export default ProfileSidebar;
