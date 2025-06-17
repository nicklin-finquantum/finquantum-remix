import React, { createContext, useState, useContext } from 'react';

import type { User } from '~/models/UserModel';
import UserRole from '~/types/userRole';

// Define the context type
type UserContextType = {
  user: User | null;
  setUser: (user: User) => void;
};

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider: React.FC<{
  children: React.ReactNode;
  initialUser?: User | null;
}> = ({
  children,
  initialUser = null,
}) => {
  const [user, setUserState] = useState<User | null>(initialUser);
  const setUser = (user: User) => {
    const updatedUser = user
      ? { ...user, isAdmin: user.role === UserRole.SUPERADMIN }
      : null;
    setUserState(updatedUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
