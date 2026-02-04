import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
    name: string;
    email: string;
    age: string;
    height: string; // cm
    weight: string; // kg
    gender: 'Male' | 'Female' | 'Other';
    goalCalories: string;
    macroSplit: {
        protein: string; // percentage
        carbs: string;
        fats: string;
    };
    hasCompletedOnboarding: boolean;
}

const defaultData: UserData = {
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    gender: 'Male',
    goalCalories: '2000',
    macroSplit: { protein: '30', carbs: '40', fats: '30' },
    hasCompletedOnboarding: false,
};

interface UserDataContextType {
    userData: UserData;
    updateUserData: (data: Partial<UserData>) => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
    isLoading: boolean;
}

const UserContext = createContext<UserDataContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [userData, setUserData] = useState<UserData>(defaultData);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const stored = await AsyncStorage.getItem('userData');
            if (stored) {
                setUserData(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load user data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const saveData = async (data: UserData) => {
        try {
            await AsyncStorage.setItem('userData', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save user data', e);
        }
    };

    const updateUserData = (data: Partial<UserData>) => {
        setUserData(prev => {
            const newData = { ...prev, ...data };
            saveData(newData);
            return newData;
        });
    };

    const completeOnboarding = () => {
        updateUserData({ hasCompletedOnboarding: true });
    };

    const resetOnboarding = () => { // For debugging/demo purposes
        setUserData(defaultData);
        saveData(defaultData);
    };

    return (
        <UserContext.Provider value={{ userData, updateUserData, completeOnboarding, resetOnboarding, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
