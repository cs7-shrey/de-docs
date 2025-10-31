"use client";
import React, { useContext } from "react";
import { motion } from "motion/react";
import Logo from "./logo";
import {
  GoogleLogin,
  googleLogout,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import axiosInstance, { logoutReq } from "@/lib/api-client";
import { authContext } from "@/context/useAuth";
import { Loader2 } from "lucide-react";

const Navbar = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

  const { setAuth, isSyncing, setIsSyncing, isSignedIn, clearAuth, isFetching } =
    useContext(authContext);

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
    <div className="flex justify-between w-full rounded-lg">
      <div className="flex items-center font-bold">
        <Logo size={30} />
        <div className="text-xl">De-docs</div>
      </div>
      <div id="google-login-div-dedocs">
        {isFetching || isSyncing ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="animate-spin" size={20}/>
          </div>
        ) : !isSignedIn ? (
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  console.log(credentialResponse);
                  setIsSyncing(true);
                  const response = await axiosInstance.post(
                    "/users/auth/google/client-callback",
                    credentialResponse
                  );
                  setAuth({
                    id: response.data.userId,
                    email: response.data.email,
                    name: response.data.name,
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
          <div onClick={logout} className="relative hover:cursor-pointer"
          >
            Logout
            <motion.div 
              className="w-full h-1 absolute bottom-[-8] bg-black"
              initial={{width: "0"}}
              transition={{type: "spring"}}
            >
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
