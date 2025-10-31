"use client";
import { authContext } from "@/context/useAuth";
import axiosInstance from "@/lib/api-client";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useContext } from "react";

const CtaButton = () => {
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
  const { user, isSyncing, setIsSyncing, setAuth } = useContext(authContext);
  const redirect = useParams().redirect as string | undefined;

  if (user) {
    return (
      <button
        className="group sm:min-w-32 md:min-w-48 lg:min-w-52 inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold text-white transition-all duration-300 ease-in-out bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg hover:shadow-xl"
        onClick={() => router.push("/docs")}
      >
        <span>Start creating</span>
        <ArrowRightIcon className="group-hover:translate-x-1 transition-all duration-300" />
      </button>
    );
  }

  if (isSyncing) {
    return (
      <div className="group sm:min-w-32 md:min-w-48 lg:min-w-52 inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold text-white bg-gray-900 rounded-lg">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="relative">
        {/* Your custom button (visual only) */}
        <button
          className="group sm:min-w-32 md:min-w-48 lg:min-w-52 inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold text-white transition-all duration-300 ease-in-out bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg hover:shadow-xl pointer-events-none"
        >
          <span>Start creating</span>
          <ArrowRightIcon className="group-hover:translate-x-1 transition-all duration-300" />
        </button>
        
        {/* Hidden Google Login that receives clicks */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 cursor-pointer">
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
                if (redirect) {
                  router.push(redirect);
                } else {
                  router.push("/docs");
                }
              } catch (error) {
                console.error(error);
              } finally {
                setIsSyncing(false);
              }
            }}
            onError={() => {
              // TODO: raise a toast
            }}
            width="300"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default CtaButton;