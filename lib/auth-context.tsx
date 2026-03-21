"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserPreferences } from './types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, displayName: string, password: string) => Promise<boolean>;
  logout: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  notifications: true,
  favoriteLocations: ['Hà Nội'],
  theme: 'system'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('weather_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('weather_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('weather_users') || '[]');
    const foundUser = users.find((u: { username: string; password: string }) => 
      u.username === username && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('weather_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (username: string, displayName: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('weather_users') || '[]');
    
    if (users.some((u: { username: string }) => u.username === username)) {
      return false;
    }
    
    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      username,
      displayName,
      password,
      preferences: defaultPreferences,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('weather_users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('weather_user', JSON.stringify(userWithoutPassword));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('weather_user');
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences }
    };
    
    setUser(updatedUser);
    localStorage.setItem('weather_user', JSON.stringify(updatedUser));
    
    // Update in users list
    const users = JSON.parse(localStorage.getItem('weather_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], preferences: updatedUser.preferences };
      localStorage.setItem('weather_users', JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
