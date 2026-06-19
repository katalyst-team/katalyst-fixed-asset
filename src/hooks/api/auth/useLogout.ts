import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { clearAuthTokens } from "@/lib/authTokens";
import { useKbmGradeStore } from "@/modules/dashboard/kbm-grade/store/KbmGradeStore";

const useLogout = () => {
  const router = useRouter();
  const resetKbmGradeStore = useKbmGradeStore((state) => state.resetStore);

  const logout = () => {
    clearAuthTokens();
    resetKbmGradeStore();

    // Show success message
    toast.success("Logged out successfully");

    // Redirect to login page
    router.push("/");
  };

  return logout;
};

export default useLogout;
