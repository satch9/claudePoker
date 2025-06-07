import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "react-i18next";

type AuthMode = "login" | "register";

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const { t } = useTranslation();

  const { login, register } = useAuth();

  const generateUploadUrl = useMutation(api.auth.generateUploadUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        // 1. Obtenir une URL d'upload temporaire
        const postUrl = await generateUploadUrl();
        // 2. Uploader le fichier sur cette URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": avatar?.type || "",
          },
          body: avatar,
        });
        const { storageId: returnedStorageId } = await result.json();
        const storageId = returnedStorageId;

        const user = await register(username, email, password, storageId);
        console.log("user dans AuthPage :", user);
      }
      navigate("/lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md relative z-10 border border-gray-700"
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl text-white font-bold mb-2">
            {mode === "login" ? t("welcome_back") : t("create_account")}
          </h1>
          <p className="text-gray-400">
            {mode === "login"
              ? t("sign_in_to_continue")
              : t("register_to_join")}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                {t("username")}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-white p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder={t("enter_username")}
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-white p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              placeholder={t("enter_email")}
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-white p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              placeholder={t("enter_password")}
              required
            />
          </div>

          {mode === "register" && (
            <div className="mb-4">
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                {t("avatar")}
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                className="w-full text-white p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition duration-200"
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : mode === "login" ? (
              t("sign_in")
            ) : (
              t("create_account")
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {mode === "login" ? t("no_account") : t("already_have_account")}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="ml-2 text-emerald-500 hover:text-emerald-400 font-medium transition duration-200"
            >
              {mode === "login" ? t("register") : t("sign_in")}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
