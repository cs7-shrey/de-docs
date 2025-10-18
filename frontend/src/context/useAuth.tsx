"use client"
import { checkAuth } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

interface User {
    name: string;
    email: string;
    id: string;
}

interface AuthContextValues {
    user: User | null
    isSignedIn: boolean
    isChecking: boolean
    setAuth: (user: User) => void;
    clearAuth: () => void;
}

export const authContext = createContext<AuthContextValues>({
    user: null,
    isSignedIn: false,
    isChecking: false,
    setAuth: () => {},
    clearAuth: () => {},
})

const AuthProvider = ({ children }: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    
    const setAuth = (user: User) => {
        setUser(user);
        setIsSignedIn(true);
    }
    const clearAuth = () => {
        setUser(null);
        setIsSignedIn(false);
    }

    const router = useRouter();

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                setIsChecking(true);
                const data = await checkAuth();
                console.log(data);

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
                setIsChecking(false);
            }
        }

        getAndSetUser();
    }, [])

    // TODO: remove this later and use local storage auth details set by the middleware
    if(isChecking) {
        return (
            <div className="absolute flex items-center justify-center inset-0 z-40 w-full">
                <Loader2 className="animate-spin" /> 
            </div>
        )
    }

    return (
        <authContext.Provider value={{
            user,
            isSignedIn,
            isChecking,
            setAuth,
            clearAuth
        }}
        >
            {children}
        </authContext.Provider>
    )
}

export default AuthProvider;