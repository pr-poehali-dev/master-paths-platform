import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "sites" | "achievements" | "cabinet" | "chat";

interface Site {
  id: string;
  name: string;
  key: string;
  endpoint: string;
  status: "online" | "offline" | "pending";
  offlineReason?: string;
  paths: number;
  participants: number;
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

const MOCK_SITES: Site[] = [
  { id: "1", name: "Тайны Старого Города", key: "mp_7f3k9d2x", endpoint: "https://oldcity.quest/api", status: "online", paths: 5, participants: 23 },
  { id: "2", name: "Лабиринт Теней", key: "mp_4a8m1n6q", endpoint: "https://shadows.game/api", status: "offline", offlineReason: "Истёк срок токена", paths: 3, participants: 11 },
  { id: "3", name: "Хроники Забытых", key: "mp_2b5p7r0w", endpoint: "https://forgotten.ru/api", status: "pending", paths: 7, participants: 0 },
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

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("sites");
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [integrationMode, setIntegrationMode] = useState<"accept" | "add" | null>(null);
  const [acceptSubMode, setAcceptSubMode] = useState<"new" | "key" | null>(null);
  const [generatedKey] = useState("mp_" + Math.random().toString(36).substr(2, 8));
  const [inputKey, setInputKey] = useState("");
  const [manualForm, setManualForm] = useState({ name: "", key: "", endpoint: "", style: "" });
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [settingsSite, setSettingsSite] = useState<Site | null>(null);
  const [deleteSite, setDeleteSite] = useState<Site | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      from: "Владелец",
      text: chatInput,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      isOwner: true,
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
  };

  const tabs = [
    { id: "sites" as Tab, label: "Сайты", icon: "Globe" },
    { id: "achievements" as Tab, label: "Достижения", icon: "Trophy" },
    { id: "cabinet" as Tab, label: "Кабинет", icon: "User" },
    { id: "chat" as Tab, label: "Чат", icon: "MessageSquare" },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "hsl(var(--abyss))" }}>
      <div className="starfield" />

      {/* Шапка */}
      <header className="relative z-10 border-b" style={{ borderColor: "hsl(260 25% 18%)", background: "hsl(230 35% 7% / 0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-float" style={{ filter: "drop-shadow(0 0 12px hsl(43 85% 58% / 0.6))" }}>
              <span className="text-3xl">✦</span>
            </div>
            <div>
              <h1 className="font-cormorant text-2xl font-bold" style={{ color: "hsl(43 85% 65%)", letterSpacing: "0.08em" }}>
                Мастер Путей
              </h1>
              <p className="text-xs" style={{ color: "hsl(220 20% 45%)", letterSpacing: "0.12em" }}>ПЛАТФОРМА КВЕСТОВ</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowIntegrationModal(true)}
              className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-lg"
            >
              <Icon name="Link2" size={16} />
              <span className="font-cormorant font-semibold" style={{ letterSpacing: "0.06em" }}>Интеграции</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "hsl(260 40% 15%)", border: "1px solid hsl(260 30% 25%)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold font-cormorant" style={{ background: "hsl(265 55% 40%)", color: "hsl(45 80% 88%)" }}>В</div>
              <span className="text-sm font-golos" style={{ color: "hsl(45 60% 75%)" }}>Владелец</span>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <nav className="max-w-7xl mx-auto px-6 flex gap-1 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-golos font-medium transition-all relative ${activeTab === tab.id ? "nav-link active" : "nav-link"}`}
            >
              <Icon name={tab.icon} size={15} />
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: "linear-gradient(90deg, hsl(43 85% 58% / 0.3), hsl(43 85% 58%), hsl(43 85% 58% / 0.3))" }} />
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Контент */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* ─── САЙТЫ ─── */}
        {activeTab === "sites" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-cormorant text-3xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Подключённые Сайты</h2>
                <p className="text-sm mt-1" style={{ color: "hsl(220 20% 50%)" }}>Управляйте интегрированными квест-платформами</p>
              </div>
              <button onClick={() => { setShowIntegrationModal(true); setIntegrationMode("add"); }} className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                <Icon name="Plus" size={14} />
                <span className="font-cormorant font-semibold">Добавить сайт</span>
              </button>
            </div>

            <div className="grid gap-4">
              {MOCK_SITES.map((site, i) => (
                <div key={site.id} className="mystic-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(260 40% 18%)", border: "1px solid hsl(260 30% 28%)" }}>
                        <Icon name="Globe" size={20} style={{ color: "hsl(43 85% 58%)" }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-cormorant text-xl font-semibold" style={{ color: "hsl(45 80% 82%)" }}>{site.name}</h3>
                          <div className="flex items-center gap-1.5">
                            <span className={`status-dot ${site.status === "online" ? "status-online" : site.status === "offline" ? "status-offline" : "status-pending"}`} />
                            <span className="text-xs font-golos" style={{ color: site.status === "online" ? "#4ade80" : site.status === "offline" ? "#f87171" : "#facc15" }}>
                              {site.status === "online" ? "В сети" : site.status === "offline" ? "Офлайн" : "Ожидание"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs mt-1 font-mono" style={{ color: "hsl(220 20% 40%)" }}>{site.endpoint}</p>
                        {site.offlineReason && (
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#f87171" }}>
                            <Icon name="AlertCircle" size={11} />
                            {site.offlineReason}
                          </p>
                        )}
                        <div className="flex items-center gap-5 mt-3">
                          <span className="text-xs flex items-center gap-1.5" style={{ color: "hsl(220 20% 50%)" }}>
                            <Icon name="Map" size={12} />
                            {site.paths} путей
                          </span>
                          <span className="text-xs flex items-center gap-1.5" style={{ color: "hsl(220 20% 50%)" }}>
                            <Icon name="Users" size={12} />
                            {site.participants} участников
                          </span>
                          <span className="text-xs font-mono flex items-center gap-1.5" style={{ color: "hsl(260 40% 55%)" }}>
                            <Icon name="Key" size={12} />
                            {site.key}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => { setSettingsSite(site); setShowIntegrationModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-golos transition-all hover:-translate-y-0.5" style={{ background: "hsl(260 40% 18%)", border: "1px solid hsl(260 30% 28%)", color: "hsl(45 60% 75%)" }}>
                        <Icon name="Settings" size={12} />
                        Настройка
                      </button>
                      <button onClick={() => { setDeleteSite(site); setShowDeleteConfirm(true); setShowIntegrationModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-golos transition-all hover:-translate-y-0.5" style={{ background: "hsl(0 30% 15%)", border: "1px solid hsl(0 30% 25%)", color: "#f87171" }}>
                        <Icon name="Trash2" size={12} />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Динамические кнопки от сайтов */}
            <div className="mt-10">
              <div className="ornament-divider mb-6">
                <span className="font-cormorant text-sm italic" style={{ color: "hsl(43 85% 58% / 0.6)" }}>Функции подключённых сайтов</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Тайны: Карта Путей", icon: "Map", site: "Тайны Старого Города" },
                  { name: "Лабиринт: Архив", icon: "Archive", site: "Лабиринт Теней" },
                  { name: "Тайны: Участники", icon: "Users", site: "Тайны Старого Города" },
                  { name: "Добавить функцию", icon: "Plus", site: "" },
                ].map((btn, i) => (
                  <button key={i} className="mystic-card rounded-xl p-4 text-left transition-all hover:-translate-y-0.5" style={{ border: btn.site ? "1px solid hsl(260 30% 22%)" : "1px dashed hsl(260 30% 22%)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: "hsl(260 40% 18%)" }}>
                      <Icon name={btn.icon} size={16} style={{ color: "hsl(43 85% 58%)" }} />
                    </div>
                    <p className="text-sm font-golos font-medium" style={{ color: "hsl(45 60% 75%)" }}>{btn.name}</p>
                    {btn.site && <p className="text-xs mt-0.5" style={{ color: "hsl(220 20% 40%)" }}>{btn.site}</p>}
                  </button>
                ))}
              </div>
            </div>
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
              {MOCK_ACHIEVEMENTS.map((a, i) => (
                <div key={a.id} className="mystic-card rounded-xl p-5 animate-fade-in" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                  <div className="flex items-center gap-5">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-cormorant" style={{ background: "linear-gradient(135deg, hsl(265 55% 30%), hsl(225 60% 25%))", color: "hsl(45 80% 82%)", border: "2px solid hsl(43 85% 58% / 0.3)" }}>
                        {a.avatar}
                      </div>
                      {a.progress === 100 && (
                        <span className="absolute -top-1 -right-1 text-sm" style={{ filter: "drop-shadow(0 0 6px hsl(43 85% 58%))" }}>✦</span>
                      )}
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
                          <div className="h-full rounded-full transition-all" style={{ width: `${a.progress}%`, background: a.progress === 100 ? "linear-gradient(90deg, hsl(43 85% 58%), hsl(38 80% 50%))" : "linear-gradient(90deg, hsl(265 55% 40%), hsl(225 60% 45%))" }} />
                        </div>
                        <span className="text-xs font-mono font-semibold" style={{ color: a.progress === 100 ? "hsl(43 85% 58%)" : "hsl(270 60% 65%)" }}>
                          {a.level}/{a.totalLevels}
                        </span>
                        <span className="text-xs" style={{ color: "hsl(220 20% 40%)" }}>{a.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: "Всего участников", value: "47", icon: "Users" },
                { label: "Активных Путей", value: "15", icon: "Map" },
                { label: "Завершили путь", value: "8", icon: "CheckCircle" },
              ].map((stat, i) => (
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
            <div className="mb-8">
              <h2 className="font-cormorant text-3xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Личный Кабинет</h2>
              <p className="text-sm mt-1" style={{ color: "hsl(220 20% 50%)" }}>Владелец платформы</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-5">
                <div className="mystic-card rounded-xl p-6 text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold font-cormorant animate-glow-pulse" style={{ background: "linear-gradient(135deg, hsl(265 55% 30%), hsl(225 60% 25%))", color: "hsl(43 85% 65%)", border: "2px solid hsl(43 85% 58% / 0.4)" }}>В</div>
                  <h3 className="font-cormorant text-xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Владелец</h3>
                  <p className="text-xs mt-1" style={{ color: "hsl(220 20% 45%)" }}>master@paths.ru</p>
                  <p className="text-xs" style={{ color: "hsl(220 20% 45%)" }}>+7 999 000-00-00</p>
                  <button className="mt-4 w-full py-2 rounded-lg text-sm font-golos transition-all hover:-translate-y-0.5" style={{ background: "hsl(260 40% 18%)", border: "1px solid hsl(260 30% 28%)", color: "hsl(45 60% 75%)" }}>
                    Редактировать профиль
                  </button>
                </div>

                <div className="mystic-card rounded-xl p-5">
                  <h4 className="font-cormorant text-lg font-semibold mb-4" style={{ color: "hsl(45 80% 82%)" }}>Панель управления</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Редактор Квестов", icon: "PenTool" },
                      { label: "Управление участниками", icon: "UserCog" },
                      { label: "Отправить приглашение", icon: "Mail" },
                      { label: "Рассылка сообщений", icon: "Send" },
                      { label: "Настройки платформы", icon: "Settings" },
                    ].map((item, i) => (
                      <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-golos text-left transition-all hover:-translate-y-0.5" style={{ background: "hsl(260 40% 14%)", border: "1px solid hsl(260 30% 22%)", color: "hsl(45 60% 75%)" }}>
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
                  <p className="text-sm mb-4" style={{ color: "hsl(220 20% 50%)" }}>
                    <span className="drop-cap">С</span>оздавайте Пути, уровни и загадки для своих участников
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Создать новый Путь", icon: "Plus", accent: true },
                      { label: "Мои Пути (15)", icon: "List", accent: false },
                      { label: "Загадки и уровни", icon: "Puzzle", accent: false },
                      { label: "Подсказки", icon: "Lightbulb", accent: false },
                    ].map((item, i) => (
                      <button key={i}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-golos transition-all hover:-translate-y-0.5 ${item.accent ? "btn-gold" : ""}`}
                        style={!item.accent ? { background: "hsl(260 40% 14%)", border: "1px solid hsl(260 30% 22%)", color: "hsl(45 60% 75%)" } : {}}>
                        <Icon name={item.icon} size={15} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mystic-card rounded-xl p-6">
                  <h4 className="font-cormorant text-xl font-semibold mb-4" style={{ color: "hsl(45 80% 82%)" }}>Участники</h4>
                  <div className="space-y-3">
                    {["Алексей М.", "Мария В.", "Дмитрий К."].map((name, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(260 40% 12%)", border: "1px solid hsl(260 30% 18%)" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-cormorant" style={{ background: "hsl(265 55% 30%)", color: "hsl(45 80% 82%)" }}>{name[0]}</div>
                          <span className="text-sm font-golos" style={{ color: "hsl(45 60% 75%)" }}>{name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-2.5 py-1 rounded text-xs font-golos transition-all hover:opacity-80" style={{ background: "hsl(260 40% 18%)", color: "hsl(270 60% 65%)" }}>Изменить</button>
                          <button className="px-2.5 py-1 rounded text-xs font-golos transition-all hover:opacity-80" style={{ background: "hsl(260 40% 18%)", color: "hsl(43 85% 55%)" }}>Профиль</button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2.5 rounded-lg text-sm font-golos" style={{ background: "hsl(260 40% 14%)", border: "1px dashed hsl(260 30% 25%)", color: "hsl(220 20% 45%)" }}>
                      + Пригласить участника
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
              <button className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                <Icon name="Send" size={14} />
                <span className="font-cormorant font-semibold">Рассылка всем</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ height: "calc(100vh - 300px)", minHeight: "400px" }}>
              <div className="mystic-card rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b" style={{ borderColor: "hsl(260 25% 18%)" }}>
                  <p className="font-cormorant text-base font-semibold" style={{ color: "hsl(45 80% 75%)" }}>Диалоги</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {["Алексей М.", "Мария В.", "Дмитрий К.", "Елена П."].map((name, i) => (
                    <button key={i} className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:-translate-y-0.5"
                      style={{ background: i === 0 ? "hsl(260 40% 18%)" : "hsl(260 40% 13%)", border: `1px solid ${i === 0 ? "hsl(43 85% 58% / 0.3)" : "hsl(260 30% 18%)"}` }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-cormorant flex-shrink-0" style={{ background: "hsl(265 55% 30%)", color: "hsl(45 80% 82%)" }}>{name[0]}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-golos font-medium truncate" style={{ color: "hsl(45 60% 75%)" }}>{name}</p>
                        <p className="text-xs truncate" style={{ color: "hsl(220 20% 40%)" }}>Последнее сообщение...</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 mystic-card rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "hsl(260 25% 18%)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-cormorant" style={{ background: "hsl(265 55% 30%)", color: "hsl(45 80% 82%)" }}>А</div>
                  <div>
                    <p className="font-golos font-semibold text-sm" style={{ color: "hsl(45 80% 82%)" }}>Алексей М.</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: "#4ade80" }}>
                      <span className="status-dot status-online" />онлайн
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg) => (
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
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      placeholder="Написать сообщение..."
                      className="flex-1 mystic-input px-4 py-2.5 rounded-xl text-sm font-golos"
                    />
                    <button onClick={sendMessage} className="btn-gold px-4 py-2.5 rounded-xl flex items-center gap-2">
                      <Icon name="Send" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ МОДАЛЬНОЕ ОКНО ИНТЕГРАЦИЙ ═══ */}
      {showIntegrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="mystic-card rounded-2xl w-full max-w-lg animate-fade-in-scale" style={{ border: "1px solid hsl(43 85% 58% / 0.2)", boxShadow: "0 0 60px hsl(265 55% 15% / 0.8), 0 0 120px hsl(43 85% 55% / 0.1)" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "hsl(260 25% 18%)" }}>
              <div className="flex items-center gap-3">
                <span className="text-xl" style={{ color: "hsl(43 85% 58%)", filter: "drop-shadow(0 0 8px hsl(43 85% 58% / 0.5))" }}>✦</span>
                <h3 className="font-cormorant text-2xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>
                  {settingsSite ? "Настройка сайта" : showDeleteConfirm ? "Удаление сайта" : "Интеграции"}
                </h3>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: "hsl(260 40% 15%)", color: "hsl(220 20% 50%)" }}>
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
                    <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm font-golos" style={{ background: "hsl(0 50% 30%)", border: "1px solid hsl(0 40% 40%)", color: "#fca5a5" }}>Удалить</button>
                  </div>
                </div>
              )}

              {/* Настройка сайта */}
              {settingsSite && !showDeleteConfirm && (
                <div className="space-y-4">
                  {[
                    { label: "Название сайта", defaultValue: settingsSite.name, placeholder: "" },
                    { label: "Ключ интеграции", defaultValue: settingsSite.key, placeholder: "" },
                    { label: "Endpoint", defaultValue: settingsSite.endpoint, placeholder: "" },
                    { label: "Стиль оформления", defaultValue: "", placeholder: "dark-mystic / light / custom" },
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>{field.label}</label>
                      <input defaultValue={field.defaultValue} placeholder={field.placeholder} className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                    </div>
                  ))}
                  <button onClick={closeModal} className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Сохранить изменения</button>
                </div>
              )}

              {/* Главный экран */}
              {!settingsSite && !showDeleteConfirm && !integrationMode && (
                <div className="space-y-3">
                  <p className="text-sm mb-5" style={{ color: "hsl(220 20% 55%)" }}>
                    <span className="drop-cap">В</span>ыберите режим подключения нового сайта-квеста
                  </p>
                  <button onClick={() => setIntegrationMode("accept")} className="w-full mystic-card rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 flex items-center gap-4" style={{ border: "1px solid hsl(43 85% 58% / 0.2)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(43 60% 20%)" }}>
                      <Icon name="Download" size={18} style={{ color: "hsl(43 85% 58%)" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-cormorant text-lg font-semibold" style={{ color: "hsl(45 80% 82%)" }}>Принять дополнение</p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(220 20% 45%)" }}>Создать новый сайт или принять по ключу</p>
                    </div>
                    <Icon name="ChevronRight" size={16} style={{ color: "hsl(220 20% 40%)" }} />
                  </button>
                  <button onClick={() => setIntegrationMode("add")} className="w-full mystic-card rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 flex items-center gap-4" style={{ border: "1px solid hsl(260 30% 25%)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(260 40% 18%)" }}>
                      <Icon name="PlusCircle" size={18} style={{ color: "hsl(270 60% 65%)" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-cormorant text-lg font-semibold" style={{ color: "hsl(45 80% 82%)" }}>Добавить сайт</p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(220 20% 45%)" }}>Вручную указать ключ и параметры</p>
                    </div>
                    <Icon name="ChevronRight" size={16} style={{ color: "hsl(220 20% 40%)" }} />
                  </button>
                </div>
              )}

              {/* Принять дополнение — выбор */}
              {integrationMode === "accept" && !acceptSubMode && (
                <div className="space-y-3">
                  <button onClick={() => setIntegrationMode(null)} className="flex items-center gap-1.5 text-xs mb-4" style={{ color: "hsl(220 20% 45%)" }}>
                    <Icon name="ArrowLeft" size={12} /> Назад
                  </button>
                  <p className="text-sm mb-5" style={{ color: "hsl(220 20% 55%)" }}>Как подключаем новый сайт?</p>
                  <button onClick={() => setAcceptSubMode("new")} className="w-full mystic-card rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 flex items-center gap-4" style={{ border: "1px solid hsl(43 85% 58% / 0.2)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(43 60% 18%)" }}>
                      <Icon name="Wand2" size={18} style={{ color: "hsl(43 85% 58%)" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-cormorant text-lg font-semibold" style={{ color: "hsl(45 80% 82%)" }}>Создать новый сайт</p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(220 20% 45%)" }}>Автогенерация ключа, endpoint и промта для ИИ</p>
                    </div>
                    <Icon name="ChevronRight" size={16} style={{ color: "hsl(220 20% 40%)" }} />
                  </button>
                  <button onClick={() => setAcceptSubMode("key")} className="w-full mystic-card rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 flex items-center gap-4" style={{ border: "1px solid hsl(260 30% 25%)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(260 40% 18%)" }}>
                      <Icon name="Key" size={18} style={{ color: "hsl(270 60% 65%)" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-cormorant text-lg font-semibold" style={{ color: "hsl(45 80% 82%)" }}>Принять по ключу</p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(220 20% 45%)" }}>Введите ключ от внешнего сайта</p>
                    </div>
                    <Icon name="ChevronRight" size={16} style={{ color: "hsl(220 20% 40%)" }} />
                  </button>
                </div>
              )}

              {/* Новый сайт — автогенерация */}
              {acceptSubMode === "new" && (
                <div>
                  <button onClick={() => setAcceptSubMode(null)} className="flex items-center gap-1.5 text-xs mb-5" style={{ color: "hsl(220 20% 45%)" }}>
                    <Icon name="ArrowLeft" size={12} /> Назад
                  </button>
                  <div className="rounded-xl p-4 mb-4" style={{ background: "hsl(43 40% 10%)", border: "1px solid hsl(43 60% 22%)" }}>
                    <p className="text-xs mb-1 font-golos" style={{ color: "hsl(220 20% 45%)" }}>Сгенерированный ключ интеграции</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm flex-1" style={{ color: "hsl(43 85% 65%)" }}>{generatedKey}</code>
                      <button className="p-1.5 rounded" style={{ background: "hsl(43 40% 18%)", color: "hsl(43 85% 55%)" }}>
                        <Icon name="Copy" size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl p-4 mb-5" style={{ background: "hsl(265 30% 10%)", border: "1px solid hsl(260 30% 22%)" }}>
                    <p className="text-xs mb-2 font-golos" style={{ color: "hsl(220 20% 45%)" }}>Промт для ИИ (скопируйте в Поехали!)</p>
                    <p className="text-xs leading-relaxed font-golos" style={{ color: "hsl(260 40% 65%)" }}>
                      Создай квест-сайт и интегрируй с платформой «Мастер Путей». Ключ: <code className="font-mono" style={{ color: "hsl(43 85% 60%)" }}>{generatedKey}</code>. Endpoint: https://master-putey.ru/api/integration. Добавь кнопку «Интеграции» со статусами «Подключение…», «Успешно», «Ошибка».
                    </p>
                    <button className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ background: "hsl(260 40% 18%)", color: "hsl(270 60% 65%)" }}>
                      <Icon name="Copy" size={12} /> Скопировать промт
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
                    <button onClick={closeModal} className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Подключить</button>
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
                      { key: "name", label: "Название сайта", placeholder: "Мой квест-сайт" },
                      { key: "key", label: "Ключ интеграции", placeholder: "mp_xxxxxxxx" },
                      { key: "endpoint", label: "Endpoint URL", placeholder: "https://mysite.ru/api" },
                      { key: "style", label: "Стиль оформления", placeholder: "dark-mystic" },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>{field.label}</label>
                        <input
                          value={manualForm[field.key as keyof typeof manualForm]}
                          onChange={e => setManualForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos"
                        />
                      </div>
                    ))}
                    <button onClick={closeModal} className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Добавить сайт</button>
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