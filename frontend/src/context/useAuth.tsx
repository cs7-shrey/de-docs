"use client"
import { checkAuth } from "@/lib/api-client";
import { createContext, useEffect, useState } from "react";

interface User {
    email: string;
    id: string;
}
interface AuthContextValues {
    user: User | null
    isSignedIn: boolean
    signingIn: boolean
    setAuth: (user: User) => void;
    clearAuth: () => void;
}

export const authContext = createContext<AuthContextValues>({
    user: null,
    isSignedIn: false,
    signingIn: false,
    setAuth: () => {},
    clearAuth: () => {},
})

const AuthProvider = ({ children }: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [signingIn, setSigningIn] = useState(false);
    
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
                setSigningIn(true);
                const data = await checkAuth();
                console.log(data);

                setUser({
                    id: data.userId,
                    email: data.email
                })
                setIsSignedIn(true);
                
            } catch (error) {
                setIsSignedIn(false); 
                console.error("Error verifying", error); 
            } finally {
                setSigningIn(false);
            }
        }

        getAndSetUser();
    }, [])
    return (
        <authContext.Provider value={{
            user,
            isSignedIn,
            signingIn,
            setAuth,
            clearAuth
        }}
        >
            {children}
        </authContext.Provider>
    )
}

export default AuthProvider;