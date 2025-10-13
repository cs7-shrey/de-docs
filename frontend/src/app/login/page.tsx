"use client";
import axiosInstance from "@/lib/api-client";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

export default function Login() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          console.log("herehehrehrehhre");
          console.log(credentialResponse);

          await axiosInstance.post('/users/auth/google/client-callback', credentialResponse);
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    </GoogleOAuthProvider>
  );
}
