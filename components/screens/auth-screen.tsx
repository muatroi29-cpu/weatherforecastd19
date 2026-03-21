"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { WeatherCard } from "@/components/weather-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cloud, User, Lock, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthScreenProps {
  onClose: () => void;
}

export function AuthScreen({ onClose }: AuthScreenProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Mật khẩu xác nhận không khớp");
          setIsLoading(false);
          return;
        }
        if (password.length < 4) {
          setError("Mật khẩu phải có ít nhất 4 ký tự");
          setIsLoading(false);
          return;
        }
        if (username.length < 3) {
          setError("Tên đăng nhập phải có ít nhất 3 ký tự");
          setIsLoading(false);
          return;
        }

        const success = await register(username, displayName || username, password);
        if (success) {
          setSuccess(true);
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setError("Tên đăng nhập đã tồn tại");
        }
      } else {
        const success = await login(username, password);
        if (success) {
          setSuccess(true);
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setError("Tên đăng nhập hoặc mật khẩu không đúng");
        }
      }
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setDisplayName("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    resetForm();
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
        <WeatherCard className="w-full max-w-md text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {mode === "login" ? "Đăng nhập thành công!" : "Đăng ký thành công!"}
          </h2>
          <p className="text-muted-foreground">Đang chuyển hướng...</p>
        </WeatherCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        <span>Quay lại</span>
      </button>

      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 shadow-lg">
          <Cloud className="text-primary-foreground" size={40} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Weather Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          {mode === "login" ? "Đăng nhập vào tài khoản" : "Tạo tài khoản mới"}
        </p>

        {/* Auth Form */}
        <WeatherCard className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên đăng nhập</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên hiển thị</label>
                <Input
                  type="text"
                  placeholder="Nhập tên hiển thị (tùy chọn)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                <XCircle size={16} />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : mode === "login" ? (
                "Đăng nhập"
              ) : (
                "Đăng ký"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="ml-1 text-primary font-medium hover:underline"
              >
                {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </p>
          </div>
        </WeatherCard>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center mt-6 max-w-md">
          Tài khoản được lưu trữ cục bộ trên thiết bị của bạn. 
          Không cần email để đăng ký.
        </p>
      </div>
    </div>
  );
}
