"use client";
import React, { useContext, useState } from "react";
import Logo from "./logo";
import {
  GoogleLogin,
  googleLogout,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import axiosInstance, { logoutReq } from "@/lib/api-client";
import { authContext } from "@/context/useAuth";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const Navbar = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
  const [isSyncing, setIsSyncing] = useState(false);

  const { setAuth, isSignedIn, clearAuth, signingIn } = useContext(authContext);

  const logout = async () => {
    try {
      setIsSyncing(true);

      googleLogout();
      await logoutReq();
      clearAuth();

    } catch (error) {
      console.error(error); 
    } finally {
      setIsSyncing(false);
    }
  };
  return (
    <div className="flex top-4 px-4 py-2 justify-between w-full bg-white rounded-lg">
      <div className="flex items-center font-bold">
        <Logo size={30} />
        <div className="text-xl">De-docs</div>
      </div>
      <div>
        {(signingIn || isSyncing) ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="animate-spin" />
          </div>
        ) : !isSignedIn ? (
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                console.log(credentialResponse);
                try {
                  setIsSyncing(true);
                  const response = await axiosInstance.post(
                    "/users/auth/google/client-callback",
                    credentialResponse
                  );
                  setAuth({
                    id: response.data.userId,
                    email: response.data.email,
                  });
                } catch (error) {
                  console.error(error); 
                } finally {
                  setIsSyncing(false);
                }

              }}
              onError={() => {
                console.log("Login Failed");
              }}
              shape="circle"
              theme="outline"
              text="signin"
            />
          </GoogleOAuthProvider>
        ) : (
          <Button onClick={logout}>Logout</Button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
