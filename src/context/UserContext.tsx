import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface User {
  _id: string;
  nickName: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const usuarioGuardado = localStorage.getItem("usuario");

      return usuarioGuardado ? (JSON.parse(usuarioGuardado) as User) : null;
    } catch {
      localStorage.removeItem("usuario");
      return null;
    }
  });

  function setUser(usuario: User) {
    localStorage.setItem("usuario", JSON.stringify(usuario));
    setUserState(usuario);
  }

  function logout() {
    localStorage.removeItem("usuario");
    setUserState(null);
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser debe utilizarse dentro de UserProvider.");
  }

  return context;
}
