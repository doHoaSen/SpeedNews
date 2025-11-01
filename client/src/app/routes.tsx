import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import FeedPage from "../pages/FeedPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import AccountPage from "../pages/AccountPage";
import LogoutAction from "../pages/LogoutAction";
import type { News } from "../features/news/api/useFeed";
import RequestResetPage from "../pages/RequestResetPage.tsx";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import DeleteAccountPage from "../pages/DeleteAccountPage/index.tsx";

type AppRoutesProps = {
  initialItems: News[];
};

export default function AppRoutes({ initialItems }: AppRoutesProps) {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* ✅ FeedPage에 초기 데이터 전달 */}
        <Route path="/" element={<FeedPage initialItems={initialItems} />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/logout" element={<LogoutAction />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/request-reset" element={<RequestResetPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />}/>
        <Route path = "/delete-account" element= {<DeleteAccountPage />} />
      </Route>
    </Routes>
  );
}
