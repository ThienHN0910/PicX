export const getGoogleOAuthURL = () => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: "https://localhost:5173/google-auth-success",
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };

    const qs = new URLSearchParams(options).toString();
    return `${rootUrl}?${qs}`;
};
