import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Settings,
  LogOut,
  Trophy,
  Users,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export const Navbar: React.FC = () => {
  const { user, logout, userDetails } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const navItems = [
    { path: "/", icon: Home, label: t("nav.home") },
    { path: "/lobby", icon: Users, label: t("nav.lobby") },
    { path: "/statistics", icon: BarChart3, label: t("nav.statistics") },
    { path: "/profile", icon: User, label: t("nav.profile") },
    { path: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  const isActive = (path: string) => location.pathname === path;

  const avatarUrl = useQuery(api.files.getAvatarUrl, {
    fileId: userDetails?.avatar as Id<"_storage">,
  });

  return (
    <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-white font-bold text-xl"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <span className="hidden sm:block">MyPok'Coeur</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {!userDetails ? (
              <>
                {/* Accueil */}
                <Link
                  to="/"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden lg:block">{t("nav.home")}</span>
                </Link>
                {/* Connexion */}
                <Link
                  to="/auth"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:block">{t("sign_in")}</span>
                </Link>
                {/* Sélecteur de langue */}
                <div className="ml-4">
                  <button
                    onClick={() => i18n.changeLanguage("fr")}
                    className="text-white/70 hover:text-white px-2"
                  >
                    FR
                  </button>
                  <span className="text-white/40">|</span>
                  <button
                    onClick={() => i18n.changeLanguage("en")}
                    className="text-white/70 hover:text-white px-2"
                  >
                    EN
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Navigation complète */}
                <div className="hidden md:flex items-center space-x-6">
                  {navItems.map(({ path, icon: Icon, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive(path)
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden lg:block">{label}</span>
                    </Link>
                  ))}
                </div>
                {/* Infos utilisateur et sélecteur de langue */}
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center space-x-2">
                    {userDetails?.avatar && (
                      <img
                        src={avatarUrl || "/assets/default-avatar.png"}
                        alt={userDetails.username}
                        className="w-8 h-8 rounded-full border-2 border-white/20"
                      />
                    )}
                    <span className="text-white font-medium hidden lg:block">
                      {userDetails?.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Sélecteur de langue */}
                  <div className="ml-4">
                    <button
                      onClick={() => i18n.changeLanguage("fr")}
                      className="text-white/70 hover:text-white px-2"
                    >
                      FR
                    </button>
                    <span className="text-white/40">|</span>
                    <button
                      onClick={() => i18n.changeLanguage("en")}
                      className="text-white/70 hover:text-white px-2"
                    >
                      EN
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
