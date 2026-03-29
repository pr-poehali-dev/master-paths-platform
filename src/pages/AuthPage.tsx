import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

type AuthMode = "login" | "register" | "forgot";

const OWNER_EMAIL = "owner@master-putey.ru";
const OWNER_PASS = "MasterPath2026!";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const validate = () => {
    if (!email.trim()) { setError("Введите email"); return false; }
    if (!email.includes("@")) { setError("Некорректный email"); return false; }
    if (mode !== "forgot" && password.length < 4) { setError("Пароль должен быть не менее 4 символов"); return false; }
    if (mode === "register" && !name.trim()) { setError("Введите ваше имя"); return false; }
    return true;
  };

  const handleSubmit = () => {
    setError("");
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "forgot") {
        setSuccess(true);
        return;
      }
      if (mode === "register") {
        setRegisterSuccess(true);
        setTimeout(() => {
          setRegisterSuccess(false);
          navigate("/participant");
        }, 1500);
        return;
      }
      // Вход
      if (email === OWNER_EMAIL && password === OWNER_PASS) {
        navigate("/");
      } else if (email && password.length >= 4) {
        // Любой участник
        navigate("/participant");
      } else {
        setError("Неверный email или пароль");
      }
    }, 900);
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError("");
    setPassword("");
    setEmail("");
    setName("");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4" style={{ background: "hsl(var(--abyss))" }}>
      <div className="starfield" />

      <div className="relative z-10 w-full max-w-md">
        {/* Логотип */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-float"
            style={{ background: "linear-gradient(135deg, hsl(265 55% 25%), hsl(225 55% 20%))", border: "1px solid hsl(43 85% 58% / 0.3)", boxShadow: "0 0 30px hsl(43 85% 55% / 0.2)" }}>
            <span className="text-3xl" style={{ filter: "drop-shadow(0 0 10px hsl(43 85% 58% / 0.8))" }}>✦</span>
          </div>
          <h1 className="font-cormorant text-4xl font-bold" style={{ color: "hsl(43 85% 65%)", letterSpacing: "0.06em" }}>Мастер Путей</h1>
          <p className="text-sm mt-1" style={{ color: "hsl(220 20% 40%)", letterSpacing: "0.12em" }}>ПЛАТФОРМА КВЕСТОВ</p>
        </div>

        {/* Карточка */}
        <div className="mystic-card rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(43 85% 58% / 0.15)", boxShadow: "0 0 60px hsl(265 55% 10% / 0.6)" }}>
          {mode !== "forgot" && (
            <div className="flex border-b" style={{ borderColor: "hsl(260 25% 18%)" }}>
              {(["login", "register"] as AuthMode[]).map(m => (
                <button key={m} onClick={() => switchMode(m)}
                  className="flex-1 py-4 text-sm font-golos font-medium transition-all relative"
                  style={{ color: mode === m ? "hsl(43 85% 65%)" : "hsl(220 20% 45%)", background: mode === m ? "hsl(260 40% 12%)" : "transparent" }}>
                  {m === "login" ? "Войти" : "Регистрация"}
                  {mode === m && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, hsl(43 85% 58%), transparent)" }} />}
                </button>
              ))}
            </div>
          )}

          <div className="p-8">
            <h2 className="font-cormorant text-2xl font-bold mb-6" style={{ color: "hsl(45 80% 82%)" }}>
              {mode === "login" ? "Вход в систему" : mode === "register" ? "Создать аккаунт" : "Восстановление пароля"}
            </h2>

            {/* Успех — восстановление */}
            {success && mode === "forgot" && (
              <div className="text-center py-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "hsl(43 40% 14%)", border: "1px solid hsl(43 60% 25%)" }}>
                  <Icon name="Mail" size={24} style={{ color: "hsl(43 85% 60%)" }} />
                </div>
                <p className="font-cormorant text-lg mb-2" style={{ color: "hsl(45 80% 82%)" }}>Письмо отправлено</p>
                <p className="text-sm mb-6" style={{ color: "hsl(220 20% 50%)" }}>Проверьте почту {email}</p>
                <button onClick={() => { setMode("login"); setSuccess(false); setEmail(""); }} className="text-sm font-golos" style={{ color: "hsl(43 85% 58%)" }}>
                  Вернуться ко входу
                </button>
              </div>
            )}

            {/* Успех — регистрация */}
            {registerSuccess && (
              <div className="text-center py-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "hsl(43 40% 14%)", border: "1px solid hsl(43 60% 25%)" }}>
                  <Icon name="CheckCircle" size={28} style={{ color: "hsl(43 85% 60%)" }} />
                </div>
                <p className="font-cormorant text-xl mb-2" style={{ color: "hsl(45 80% 82%)" }}>Добро пожаловать, {name}!</p>
                <p className="text-sm" style={{ color: "hsl(220 20% 50%)" }}>Входим в кабинет участника...</p>
              </div>
            )}

            {!success && !registerSuccess && (
              <div className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>Имя</label>
                    <div className="relative">
                      <Icon name="User" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "hsl(260 30% 45%)" }} />
                      <input value={name} onChange={e => { setName(e.target.value); setError(""); }} placeholder="Ваше имя"
                        className="mystic-input w-full pl-10 pr-4 py-3 rounded-xl text-sm font-golos" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>Email</label>
                  <div className="relative">
                    <Icon name="Mail" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "hsl(260 30% 45%)" }} />
                    <input value={email} onChange={e => { setEmail(e.target.value); setError(""); }} type="email" placeholder="email@mail.ru"
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      className="mystic-input w-full pl-10 pr-4 py-3 rounded-xl text-sm font-golos" />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div>
                    <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>Пароль</label>
                    <div className="relative">
                      <Icon name="Lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "hsl(260 30% 45%)" }} />
                      <input value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                        type={showPass ? "text" : "password"} placeholder="••••••••"
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                        className="mystic-input w-full pl-10 pr-11 py-3 rounded-xl text-sm font-golos" />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "hsl(260 30% 45%)" }}>
                        <Icon name={showPass ? "EyeOff" : "Eye"} size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Ошибка */}
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl animate-fade-in" style={{ background: "hsl(0 30% 14%)", border: "1px solid hsl(0 40% 25%)" }}>
                    <Icon name="AlertCircle" size={14} style={{ color: "#f87171" }} />
                    <p className="text-sm font-golos" style={{ color: "#f87171" }}>{error}</p>
                  </div>
                )}

                <button onClick={handleSubmit} disabled={loading}
                  className="w-full btn-gold py-3.5 rounded-xl font-cormorant font-semibold text-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "hsl(230 35% 15%) hsl(230 35% 15%) hsl(230 35% 15%) transparent" }} />
                      <span>Подождите...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "login" ? "Войти" : mode === "register" ? "Создать аккаунт" : "Восстановить пароль"}</span>
                      <Icon name="ChevronRight" size={16} />
                    </>
                  )}
                </button>

                {mode === "login" && (
                  <div className="text-center">
                    <button onClick={() => switchMode("forgot")} className="text-xs font-golos" style={{ color: "hsl(220 20% 40%)" }}>
                      Забыли пароль?
                    </button>
                  </div>
                )}
                {mode === "forgot" && (
                  <div className="text-center">
                    <button onClick={() => switchMode("login")} className="flex items-center gap-1 text-xs font-golos mx-auto" style={{ color: "hsl(220 20% 40%)" }}>
                      <Icon name="ArrowLeft" size={12} /> Вернуться ко входу
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Подсказка */}
        <div className="mt-6 mystic-card rounded-xl p-4" style={{ border: "1px solid hsl(43 85% 58% / 0.1)" }}>
          <p className="text-xs font-golos text-center mb-2" style={{ color: "hsl(220 20% 35%)" }}>Данные доступа владельца платформы</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-xs font-mono" style={{ color: "hsl(260 40% 55%)" }}>owner@master-putey.ru</span>
            <span className="text-xs font-mono" style={{ color: "hsl(43 70% 50%)" }}>MasterPath2026!</span>
          </div>
          <p className="text-xs font-golos text-center mt-2" style={{ color: "hsl(220 20% 28%)" }}>Любой другой email — вход как участник</p>
        </div>
      </div>
    </div>
  );
}
