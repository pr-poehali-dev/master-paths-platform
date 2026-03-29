import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

type Tab = "sites" | "achievements" | "cabinet" | "chat";
type CabinetView = "main" | "editor" | "participants" | "invite" | "settings";

interface Site {
  id: string;
  name: string;
  key: string;
  endpoint: string;
  status: "online" | "offline" | "pending";
  offlineReason?: string;
  paths: number;
  participants: number;
  price: number;
  yoomoney: string;
}

interface Message {
  id: string;
  from: string;
  text: string;
  time: string;
  isOwner: boolean;
}

interface Achievement {
  id: string;
  participant: string;
  avatar: string;
  site: string;
  path: string;
  level: number;
  totalLevels: number;
  progress: number;
  lastActive: string;
}

const YOOMONEY_DEFAULT = "https://yoomoney.ru/to/410017253212598/0";

const INIT_SITES: Site[] = [
  { id: "1", name: "Тайны Старого Города", key: "mp_7f3k9d2x", endpoint: "https://oldcity.quest/api", status: "online", paths: 5, participants: 23, price: 299, yoomoney: YOOMONEY_DEFAULT },
  { id: "2", name: "Лабиринт Теней", key: "mp_4a8m1n6q", endpoint: "https://shadows.game/api", status: "offline", offlineReason: "Истёк срок токена", paths: 3, participants: 11, price: 199, yoomoney: YOOMONEY_DEFAULT },
  { id: "3", name: "Хроники Забытых", key: "mp_2b5p7r0w", endpoint: "https://forgotten.ru/api", status: "pending", paths: 7, participants: 0, price: 0, yoomoney: YOOMONEY_DEFAULT },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: "1", participant: "Алексей М.", avatar: "А", site: "Тайны Старого Города", path: "Путь Искателя", level: 4, totalLevels: 7, progress: 57, lastActive: "2 мин назад" },
  { id: "2", participant: "Мария В.", avatar: "М", site: "Лабиринт Теней", path: "Путь Теней", level: 2, totalLevels: 5, progress: 40, lastActive: "15 мин назад" },
  { id: "3", participant: "Дмитрий К.", avatar: "Д", site: "Тайны Старого Города", path: "Путь Мудреца", level: 7, totalLevels: 7, progress: 100, lastActive: "1 ч назад" },
  { id: "4", participant: "Елена П.", avatar: "Е", site: "Хроники Забытых", path: "Путь Странника", level: 1, totalLevels: 6, progress: 16, lastActive: "3 ч назад" },
];

const MOCK_MESSAGES: Message[] = [
  { id: "1", from: "Алексей М.", text: "Не могу понять подсказку на третьем уровне...", time: "14:22", isOwner: false },
  { id: "2", from: "Владелец", text: "Обратите внимание на надпись над воротами в описании", time: "14:25", isOwner: true },
  { id: "3", from: "Мария В.", text: "Когда откроется следующий Путь?", time: "15:10", isOwner: false },
  { id: "4", from: "Владелец", text: "На следующей неделе, следите за обновлениями!", time: "15:12", isOwner: true },
];

const PARTICIPANTS = [
  { name: "Алексей М.", email: "aleksey@mail.ru", phone: "+7 900 111-22-33", avatar: "А", role: "участник" },
  { name: "Мария В.", email: "maria@mail.ru", phone: "+7 900 444-55-66", avatar: "М", role: "участник" },
  { name: "Дмитрий К.", email: "dmitry@mail.ru", phone: "+7 900 777-88-99", avatar: "Д", role: "участник" },
  { name: "Елена П.", email: "elena@mail.ru", phone: "+7 900 000-11-22", avatar: "Е", role: "участник" },
];

export default function Index() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("sites");
  const [cabinetView, setCabinetView] = useState<CabinetView>("main");
  const [sites, setSites] = useState<Site[]>(INIT_SITES);

  // Интеграции
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [integrationMode, setIntegrationMode] = useState<"accept" | "add" | null>(null);
  const [acceptSubMode, setAcceptSubMode] = useState<"new" | "key" | null>(null);
  const [generatedKey] = useState("mp_" + Math.random().toString(36).substr(2, 8));
  const [inputKey, setInputKey] = useState("");
  const [manualForm, setManualForm] = useState({ name: "", key: "", endpoint: "", style: "", price: "0", yoomoney: YOOMONEY_DEFAULT });
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Настройка сайта
  const [settingsSite, setSettingsSite] = useState<Site | null>(null);
  const [editForm, setEditForm] = useState({ name: "", key: "", endpoint: "", price: "0", yoomoney: "" });
  const [deleteSite, setDeleteSite] = useState<Site | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Чат
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [activeChatUser, setActiveChatUser] = useState("Алексей М.");
  const [broadcastText, setBroadcastText] = useState("");
  const [showBroadcast, setShowBroadcast] = useState(false);

  // Участники
  const [editParticipant, setEditParticipant] = useState<typeof PARTICIPANTS[0] | null>(null);
  const [editPartForm, setEditPartForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", phone: "" });
  const [inviteSent, setInviteSent] = useState(false);
  const [participants, setParticipants] = useState(PARTICIPANTS);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(), from: "Владелец", text: chatInput,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }), isOwner: true,
    }]);
    setChatInput("");
  };

  const closeModal = () => {
    setShowIntegrationModal(false);
    setIntegrationMode(null);
    setAcceptSubMode(null);
    setSettingsSite(null);
    setShowDeleteConfirm(false);
    setDeleteSite(null);
    setSaveSuccess(false);
  };

  const openSettings = (site: Site) => {
    setSettingsSite(site);
    setEditForm({ name: site.name, key: site.key, endpoint: site.endpoint, price: String(site.price), yoomoney: site.yoomoney });
    setShowIntegrationModal(true);
  };

  const saveSettings = () => {
    if (!settingsSite) return;
    setSites(prev => prev.map(s => s.id === settingsSite.id ? {
      ...s, name: editForm.name, key: editForm.key, endpoint: editForm.endpoint,
      price: Number(editForm.price) || 0, yoomoney: editForm.yoomoney || YOOMONEY_DEFAULT
    } : s));
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); closeModal(); }, 1200);
  };

  const confirmDelete = () => {
    if (!deleteSite) return;
    setSites(prev => prev.filter(s => s.id !== deleteSite.id));
    closeModal();
  };

  const addSiteManually = () => {
    if (!manualForm.name || !manualForm.key) return;
    setSites(prev => [...prev, {
      id: Date.now().toString(), name: manualForm.name, key: manualForm.key,
      endpoint: manualForm.endpoint, status: "pending", paths: 0, participants: 0,
      price: Number(manualForm.price) || 0, yoomoney: manualForm.yoomoney || YOOMONEY_DEFAULT,
    }]);
    setManualForm({ name: "", key: "", endpoint: "", style: "", price: "0", yoomoney: YOOMONEY_DEFAULT });
    closeModal();
  };

  const copyKey = () => {
    navigator.clipboard?.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyPrompt = () => {
    const prompt = `Создай квест-сайт и подключи к платформе «Мастер Путей». Ключ интеграции: ${generatedKey}. Endpoint: https://master-putey.ru/api/integration. Добавь кнопку «Интеграции» с тремя статусами: «Подключение…» (жёлтый), «Успешно» (зелёный), «Ошибка» (красный). На главной странице отобрази список Путей. Открытые — с золотой кнопкой «Начать Путь». Закрытые — с замком и кнопкой оплаты ЮMoney. Кабинет участника: список начатых Путей + один следующий потенциальный. Кнопки: «Начать Путь», «Оплата», «Написать владельцу» (чат внутри кабинета). Прохождение уровня: поле ввода ответа, подсказки (−50 баллов), при верном ответе — анимация «✦ ПРОХОД ОТКРЫТ ✦» и переход к следующему уровню. Рейтинг по баллам и времени. Регистрация: логин + пароль + email. Дизайн: тёмный мистический, синий + фиолетовый + золото, Cormorant Garamond.`;
    navigator.clipboard?.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const sendInvite = () => {
    if (!inviteForm.name || !inviteForm.email) return;
    setInviteSent(true);
    setTimeout(() => { setInviteSent(false); setShowInviteModal(false); setInviteForm({ name: "", email: "", phone: "" }); }, 1500);
  };

  const saveParticipant = () => {
    if (!editParticipant) return;
    setParticipants(prev => prev.map(p => p.email === editParticipant.email
      ? { ...p, name: editPartForm.name || p.name, email: editPartForm.email || p.email, phone: editPartForm.phone || p.phone }
      : p));
    setEditParticipant(null);
  };

  const tabs = [
    { id: "sites" as Tab, label: "Сайты", icon: "Globe" },
    { id: "achievements" as Tab, label: "Достижения", icon: "Trophy" },
    { id: "cabinet" as Tab, label: "Кабинет", icon: "User" },
    { id: "chat" as Tab, label: "Чат", icon: "MessageSquare" },
  ];

  const inputStyle = { background: "hsl(230 30% 10%)", border: "1px solid hsl(260 30% 25%)", color: "hsl(45 80% 88%)" };
  const cardStyle = { background: "hsl(260 40% 12%)", border: "1px solid hsl(260 30% 18%)" };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "hsl(var(--abyss))" }}>
      <div className="starfield" />

      {/* Шапка */}
      <header className="relative z-10 border-b sticky top-0" style={{ borderColor: "hsl(260 25% 18%)", background: "hsl(230 35% 7% / 0.97)", backdropFilter: "blur(16px)", zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-float" style={{ filter: "drop-shadow(0 0 12px hsl(43 85% 58% / 0.6))" }}>
              <span className="text-3xl">✦</span>
            </div>
            <div>
              <h1 className="font-cormorant text-2xl font-bold" style={{ color: "hsl(43 85% 65%)", letterSpacing: "0.08em" }}>Мастер Путей</h1>
              <p className="text-xs" style={{ color: "hsl(220 20% 45%)", letterSpacing: "0.12em" }}>ПЛАТФОРМА КВЕСТОВ · ВЛАДЕЛЕЦ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/participant")} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-golos transition-all hover:opacity-80" style={{ background: "hsl(260 40% 14%)", border: "1px solid hsl(260 30% 22%)", color: "hsl(270 50% 65%)" }}>
              <Icon name="Users" size={14} />
              <span className="hidden sm:inline">Кабинет участника</span>
            </button>
            <button onClick={() => setShowIntegrationModal(true)} className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-lg">
              <Icon name="Link2" size={16} />
              <span className="font-cormorant font-semibold" style={{ letterSpacing: "0.06em" }}>Интеграции</span>
            </button>
            <button onClick={() => navigate("/auth")} className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:opacity-80" style={{ background: "hsl(260 40% 15%)", border: "1px solid hsl(260 30% 25%)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold font-cormorant" style={{ background: "hsl(265 55% 40%)", color: "hsl(45 80% 88%)" }}>В</div>
              <span className="text-sm font-golos hidden sm:inline" style={{ color: "hsl(45 60% 75%)" }}>Выйти</span>
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-6 flex gap-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCabinetView("main"); }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-golos font-medium transition-all relative ${activeTab === tab.id ? "nav-link active" : "nav-link"}`}>
              <Icon name={tab.icon} size={15} />
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: "linear-gradient(90deg, hsl(43 85% 58% / 0.3), hsl(43 85% 58%), hsl(43 85% 58% / 0.3))" }} />
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* ─── САЙТЫ ─── */}
        {activeTab === "sites" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-cormorant text-3xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Подключённые Сайты</h2>
                <p className="text-sm mt-1" style={{ color: "hsl(220 20% 50%)" }}>{sites.length} сайта подключено к платформе</p>
              </div>
              <button onClick={() => { setShowIntegrationModal(true); setIntegrationMode("add"); }} className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                <Icon name="Plus" size={14} />
                <span className="font-cormorant font-semibold">Добавить сайт</span>
              </button>
            </div>
            <div className="grid gap-4">
              {sites.map((site, i) => (
                <div key={site.id} className="mystic-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(260 40% 18%)", border: "1px solid hsl(260 30% 28%)" }}>
                        <Icon name="Globe" size={20} style={{ color: "hsl(43 85% 58%)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-cormorant text-xl font-semibold" style={{ color: "hsl(45 80% 82%)" }}>{site.name}</h3>
                          <div className="flex items-center gap-1.5">
                            <span className={`status-dot ${site.status === "online" ? "status-online" : site.status === "offline" ? "status-offline" : "status-pending"}`} />
                            <span className="text-xs font-golos" style={{ color: site.status === "online" ? "#4ade80" : site.status === "offline" ? "#f87171" : "#facc15" }}>
                              {site.status === "online" ? "В сети" : site.status === "offline" ? "Офлайн" : "Ожидание"}
                            </span>
                          </div>
                          {site.price > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded font-golos" style={{ background: "hsl(43 40% 14%)", color: "hsl(43 85% 58%)", border: "1px solid hsl(43 60% 22%)" }}>
                              Оплата: {site.price}₽
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-1 font-mono truncate" style={{ color: "hsl(220 20% 40%)" }}>{site.endpoint}</p>
                        {site.offlineReason && (
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#f87171" }}>
                            <Icon name="AlertCircle" size={11} />{site.offlineReason}
                          </p>
                        )}
                        <div className="flex items-center gap-5 mt-3 flex-wrap">
                          <span className="text-xs flex items-center gap-1.5" style={{ color: "hsl(220 20% 50%)" }}><Icon name="Map" size={12} />{site.paths} путей</span>
                          <span className="text-xs flex items-center gap-1.5" style={{ color: "hsl(220 20% 50%)" }}><Icon name="Users" size={12} />{site.participants} участников</span>
                          <span className="text-xs font-mono flex items-center gap-1.5" style={{ color: "hsl(260 40% 55%)" }}><Icon name="Key" size={12} />{site.key}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openSettings(site)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-golos transition-all hover:-translate-y-0.5" style={{ background: "hsl(260 40% 18%)", border: "1px solid hsl(260 30% 28%)", color: "hsl(45 60% 75%)" }}>
                        <Icon name="Settings" size={12} />Настройка
                      </button>
                      <button onClick={() => { setDeleteSite(site); setShowDeleteConfirm(true); setShowIntegrationModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-golos transition-all hover:-translate-y-0.5" style={{ background: "hsl(0 30% 15%)", border: "1px solid hsl(0 30% 25%)", color: "#f87171" }}>
                        <Icon name="Trash2" size={12} />Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {sites.length === 0 && (
                <div className="mystic-card rounded-xl p-12 text-center">
                  <Icon name="Globe" size={40} className="mx-auto mb-4" style={{ color: "hsl(260 30% 30%)" }} />
                  <p className="font-cormorant text-xl" style={{ color: "hsl(220 20% 45%)" }}>Нет подключённых сайтов</p>
                  <p className="text-sm mt-2" style={{ color: "hsl(220 20% 35%)" }}>Добавьте первый сайт через кнопку «Интеграции»</p>
                </div>
              )}
            </div>

            {/* Динамические кнопки функций */}
            {sites.length > 0 && (
              <div className="mt-10">
                <div className="ornament-divider mb-6">
                  <span className="font-cormorant text-sm italic" style={{ color: "hsl(43 85% 58% / 0.6)" }}>Функции подключённых сайтов</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sites.filter(s => s.status === "online").flatMap(s => [
                    { name: `${s.name.split(" ")[0]}: Пути`, icon: "Map", site: s.name },
                    { name: `${s.name.split(" ")[0]}: Участники`, icon: "Users", site: s.name },
                  ]).slice(0, 3).concat([{ name: "Добавить функцию", icon: "Plus", site: "" }]).map((btn, i) => (
                    <button key={i} onClick={() => btn.site ? setActiveTab("cabinet") : setShowIntegrationModal(true)}
                      className="mystic-card rounded-xl p-4 text-left transition-all hover:-translate-y-0.5"
                      style={{ border: btn.site ? "1px solid hsl(260 30% 22%)" : "1px dashed hsl(260 30% 22%)" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: "hsl(260 40% 18%)" }}>
                        <Icon name={btn.icon} size={16} style={{ color: "hsl(43 85% 58%)" }} />
                      </div>
                      <p className="text-sm font-golos font-medium" style={{ color: "hsl(45 60% 75%)" }}>{btn.name}</p>
                      {btn.site && <p className="text-xs mt-0.5 truncate" style={{ color: "hsl(220 20% 40%)" }}>{btn.site}</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── ДОСТИЖЕНИЯ ─── */}
        {activeTab === "achievements" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="font-cormorant text-3xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Таблица Достижений</h2>
              <p className="text-sm mt-1" style={{ color: "hsl(220 20% 50%)" }}>Прогресс участников в реальном времени</p>
            </div>
            <div className="grid gap-3">
              {MOCK_ACHIEVEMENTS.sort((a, b) => b.progress - a.progress).map((a, i) => (
                <div key={a.id} className="mystic-card rounded-xl p-5 animate-fade-in" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                  <div className="flex items-center gap-5">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-cormorant"
                        style={{ background: "linear-gradient(135deg, hsl(265 55% 30%), hsl(225 60% 25%))", color: "hsl(45 80% 82%)", border: "2px solid hsl(43 85% 58% / 0.3)" }}>
                        {a.avatar}
                      </div>
                      {a.progress === 100 && <span className="absolute -top-1 -right-1 text-sm" style={{ filter: "drop-shadow(0 0 6px hsl(43 85% 58%))" }}>✦</span>}
                      <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-cormorant"
                        style={{ background: i === 0 ? "hsl(43 85% 45%)" : i === 1 ? "hsl(220 20% 50%)" : "hsl(260 40% 25%)", color: "hsl(230 35% 8%)" }}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-golos font-semibold" style={{ color: "hsl(45 80% 82%)" }}>{a.participant}</span>
                        <span className="text-xs" style={{ color: "hsl(220 20% 40%)" }}>{a.lastActive}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs" style={{ color: "hsl(220 20% 50%)" }}>{a.site}</span>
                        <span style={{ color: "hsl(260 30% 35%)" }}>·</span>
                        <span className="text-xs font-medium" style={{ color: "hsl(270 60% 65%)" }}>{a.path}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(230 30% 15%)" }}>
                          <div className="h-full rounded-full" style={{ width: `${a.progress}%`, background: a.progress === 100 ? "linear-gradient(90deg, hsl(43 85% 58%), hsl(38 80% 50%))" : "linear-gradient(90deg, hsl(265 55% 40%), hsl(225 60% 45%))" }} />
                        </div>
                        <span className="text-xs font-mono font-semibold" style={{ color: a.progress === 100 ? "hsl(43 85% 58%)" : "hsl(270 60% 65%)" }}>{a.level}/{a.totalLevels}</span>
                        <span className="text-xs" style={{ color: "hsl(220 20% 40%)" }}>{a.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[{ label: "Всего участников", value: "47", icon: "Users" }, { label: "Активных Путей", value: "15", icon: "Map" }, { label: "Завершили путь", value: "8", icon: "CheckCircle" }].map((stat, i) => (
                <div key={i} className="mystic-card rounded-xl p-5 text-center animate-fade-in" style={{ animationDelay: `${0.4 + i * 0.1}s`, opacity: 0 }}>
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "hsl(260 40% 18%)" }}>
                    <Icon name={stat.icon} size={18} style={{ color: "hsl(43 85% 58%)" }} />
                  </div>
                  <p className="font-cormorant text-3xl font-bold" style={{ color: "hsl(43 85% 65%)" }}>{stat.value}</p>
                  <p className="text-xs mt-1 font-golos" style={{ color: "hsl(220 20% 45%)" }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── КАБИНЕТ ─── */}
        {activeTab === "cabinet" && (
          <div className="animate-fade-in">
            {/* Breadcrumb */}
            {cabinetView !== "main" && (
              <button onClick={() => setCabinetView("main")} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: "hsl(220 20% 45%)" }}>
                <Icon name="ArrowLeft" size={14} /> Назад в кабинет
              </button>
            )}

            {cabinetView === "main" && (
              <div>
                <div className="mb-8">
                  <h2 className="font-cormorant text-3xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Личный Кабинет</h2>
                  <p className="text-sm mt-1" style={{ color: "hsl(220 20% 50%)" }}>Владелец платформы</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-5">
                    <div className="mystic-card rounded-xl p-6 text-center">
                      <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold font-cormorant animate-glow-pulse"
                        style={{ background: "linear-gradient(135deg, hsl(265 55% 30%), hsl(225 60% 25%))", color: "hsl(43 85% 65%)", border: "2px solid hsl(43 85% 58% / 0.4)" }}>В</div>
                      <h3 className="font-cormorant text-xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Владелец</h3>
                      <p className="text-xs mt-1" style={{ color: "hsl(220 20% 45%)" }}>owner@master-putey.ru</p>
                      <button onClick={() => setCabinetView("settings")} className="mt-4 w-full py-2 rounded-lg text-sm font-golos transition-all hover:-translate-y-0.5" style={{ background: "hsl(260 40% 18%)", border: "1px solid hsl(260 30% 28%)", color: "hsl(45 60% 75%)" }}>
                        Редактировать профиль
                      </button>
                    </div>
                    <div className="mystic-card rounded-xl p-5">
                      <h4 className="font-cormorant text-lg font-semibold mb-4" style={{ color: "hsl(45 80% 82%)" }}>Панель управления</h4>
                      <div className="space-y-2">
                        {[
                          { label: "Редактор Квестов", icon: "PenTool", view: "editor" as CabinetView },
                          { label: "Управление участниками", icon: "UserCog", view: "participants" as CabinetView },
                          { label: "Отправить приглашение", icon: "Mail", view: null },
                          { label: "Рассылка сообщений", icon: "Send", view: null },
                          { label: "Настройки платформы", icon: "Settings", view: "settings" as CabinetView },
                        ].map((item, i) => (
                          <button key={i}
                            onClick={() => item.view ? setCabinetView(item.view) : item.label === "Отправить приглашение" ? setShowInviteModal(true) : (setActiveTab("chat"), setShowBroadcast(true))}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-golos text-left transition-all hover:-translate-y-0.5"
                            style={{ background: "hsl(260 40% 14%)", border: "1px solid hsl(260 30% 22%)", color: "hsl(45 60% 75%)" }}>
                            <Icon name={item.icon} size={14} style={{ color: "hsl(43 85% 55%)" }} />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-5">
                    <div className="mystic-card rounded-xl p-6">
                      <h4 className="font-cormorant text-xl font-semibold mb-4" style={{ color: "hsl(45 80% 82%)" }}>Редактор Квестов</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Создать новый Путь", icon: "Plus", accent: true },
                          { label: "Мои Пути (15)", icon: "List", accent: false },
                          { label: "Загадки и уровни", icon: "Puzzle", accent: false },
                          { label: "Подсказки", icon: "Lightbulb", accent: false },
                        ].map((item, i) => (
                          <button key={i} onClick={() => setCabinetView("editor")}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-golos transition-all hover:-translate-y-0.5 ${item.accent ? "btn-gold" : ""}`}
                            style={!item.accent ? { background: "hsl(260 40% 14%)", border: "1px solid hsl(260 30% 22%)", color: "hsl(45 60% 75%)" } : {}}>
                            <Icon name={item.icon} size={15} />{item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mystic-card rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-cormorant text-xl font-semibold" style={{ color: "hsl(45 80% 82%)" }}>Участники</h4>
                        <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-golos" style={{ background: "hsl(43 40% 14%)", border: "1px solid hsl(43 60% 22%)", color: "hsl(43 85% 58%)" }}>
                          <Icon name="UserPlus" size={12} />Пригласить
                        </button>
                      </div>
                      <div className="space-y-3">
                        {participants.map((p, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={cardStyle}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-cormorant" style={{ background: "hsl(265 55% 30%)", color: "hsl(45 80% 82%)" }}>{p.avatar}</div>
                              <div>
                                <span className="text-sm font-golos block" style={{ color: "hsl(45 60% 75%)" }}>{p.name}</span>
                                <span className="text-xs" style={{ color: "hsl(220 20% 40%)" }}>{p.email}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditParticipant(p); setEditPartForm({ name: p.name, email: p.email, phone: p.phone, password: "" }); setCabinetView("participants"); }}
                                className="px-2.5 py-1 rounded text-xs font-golos transition-all hover:opacity-80" style={{ background: "hsl(260 40% 18%)", color: "hsl(270 60% 65%)" }}>Изменить</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Редактор квестов */}
            {cabinetView === "editor" && (
              <div>
                <h2 className="font-cormorant text-3xl font-bold mb-6" style={{ color: "hsl(45 80% 82%)" }}>Редактор Квестов</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {["Путь Искателя", "Путь Мудреца", "Путь Странника"].map((name, i) => (
                    <div key={i} className="mystic-card rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-cormorant text-xl font-semibold" style={{ color: "hsl(45 80% 82%)" }}>{name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded font-golos" style={{ background: "hsl(260 40% 18%)", color: "hsl(270 50% 60%)" }}>{i + 5} уровней</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-lg text-xs font-golos transition-all hover:-translate-y-0.5" style={{ background: "hsl(260 40% 16%)", border: "1px solid hsl(260 30% 25%)", color: "hsl(45 60% 75%)" }}>Редактировать</button>
                        <button className="flex-1 py-2 rounded-lg text-xs font-golos transition-all hover:-translate-y-0.5" style={{ background: "hsl(43 40% 14%)", border: "1px solid hsl(43 60% 22%)", color: "hsl(43 85% 58%)" }}>Уровни</button>
                      </div>
                    </div>
                  ))}
                  <div className="mystic-card rounded-xl p-5 flex items-center justify-center" style={{ border: "1px dashed hsl(260 30% 25%)", minHeight: "120px" }}>
                    <button className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(43 40% 14%)", border: "1px solid hsl(43 60% 20%)" }}>
                        <Icon name="Plus" size={18} style={{ color: "hsl(43 85% 58%)" }} />
                      </div>
                      <span className="text-sm font-cormorant font-semibold" style={{ color: "hsl(43 85% 58%)" }}>Создать новый Путь</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Управление участниками */}
            {cabinetView === "participants" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-cormorant text-3xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Участники</h2>
                  <button onClick={() => setShowInviteModal(true)} className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                    <Icon name="UserPlus" size={14} /><span className="font-cormorant font-semibold">Пригласить</span>
                  </button>
                </div>
                {editParticipant ? (
                  <div className="mystic-card rounded-xl p-6 max-w-md">
                    <h3 className="font-cormorant text-xl font-semibold mb-5" style={{ color: "hsl(45 80% 82%)" }}>Редактировать: {editParticipant.name}</h3>
                    <div className="space-y-4">
                      {[
                        { key: "name", label: "Имя", placeholder: editParticipant.name },
                        { key: "email", label: "Email", placeholder: editParticipant.email },
                        { key: "phone", label: "Телефон", placeholder: editParticipant.phone },
                        { key: "password", label: "Новый пароль", placeholder: "Оставьте пустым, если не меняете" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>{f.label}</label>
                          <input value={editPartForm[f.key as keyof typeof editPartForm]}
                            onChange={e => setEditPartForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            placeholder={f.placeholder} type={f.key === "password" ? "password" : "text"}
                            className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <button onClick={() => setEditParticipant(null)} className="flex-1 py-2.5 rounded-xl text-sm font-golos" style={{ background: "hsl(260 40% 16%)", border: "1px solid hsl(260 30% 25%)", color: "hsl(45 60% 75%)" }}>Отмена</button>
                        <button onClick={saveParticipant} className="flex-1 btn-gold py-2.5 rounded-xl font-cormorant font-semibold">Сохранить</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {participants.map((p, i) => (
                      <div key={i} className="mystic-card rounded-xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-cormorant" style={{ background: "linear-gradient(135deg, hsl(265 55% 30%), hsl(225 55% 25%))", color: "hsl(45 80% 82%)" }}>{p.avatar}</div>
                          <div>
                            <p className="font-golos font-semibold" style={{ color: "hsl(45 80% 82%)" }}>{p.name}</p>
                            <p className="text-xs" style={{ color: "hsl(220 20% 45%)" }}>{p.email} · {p.phone}</p>
                          </div>
                        </div>
                        <button onClick={() => { setEditParticipant(p); setEditPartForm({ name: p.name, email: p.email, phone: p.phone, password: "" }); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-golos transition-all hover:-translate-y-0.5" style={{ background: "hsl(260 40% 18%)", border: "1px solid hsl(260 30% 28%)", color: "hsl(45 60% 75%)" }}>
                          <Icon name="Edit" size={12} />Редактировать
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Настройки */}
            {cabinetView === "settings" && (
              <div className="max-w-lg">
                <h2 className="font-cormorant text-3xl font-bold mb-6" style={{ color: "hsl(45 80% 82%)" }}>Настройки платформы</h2>
                <div className="mystic-card rounded-xl p-6 space-y-4">
                  {[
                    { label: "Имя владельца", placeholder: "Владелец" },
                    { label: "Email", placeholder: "owner@master-putey.ru" },
                    { label: "Новый пароль", placeholder: "Оставьте пустым, если не меняете" },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>{f.label}</label>
                      <input placeholder={f.placeholder} type={f.label.includes("пароль") ? "password" : "text"}
                        className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                    </div>
                  ))}
                  <button className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Сохранить настройки</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── ЧАТ ─── */}
        {activeTab === "chat" && (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-cormorant text-3xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Мессенджер</h2>
                <p className="text-sm mt-1" style={{ color: "hsl(220 20% 50%)" }}>Переписка с участниками</p>
              </div>
              <button onClick={() => setShowBroadcast(true)} className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                <Icon name="Send" size={14} /><span className="font-cormorant font-semibold">Рассылка всем</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ height: "calc(100vh - 300px)", minHeight: "420px" }}>
              <div className="mystic-card rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b" style={{ borderColor: "hsl(260 25% 18%)" }}>
                  <p className="font-cormorant text-base font-semibold" style={{ color: "hsl(45 80% 75%)" }}>Диалоги</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {participants.map((p, i) => (
                    <button key={i} onClick={() => setActiveChatUser(p.name)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:-translate-y-0.5"
                      style={{ background: activeChatUser === p.name ? "hsl(260 40% 18%)" : "hsl(260 40% 13%)", border: `1px solid ${activeChatUser === p.name ? "hsl(43 85% 58% / 0.3)" : "hsl(260 30% 18%)"}` }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-cormorant flex-shrink-0" style={{ background: "hsl(265 55% 30%)", color: "hsl(45 80% 82%)" }}>{p.avatar}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-golos font-medium truncate" style={{ color: "hsl(45 60% 75%)" }}>{p.name}</p>
                        <p className="text-xs truncate" style={{ color: "hsl(220 20% 40%)" }}>{p.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 mystic-card rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "hsl(260 25% 18%)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-cormorant" style={{ background: "hsl(265 55% 30%)", color: "hsl(45 80% 82%)" }}>
                      {participants.find(p => p.name === activeChatUser)?.avatar || "?"}
                    </div>
                    <div>
                      <p className="font-golos font-semibold text-sm" style={{ color: "hsl(45 80% 82%)" }}>{activeChatUser}</p>
                      <p className="text-xs flex items-center gap-1" style={{ color: "#4ade80" }}><span className="status-dot status-online" />онлайн</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.filter(m => m.from === activeChatUser || m.isOwner).map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isOwner ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-xs lg:max-w-md">
                        {!msg.isOwner && <p className="text-xs mb-1 font-golos" style={{ color: "hsl(220 20% 40%)" }}>{msg.from}</p>}
                        <div className="px-4 py-2.5 rounded-2xl" style={{
                          background: msg.isOwner ? "linear-gradient(135deg, hsl(265 55% 32%), hsl(43 60% 32%))" : "hsl(230 30% 13%)",
                          border: msg.isOwner ? "none" : "1px solid hsl(260 30% 22%)",
                          color: "hsl(45 80% 88%)",
                          borderTopRightRadius: msg.isOwner ? "4px" : undefined,
                          borderTopLeftRadius: !msg.isOwner ? "4px" : undefined,
                        }}>
                          <p className="text-sm font-golos leading-relaxed">{msg.text}</p>
                        </div>
                        <p className={`text-xs mt-1 ${msg.isOwner ? "text-right" : ""}`} style={{ color: "hsl(220 20% 35%)" }}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t" style={{ borderColor: "hsl(260 25% 18%)" }}>
                  <div className="flex gap-3">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
                      placeholder={`Написать ${activeChatUser}...`} className="flex-1 mystic-input px-4 py-2.5 rounded-xl text-sm font-golos" />
                    <button onClick={sendMessage} className="btn-gold px-4 py-2.5 rounded-xl"><Icon name="Send" size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ МОДАЛ РАССЫЛКИ ═══ */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={() => setShowBroadcast(false)}>
          <div className="mystic-card rounded-2xl w-full max-w-md animate-fade-in-scale p-6" style={{ border: "1px solid hsl(260 30% 28%)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-cormorant text-2xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Рассылка всем участникам</h3>
              <button onClick={() => setShowBroadcast(false)} style={{ color: "hsl(220 20% 45%)" }}><Icon name="X" size={16} /></button>
            </div>
            <textarea value={broadcastText} onChange={e => setBroadcastText(e.target.value)}
              placeholder="Введите сообщение для всех участников..." rows={4}
              className="mystic-input w-full px-4 py-3 rounded-xl text-sm font-golos resize-none mb-4" />
            <button onClick={() => { if (broadcastText.trim()) { setMessages(prev => [...prev, { id: Date.now().toString(), from: "Владелец", text: `[Рассылка] ${broadcastText}`, time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }), isOwner: true }]); setBroadcastText(""); setShowBroadcast(false); } }}
              className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Отправить всем</button>
          </div>
        </div>
      )}

      {/* ═══ МОДАЛ ПРИГЛАШЕНИЯ ═══ */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={() => { setShowInviteModal(false); setInviteSent(false); }}>
          <div className="mystic-card rounded-2xl w-full max-w-md animate-fade-in-scale p-6" style={{ border: "1px solid hsl(260 30% 28%)" }} onClick={e => e.stopPropagation()}>
            {inviteSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "hsl(43 40% 14%)", border: "1px solid hsl(43 60% 25%)" }}>
                  <Icon name="CheckCircle" size={28} style={{ color: "hsl(43 85% 60%)" }} />
                </div>
                <p className="font-cormorant text-2xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Приглашение отправлено!</p>
                <p className="text-sm mt-2" style={{ color: "hsl(220 20% 50%)" }}>Участник получит письмо со ссылкой для регистрации</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-cormorant text-2xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Пригласить участника</h3>
                  <button onClick={() => setShowInviteModal(false)} style={{ color: "hsl(220 20% 45%)" }}><Icon name="X" size={16} /></button>
                </div>
                <div className="space-y-4">
                  {[{ key: "name", label: "Имя", placeholder: "Имя участника" }, { key: "email", label: "Email", placeholder: "email@mail.ru" }, { key: "phone", label: "Телефон (необязательно)", placeholder: "+7 900 000-00-00" }].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>{f.label}</label>
                      <input value={inviteForm[f.key as keyof typeof inviteForm]}
                        onChange={e => setInviteForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder} className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                    </div>
                  ))}
                  <div className="p-3 rounded-xl" style={{ background: "hsl(260 40% 12%)", border: "1px solid hsl(260 30% 20%)" }}>
                    <p className="text-xs font-golos" style={{ color: "hsl(220 20% 45%)" }}>Уникальная ссылка для регистрации будет отправлена на email участника</p>
                    <p className="text-xs font-mono mt-1" style={{ color: "hsl(260 40% 55%)" }}>https://master-putey.ru/auth?invite=...</p>
                  </div>
                  <button onClick={sendInvite} className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Отправить приглашение</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ МОДАЛ ИНТЕГРАЦИЙ ═══ */}
      {showIntegrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="mystic-card rounded-2xl w-full max-w-lg animate-fade-in-scale overflow-y-auto" style={{ border: "1px solid hsl(43 85% 58% / 0.2)", boxShadow: "0 0 60px hsl(265 55% 15% / 0.8)", maxHeight: "90vh" }}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0" style={{ borderColor: "hsl(260 25% 18%)", background: "hsl(230 30% 10%)" }}>
              <div className="flex items-center gap-3">
                <span className="text-xl" style={{ color: "hsl(43 85% 58%)", filter: "drop-shadow(0 0 8px hsl(43 85% 58% / 0.5))" }}>✦</span>
                <h3 className="font-cormorant text-2xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>
                  {settingsSite ? `Настройка: ${settingsSite.name}` : showDeleteConfirm ? "Удаление сайта" : "Интеграции"}
                </h3>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(260 40% 15%)", color: "hsl(220 20% 50%)" }}>
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="p-6">

              {/* Удалить */}
              {showDeleteConfirm && deleteSite && (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "hsl(0 30% 15%)", border: "1px solid hsl(0 30% 25%)" }}>
                    <Icon name="Trash2" size={24} style={{ color: "#f87171" }} />
                  </div>
                  <p className="font-cormorant text-xl mb-2" style={{ color: "hsl(45 80% 82%)" }}>Удалить «{deleteSite.name}»?</p>
                  <p className="text-sm mb-6" style={{ color: "hsl(220 20% 50%)" }}>Это действие нельзя отменить. Все интеграции будут разорваны.</p>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm font-golos" style={{ background: "hsl(260 40% 16%)", border: "1px solid hsl(260 30% 25%)", color: "hsl(45 60% 75%)" }}>Отмена</button>
                    <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl text-sm font-golos" style={{ background: "hsl(0 50% 30%)", border: "1px solid hsl(0 40% 40%)", color: "#fca5a5" }}>Удалить</button>
                  </div>
                </div>
              )}

              {/* Настройка сайта — с полем цены */}
              {settingsSite && !showDeleteConfirm && (
                <div className="space-y-4">
                  {[
                    { key: "name", label: "Название сайта", placeholder: "Мой квест-сайт" },
                    { key: "key", label: "Ключ интеграции", placeholder: "mp_xxxxxxxx" },
                    { key: "endpoint", label: "Endpoint URL", placeholder: "https://site.ru/api" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>{f.label}</label>
                      <input value={editForm[f.key as keyof typeof editForm]}
                        onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder} className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                    </div>
                  ))}
                  <div className="p-4 rounded-xl" style={{ background: "hsl(43 40% 10%)", border: "1px solid hsl(43 60% 20%)" }}>
                    <p className="text-xs font-golos font-semibold mb-3" style={{ color: "hsl(43 85% 58%)" }}>💰 Настройка оплаты</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>Стоимость доступа (₽)</label>
                        <input value={editForm.price} onChange={e => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                          type="number" min="0" placeholder="0 — бесплатно"
                          className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                      </div>
                      <div>
                        <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>ЮMoney ссылка</label>
                        <input value={editForm.yoomoney} onChange={e => setEditForm(prev => ({ ...prev, yoomoney: e.target.value }))}
                          placeholder="https://yoomoney.ru/to/..." className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                      </div>
                    </div>
                    <p className="text-xs mt-2 font-golos" style={{ color: "hsl(220 20% 40%)" }}>
                      {Number(editForm.price) > 0 ? `Участники платят ${editForm.price}₽ для разблокировки закрытых Путей` : "Бесплатный доступ ко всем открытым Путям"}
                    </p>
                  </div>
                  {saveSuccess ? (
                    <div className="w-full py-3 rounded-xl text-center font-cormorant font-semibold text-base flex items-center justify-center gap-2 animate-fade-in" style={{ background: "hsl(43 40% 18%)", color: "hsl(43 85% 58%)" }}>
                      <Icon name="CheckCircle" size={18} /> Сохранено!
                    </div>
                  ) : (
                    <button onClick={saveSettings} className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Сохранить изменения</button>
                  )}
                </div>
              )}

              {/* Главный экран */}
              {!settingsSite && !showDeleteConfirm && !integrationMode && (
                <div className="space-y-3">
                  <p className="text-sm mb-5" style={{ color: "hsl(220 20% 55%)" }}>
                    <span className="drop-cap">В</span>ыберите режим подключения нового сайта-квеста
                  </p>
                  {[
                    { mode: "accept" as const, label: "Принять дополнение", desc: "Создать новый сайт или принять по ключу", icon: "Download", color: "hsl(43 60% 20%)", iconColor: "hsl(43 85% 58%)", border: "hsl(43 85% 58% / 0.2)" },
                    { mode: "add" as const, label: "Добавить сайт", desc: "Вручную указать ключ и параметры", icon: "PlusCircle", color: "hsl(260 40% 18%)", iconColor: "hsl(270 60% 65%)", border: "hsl(260 30% 25%)" },
                  ].map(opt => (
                    <button key={opt.mode} onClick={() => setIntegrationMode(opt.mode)}
                      className="w-full mystic-card rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 flex items-center gap-4"
                      style={{ border: `1px solid ${opt.border}` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: opt.color }}>
                        <Icon name={opt.icon} size={18} style={{ color: opt.iconColor }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-cormorant text-lg font-semibold" style={{ color: "hsl(45 80% 82%)" }}>{opt.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "hsl(220 20% 45%)" }}>{opt.desc}</p>
                      </div>
                      <Icon name="ChevronRight" size={16} style={{ color: "hsl(220 20% 40%)" }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Принять дополнение — выбор */}
              {integrationMode === "accept" && !acceptSubMode && (
                <div className="space-y-3">
                  <button onClick={() => setIntegrationMode(null)} className="flex items-center gap-1.5 text-xs mb-4" style={{ color: "hsl(220 20% 45%)" }}>
                    <Icon name="ArrowLeft" size={12} /> Назад
                  </button>
                  <p className="text-sm mb-5" style={{ color: "hsl(220 20% 55%)" }}>Как подключаем новый сайт?</p>
                  {[
                    { sub: "new" as const, label: "Создать новый сайт", desc: "Автогенерация ключа, endpoint и промта для ИИ", icon: "Wand2", color: "hsl(43 60% 18%)", iconColor: "hsl(43 85% 58%)", border: "hsl(43 85% 58% / 0.2)" },
                    { sub: "key" as const, label: "Принять по ключу", desc: "Введите ключ от внешнего сайта", icon: "Key", color: "hsl(260 40% 18%)", iconColor: "hsl(270 60% 65%)", border: "hsl(260 30% 25%)" },
                  ].map(opt => (
                    <button key={opt.sub} onClick={() => setAcceptSubMode(opt.sub)}
                      className="w-full mystic-card rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 flex items-center gap-4" style={{ border: `1px solid ${opt.border}` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: opt.color }}>
                        <Icon name={opt.icon} size={18} style={{ color: opt.iconColor }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-cormorant text-lg font-semibold" style={{ color: "hsl(45 80% 82%)" }}>{opt.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "hsl(220 20% 45%)" }}>{opt.desc}</p>
                      </div>
                      <Icon name="ChevronRight" size={16} style={{ color: "hsl(220 20% 40%)" }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Новый сайт — автогенерация + промт */}
              {acceptSubMode === "new" && (
                <div>
                  <button onClick={() => setAcceptSubMode(null)} className="flex items-center gap-1.5 text-xs mb-5" style={{ color: "hsl(220 20% 45%)" }}>
                    <Icon name="ArrowLeft" size={12} /> Назад
                  </button>
                  <div className="rounded-xl p-4 mb-4" style={{ background: "hsl(43 40% 10%)", border: "1px solid hsl(43 60% 22%)" }}>
                    <p className="text-xs mb-1 font-golos" style={{ color: "hsl(220 20% 45%)" }}>Сгенерированный ключ интеграции</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm flex-1" style={{ color: "hsl(43 85% 65%)" }}>{generatedKey}</code>
                      <button onClick={copyKey} className="flex items-center gap-1 p-1.5 rounded text-xs transition-all" style={{ background: "hsl(43 40% 18%)", color: copiedKey ? "#4ade80" : "hsl(43 85% 55%)" }}>
                        <Icon name={copiedKey ? "Check" : "Copy"} size={13} />
                        {copiedKey ? "Скопировано" : ""}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl p-4 mb-5" style={{ background: "hsl(265 30% 10%)", border: "1px solid hsl(260 30% 22%)" }}>
                    <p className="text-xs mb-2 font-golos font-semibold" style={{ color: "hsl(270 50% 60%)" }}>Промт-шаблон для ИИ (Поехали!)</p>
                    <p className="text-xs leading-relaxed font-golos" style={{ color: "hsl(260 40% 65%)", lineHeight: "1.7" }}>
                      Создай квест-сайт и подключи к платформе «Мастер Путей». Ключ: <code className="font-mono px-1 py-0.5 rounded" style={{ color: "hsl(43 85% 60%)", background: "hsl(43 40% 12%)" }}>{generatedKey}</code>. Endpoint: https://master-putey.ru/api/integration. Кнопка «Интеграции» со статусами: «Подключение…», «Успешно», «Ошибка». На главной — список Путей с золотыми кнопками «Начать Путь» (открытые) и замком с оплатой ЮMoney (закрытые). Кабинет участника: список Путей + следующий потенциальный + чат с владельцем. Прохождение: ввод ответа, подсказки −50 баллов, анимация «✦ ПРОХОД ОТКРЫТ ✦». Регистрация: email + пароль. Дизайн: тёмный мистический, синий + фиолетовый + золото.
                    </p>
                    <button onClick={copyPrompt}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all" style={{ background: "hsl(260 40% 18%)", color: copiedPrompt ? "#4ade80" : "hsl(270 60% 65%)" }}>
                      <Icon name={copiedPrompt ? "Check" : "Copy"} size={12} />
                      {copiedPrompt ? "Скопировано!" : "Скопировать промт"}
                    </button>
                  </div>
                  <button onClick={closeModal} className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Готово</button>
                </div>
              )}

              {/* Принять по ключу */}
              {acceptSubMode === "key" && (
                <div>
                  <button onClick={() => setAcceptSubMode(null)} className="flex items-center gap-1.5 text-xs mb-5" style={{ color: "hsl(220 20% 45%)" }}>
                    <Icon name="ArrowLeft" size={12} /> Назад
                  </button>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>Ключ от внешнего сайта</label>
                      <input value={inputKey} onChange={e => setInputKey(e.target.value)} placeholder="mp_xxxxxxxx" className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-mono" />
                    </div>
                    <button onClick={() => { if (inputKey.trim()) { setSites(prev => [...prev, { id: Date.now().toString(), name: `Сайт ${inputKey}`, key: inputKey, endpoint: "", status: "pending", paths: 0, participants: 0, price: 0, yoomoney: YOOMONEY_DEFAULT }]); closeModal(); } }}
                      className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Подключить</button>
                  </div>
                </div>
              )}

              {/* Добавить вручную */}
              {integrationMode === "add" && !settingsSite && !showDeleteConfirm && (
                <div>
                  <button onClick={() => setIntegrationMode(null)} className="flex items-center gap-1.5 text-xs mb-5" style={{ color: "hsl(220 20% 45%)" }}>
                    <Icon name="ArrowLeft" size={12} /> Назад
                  </button>
                  <div className="space-y-4">
                    {[
                      { key: "name", label: "Название сайта *", placeholder: "Мой квест-сайт" },
                      { key: "key", label: "Ключ интеграции *", placeholder: "mp_xxxxxxxx" },
                      { key: "endpoint", label: "Endpoint URL", placeholder: "https://mysite.ru/api" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>{f.label}</label>
                        <input value={manualForm[f.key as keyof typeof manualForm]}
                          onChange={e => setManualForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          placeholder={f.placeholder} className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                      </div>
                    ))}
                    <div className="p-4 rounded-xl" style={{ background: "hsl(43 40% 10%)", border: "1px solid hsl(43 60% 20%)" }}>
                      <p className="text-xs font-golos font-semibold mb-3" style={{ color: "hsl(43 85% 58%)" }}>💰 Настройка оплаты</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>Стоимость (₽)</label>
                          <input value={manualForm.price} onChange={e => setManualForm(prev => ({ ...prev, price: e.target.value }))}
                            type="number" min="0" placeholder="0 — бесплатно" className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                        </div>
                        <div>
                          <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>ЮMoney ссылка</label>
                          <input value={manualForm.yoomoney} onChange={e => setManualForm(prev => ({ ...prev, yoomoney: e.target.value }))}
                            placeholder="https://yoomoney.ru/..." className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                        </div>
                      </div>
                    </div>
                    <button onClick={addSiteManually} className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base"
                      style={{ opacity: manualForm.name && manualForm.key ? 1 : 0.6 }}>
                      Добавить сайт
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
