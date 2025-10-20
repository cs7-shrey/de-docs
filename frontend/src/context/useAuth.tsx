"use client"
import { checkAuth } from "@/lib/api-client";
import { createContext, useEffect, useState } from "react";

interface User {
    name: string;
    email: string;
    id: string;
}

interface AuthContextValues {
    user: User | null;
    isSignedIn: boolean;
    isFetching: boolean;
    isSyncing: boolean;
    setAuth: (user: User) => void;
    clearAuth: () => void;
    setIsSyncing: (syncing: boolean) => void;
}

export const authContext = createContext<AuthContextValues>({
    user: null,
    isSignedIn: false,
    isFetching: false,
    isSyncing: false,
    setAuth: () => {},
    clearAuth: () => {},
    setIsSyncing: (syncing: boolean) => {}
})

const AuthProvider = ({ children }: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const setAuth = (user: User) => {
        setUser(user);
        setIsSignedIn(true);
    }
    const clearAuth = () => {
        setUser(null);
        setIsSignedIn(false);
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                setIsFetching(true);
                const data = await checkAuth();
                console.log("Data received", data);

                setUser({
                    id: data.userId,
                    email: data.email,
                    name: data.name
                })
                setIsSignedIn(true);
                
            } catch (error) {
                setIsSignedIn(false); 
                console.error("Error verifying", error); 
            } finally {
                setIsFetching(false);
            }
        }

        getAndSetUser();
    }, [])

    return (
        <authContext.Provider value={{
            user,
            isSignedIn,
            isFetching,
            isSyncing,
            setAuth,
            clearAuth,
            setIsSyncing
        }}
        >
            {children}
        </authContext.Provider>
    )
}

export default AuthProvider;