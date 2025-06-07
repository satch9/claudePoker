import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Users, Trophy, DollarSign } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center py-12 px-4 md:px-8">
        <motion.div
          className="max-w-xl mb-10 md:mb-0 md:mr-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {t("home_title")}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            {t("home_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {!isLoading && !user ? (
              <Link
                to="/auth"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition duration-200"
              >
                {t("get_started")} <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link
                to="/lobby"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition duration-200"
              >
                {t("play_now")} <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            )}
            <Link
              to="/lobby"
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition duration-200"
            >
              {t("join_game")}
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="max-w-xs w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute -z-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <img
              src="https://images.pexels.com/photos/6664193/pexels-photo-6664193.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Poker cards and chips"
              className="rounded-lg shadow-xl w-full"
            />
          </div>
        </motion.div>
      </section>

      <section className="bg-gray-800 py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white">
            {t("why_play_with_us")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="bg-emerald-500/20 p-3 rounded-full mb-4">
                <Users className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("multiplayer_experience")}
              </h3>
              <p className="text-gray-300">
                {t("multiplayer_experience_desc")}
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="bg-emerald-500/20 p-3 rounded-full mb-4">
                <Trophy className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("official_rules")}
              </h3>
              <p className="text-gray-300">{t("official_rules_desc")}</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="bg-emerald-500/20 p-3 rounded-full mb-4">
                <DollarSign className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("fun_money")}</h3>
              <p className="text-gray-300">{t("fun_money_desc")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
