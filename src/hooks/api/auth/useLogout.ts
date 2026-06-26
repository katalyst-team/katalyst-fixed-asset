import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { clearAuthTokens } from "@/lib/authTokens";

const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    clearAuthTokens();

    toast.success("Logged out successfully");

    router.push("/");
  };

  return logout;
};

export default useLogout;
