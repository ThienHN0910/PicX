import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";

export default function GoogleAuthSuccess() {
    const navigate = useNavigate();
    const setUser = useStore(state => state.setUser);
    const fetchAndSetUser = useStore(state => state.fetchAndSetUser);

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
            fetch("https://localhost:7162/api/auth/oauth/google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ code }),
            })
                .then((res) => res.json())
                .then(async (data) => {
                    if (data.token) {
                        localStorage.setItem("authToken", data.token);
                        await fetchAndSetUser();
                        navigate("/");
                    } else {
                        setUser(null);
                        navigate("/login?error=oauth_failed");
                    }
                });
        } else {
            setUser(null);
            navigate("/login?error=missing_code");
        }
        // eslint-disable-next-line
    }, []);

    return <div>Đang xác minh từ Google...</div>;
}
