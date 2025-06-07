import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { User } from "../types/game";

interface AuthContextType {
  user: User | null;
  userDetails: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string,
    avatar: File | null
  ) => Promise<User>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userDetails: null,
  login: async () => {},
  logout: () => {},
  register: async () => {
    throw new Error("Not implemented");
  },
  updateUser: async () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const registerAction = useAction(api.authActions.register);
  const loginAction = useAction(api.authActions.login);
  const updateUserMutation = useMutation(api.users.updateUser);

  useEffect(() => {
    const storedUser = localStorage.getItem("poker-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { id } = await loginAction({ email, password });
      setUser({ _id: id } as User);
      localStorage.setItem("poker-user", JSON.stringify({ _id: id }));
    } catch (error) {
      throw new Error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    avatar: File | null
  ) => {
    setIsLoading(true);
    try {
      const { id } = await registerAction({
        username,
        email,
        password,
        avatar: avatar ? avatar.name : undefined,
      });
      setUser({ _id: id } as User);
      localStorage.setItem("poker-user", JSON.stringify({ _id: id }));
      return { _id: id } as User;
    } catch (error) {
      throw new Error("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await updateUserMutation({
        id: user._id,
        patch: updates,
      });

      setUser(updatedUser);
      localStorage.setItem("poker-user", JSON.stringify(updatedUser));
    } catch (error) {
      throw new Error("Erreur lors de la mise à jour");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("poker-user");
  };

  // Récupère les infos enrichies
  const userData = useQuery(
    api.users.getUserById,
    user?._id ? { id: user._id } : "skip"
  );

  useEffect(() => {
    setUserDetails(userData || null);
  }, [userData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userDetails,
        login,
        logout,
        register,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
