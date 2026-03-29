import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

type ParticipantView = "home" | "cabinet" | "quest" | "level";

interface QuestPath {
  id: string;
  name: string;
  site: string;
  description: string;
  locked: boolean;
  lockReason?: string;
  price?: number;
  levels: number;
  completedLevels: number;
  score: number;
  timeSpent: string;
  status: "not_started" | "in_progress" | "completed" | "next";
}

interface QuestLevel {
  id: string;
  number: number;
  title: string;
  riddle: string;
  image?: string;
  type: "text" | "image" | "video" | "audio";
  answer: string;
  hints: string[];
  hintsUsed: number;
  solved: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  isOwner: boolean;
}

const MOCK_PATHS: QuestPath[] = [
  {
    id: "1", name: "Путь Искателя", site: "Тайны Старого Города",
    description: "Семь загадок древнего города ждут тебя. Найди ключ в каждом уровне.",
    locked: false, levels: 7, completedLevels: 4, score: 380, timeSpent: "2ч 14м",
    status: "in_progress"
  },
  {
    id: "2", name: "Путь Мудреца", site: "Тайны Старого Города",
    description: "Для тех, кто постиг первый Путь. Загадки философов и зодчих.",
    locked: false, levels: 5, completedLevels: 0, score: 0, timeSpent: "—",
    status: "not_started"
  },
  {
    id: "3", name: "Путь Теней", site: "Лабиринт Теней",
    description: "Тайный путь. Требует оплаты для открытия.",
    locked: true, lockReason: "Требует оплаты", price: 299,
    levels: 6, completedLevels: 0, score: 0, timeSpent: "—",
    status: "not_started"
  },
  {
    id: "4", name: "Путь Странника", site: "Хроники Забытых",
    description: "Следующий потенциальный Путь. Ещё не открыт.",
    locked: true, lockReason: "Скоро откроется",
    levels: 8, completedLevels: 0, score: 0, timeSpent: "—",
    status: "next"
  },
];

const MOCK_LEVELS: QuestLevel[] = [
  {
    id: "1", number: 1, title: "Врата Города", solved: true,
    riddle: "Я стою у входа с незапамятных времён. В моих камнях хранится имя первого жителя. Что написано на табличке над воротами?",
    type: "image", answer: "ОСНОВАНО", hints: ["Посмотри на верхний камень", "Латинские буквы рядом с датой"],
    hintsUsed: 0,
  },
  {
    id: "2", number: 2, title: "Рыночная Площадь", solved: true,
    riddle: "Торговцы давно ушли, но их секрет остался. Сколько колонн поддерживает крышу старого рынка?",
    type: "text", answer: "12",
    hints: ["Считай только каменные колонны", "Деревянные опоры не считаются"],
    hintsUsed: 1,
  },
  {
    id: "3", number: 3, title: "Башня Звездочёта", solved: true,
    riddle: "Он смотрел на звёзды каждую ночь. В его дневнике записано особое созвездие, которое он видел из этого окна. Назови его.",
    type: "text", answer: "ОРИОН",
    hints: ["Подсказка 1", "Подсказка 2"],
    hintsUsed: 2,
  },
  {
    id: "4", number: 4, title: "Подземный Ход", solved: true,
    riddle: "Под мостом скрыт вход в катакомбы. Найди знак, оставленный хранителем тайны. Что он означает?",
    type: "image", answer: "",
    hints: ["Знак нанесён красным", "Это символ алхимиков"],
    hintsUsed: 0,
  },
  {
    id: "5", number: 5, title: "Комната Зеркал", solved: false,
    riddle: "В этой комнате твоё отражение говорит правду. Сколько раз повторяется слово «истина» на стенах этого зала?",
    type: "text", answer: "7",
    hints: ["Считай все надписи, включая перевёрнутые", "Проверь потолок"],
    hintsUsed: 0,
  },
  {
    id: "6", number: 6, title: "Библиотека Теней", solved: false,
    riddle: "Книга без страниц, слова без букв. Что хранит самая старая полка библиотеки?",
    type: "audio", answer: "",
    hints: ["Слушай, не читай", "Звук важнее текста"],
    hintsUsed: 0,
  },
  {
    id: "7", number: 7, title: "Финальные Врата", solved: false,
    riddle: "Ты прошёл через всё. Последний ответ — это то, что ты нашёл в самом начале. Вернись к началу Пути.",
    type: "text", answer: "ОСНОВАНО",
    hints: ["Первый уровень", "Первый ответ"],
    hintsUsed: 0,
  },
];

const YOOMONEY_URL = "https://yoomoney.ru/to/410017253212598/0";

export default function ParticipantPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ParticipantView>("home");
  const [selectedPath, setSelectedPath] = useState<QuestPath | null>(null);
  const [activeLevel, setActiveLevel] = useState<QuestLevel | null>(null);
  const [levels, setLevels] = useState<QuestLevel[]>(MOCK_LEVELS);
  const [answerInput, setAnswerInput] = useState("");
  const [answerStatus, setAnswerStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [showUnlockAnim, setShowUnlockAnim] = useState(false);
  const [showLockModal, setShowLockModal] = useState<QuestPath | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactText, setContactText] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", text: "Добро пожаловать! Чем могу помочь?", time: "10:00", isOwner: true },
    { id: "2", text: "Не могу понять загадку 3-го уровня", time: "14:22", isOwner: false },
    { id: "3", text: "Обратите внимание на надпись над воротами в описании", time: "14:25", isOwner: true },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [score, setScore] = useState(380);
  const [paths] = useState<QuestPath[]>(MOCK_PATHS);
  // Профиль
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "Алексей М.", email: "aleksey@mail.ru", phone: "+7 900 111-22-33", password: "" });
  const [profileSaved, setProfileSaved] = useState(false);

  const activePath = paths.find(p => p.status === "in_progress");
  const myPaths = paths.filter(p => p.status === "in_progress" || p.status === "not_started" || p.status === "completed");
  const nextPath = paths.find(p => p.status === "next");

  const handleAnswer = () => {
    if (!activeLevel) return;
    const correct = answerInput.trim().toUpperCase() === activeLevel.answer.toUpperCase();
    if (correct) {
      setAnswerStatus("correct");
      setShowUnlockAnim(true);
      setLevels(prev => prev.map(l => l.id === activeLevel.id ? { ...l, solved: true } : l));
      setTimeout(() => {
        setShowUnlockAnim(false);
        setAnswerStatus("idle");
        setAnswerInput("");
        setActiveLevel(null);
        setView("quest");
      }, 2800);
    } else {
      setAnswerStatus("wrong");
      setTimeout(() => setAnswerStatus("idle"), 1500);
    }
  };

  const handleHint = (hintIndex: number) => {
    if (!activeLevel) return;
    setScore(prev => Math.max(0, prev - 50));
    setLevels(prev => prev.map(l => l.id === activeLevel.id ? { ...l, hintsUsed: hintIndex + 1 } : l));
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: chatInput,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      isOwner: false,
    }]);
    setChatInput("");
  };

  const saveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => { setProfileSaved(false); setShowEditProfile(false); }, 1200);
  };

  const sendContact = () => {
    if (!contactText.trim()) return;
    setContactSent(true);
    setTimeout(() => { setContactSent(false); setShowContactForm(false); setContactText(""); setContactName(""); setContactEmail(""); }, 1500);
  };

  const currentLevelInQuest = levels.find(l => !l.solved) || levels[levels.length - 1];

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "hsl(var(--abyss))" }}>
      <div className="starfield" />

      {/* Шапка */}
      <header className="relative z-10 border-b" style={{ borderColor: "hsl(260 25% 18%)", background: "hsl(230 35% 7% / 0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setView("home")} className="flex items-center gap-3">
            <div style={{ filter: "drop-shadow(0 0 10px hsl(43 85% 58% / 0.5))" }}>
              <span className="text-2xl">✦</span>
            </div>
            <div>
              <h1 className="font-cormorant text-xl font-bold" style={{ color: "hsl(43 85% 65%)", letterSpacing: "0.08em" }}>Мастер Путей</h1>
              <p className="text-xs" style={{ color: "hsl(220 20% 40%)", letterSpacing: "0.1em" }}>УЧАСТНИК</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "hsl(43 40% 12%)", border: "1px solid hsl(43 60% 25%)" }}>
              <span className="text-sm">✦</span>
              <span className="font-cormorant font-bold text-base" style={{ color: "hsl(43 85% 65%)" }}>{score}</span>
              <span className="text-xs" style={{ color: "hsl(220 20% 45%)" }}>баллов</span>
            </div>
            <button onClick={() => setView("cabinet")} className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:opacity-80" style={{ background: "hsl(260 40% 15%)", border: "1px solid hsl(260 30% 25%)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-cormorant" style={{ background: "hsl(265 55% 40%)", color: "hsl(45 80% 88%)" }}>А</div>
              <span className="text-sm font-golos" style={{ color: "hsl(45 60% 75%)" }}>{profileForm.name}</span>
            </button>
            <button onClick={() => setShowContactForm(true)} className="p-2 rounded-lg transition-all hover:opacity-80" title="Написать владельцу" style={{ background: "hsl(260 40% 15%)", border: "1px solid hsl(260 30% 25%)", color: "hsl(220 20% 55%)" }}>
              <Icon name="MessageCircle" size={16} />
            </button>
            <button onClick={() => navigate("/auth")} className="p-2 rounded-lg transition-all hover:opacity-80" title="Выйти" style={{ background: "hsl(260 40% 15%)", border: "1px solid hsl(260 30% 25%)", color: "hsl(220 20% 45%)" }}>
              <Icon name="LogOut" size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">

        {/* ═══ ГЛАВНАЯ — список Путей ═══ */}
        {view === "home" && (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="font-cormorant text-4xl font-bold mb-2" style={{ color: "hsl(45 80% 82%)" }}>
                Твои Пути
              </h2>
              <p className="text-sm" style={{ color: "hsl(220 20% 45%)" }}>
                <span className="drop-cap">И</span>зучай загадки, открывай уровни, собирай баллы
              </p>
            </div>

            <div className="grid gap-5">
              {paths.map((path, i) => (
                <div key={path.id}
                  className={`mystic-card rounded-2xl overflow-hidden animate-fade-in ${path.status === "next" ? "opacity-60" : ""}`}
                  style={{ animationDelay: `${i * 0.1}s`, opacity: path.status === "next" ? undefined : 0, border: path.status === "in_progress" ? "1px solid hsl(43 85% 58% / 0.3)" : "1px solid hsl(260 30% 22%)" }}>

                  {/* Цветная полоска статуса */}
                  <div className="h-1" style={{
                    background: path.status === "in_progress" ? "linear-gradient(90deg, hsl(265 55% 40%), hsl(43 85% 55%))" :
                      path.status === "completed" ? "linear-gradient(90deg, hsl(43 85% 55%), hsl(38 80% 45%))" :
                        path.locked ? "hsl(0 40% 30%)" : "hsl(260 40% 25%)"
                  }} />

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          {path.locked && path.status !== "next" && (
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(0 30% 18%)", border: "1px solid hsl(0 30% 28%)" }}>
                              <Icon name="Lock" size={13} style={{ color: "#f87171" }} />
                            </div>
                          )}
                          {path.status === "next" && (
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(260 40% 18%)", border: "1px solid hsl(260 30% 28%)" }}>
                              <Icon name="Sparkles" size={13} style={{ color: "hsl(270 60% 65%)" }} />
                            </div>
                          )}
                          {path.status === "completed" && (
                            <span className="text-lg" style={{ filter: "drop-shadow(0 0 6px hsl(43 85% 58%))" }}>✦</span>
                          )}
                          <h3 className="font-cormorant text-2xl font-bold" style={{ color: path.status === "next" ? "hsl(220 20% 45%)" : "hsl(45 80% 82%)" }}>
                            {path.name}
                          </h3>
                          {path.status === "in_progress" && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-golos" style={{ background: "hsl(43 60% 20%)", color: "hsl(43 85% 65%)", border: "1px solid hsl(43 60% 30%)" }}>в процессе</span>
                          )}
                          {path.status === "next" && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-golos" style={{ background: "hsl(260 40% 15%)", color: "hsl(270 60% 55%)", border: "1px solid hsl(260 30% 25%)" }}>потенциал</span>
                          )}
                        </div>
                        <p className="text-xs mb-1" style={{ color: "hsl(270 40% 55%)" }}>{path.site}</p>
                        <p className="text-sm mb-4 leading-relaxed" style={{ color: "hsl(220 20% 50%)" }}>{path.description}</p>

                        {/* Прогресс */}
                        {!path.locked && path.status !== "next" && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "hsl(220 20% 45%)" }}>
                              <span>Уровни: {path.completedLevels}/{path.levels}</span>
                              {path.score > 0 && (
                                <span className="flex items-center gap-1" style={{ color: "hsl(43 85% 60%)" }}>
                                  <span>✦</span> {path.score} баллов
                                </span>
                              )}
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(230 30% 15%)" }}>
                              <div className="h-full rounded-full" style={{
                                width: `${(path.completedLevels / path.levels) * 100}%`,
                                background: path.status === "completed"
                                  ? "linear-gradient(90deg, hsl(43 85% 58%), hsl(38 80% 50%))"
                                  : "linear-gradient(90deg, hsl(265 55% 40%), hsl(225 60% 45%))"
                              }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Заблокированный — с оплатой */}
                      {path.locked && path.lockReason === "Требует оплаты" && (
                        <>
                          <a href={YOOMONEY_URL} target="_blank" rel="noopener noreferrer"
                            className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl">
                            <Icon name="CreditCard" size={15} />
                            <span className="font-cormorant font-semibold">Оплатить {path.price}₽</span>
                          </a>
                          <button onClick={() => setShowLockModal(path)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-golos" style={{ background: "hsl(260 40% 16%)", border: "1px solid hsl(260 30% 25%)", color: "hsl(220 20% 50%)" }}>
                            <Icon name="Info" size={14} />
                            Подробнее
                          </button>
                        </>
                      )}

                      {/* Потенциальный путь */}
                      {path.status === "next" && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-golos" style={{ background: "hsl(260 40% 13%)", border: "1px dashed hsl(260 30% 22%)", color: "hsl(220 20% 40%)" }}>
                          <Icon name="Clock" size={14} />
                          Скоро откроется
                        </div>
                      )}

                      {/* Активный / не начатый */}
                      {!path.locked && path.status !== "next" && (
                        <button onClick={() => { setSelectedPath(path); setView("quest"); }}
                          className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-xl">
                          <Icon name="Play" size={15} />
                          <span className="font-cormorant font-semibold text-base">
                            {path.status === "in_progress" ? "Продолжить Путь" : path.status === "completed" ? "Просмотреть" : "Начать Путь"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ КАБИНЕТ УЧАСТНИКА ═══ */}
        {view === "cabinet" && (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center gap-3">
              <button onClick={() => setView("home")} className="flex items-center gap-1.5 text-sm" style={{ color: "hsl(220 20% 45%)" }}>
                <Icon name="ArrowLeft" size={14} /> На главную
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Левая колонка — профиль */}
              <div className="space-y-5">
                <div className="mystic-card rounded-2xl p-6 text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold font-cormorant animate-glow-pulse"
                    style={{ background: "linear-gradient(135deg, hsl(265 55% 30%), hsl(225 60% 25%))", color: "hsl(43 85% 65%)", border: "2px solid hsl(43 85% 58% / 0.4)" }}>
                    {profileForm.name[0]}
                  </div>
                  <h3 className="font-cormorant text-xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>{profileForm.name}</h3>
                  <p className="text-xs mt-1" style={{ color: "hsl(220 20% 45%)" }}>{profileForm.email}</p>
                  <p className="text-xs" style={{ color: "hsl(220 20% 40%)" }}>{profileForm.phone}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-base" style={{ filter: "drop-shadow(0 0 5px hsl(43 85% 58%))" }}>✦</span>
                    <span className="font-cormorant text-xl font-bold" style={{ color: "hsl(43 85% 65%)" }}>{score}</span>
                    <span className="text-xs" style={{ color: "hsl(220 20% 45%)" }}>баллов</span>
                  </div>
                  <button onClick={() => setShowEditProfile(true)} className="mt-4 w-full py-2 rounded-lg text-sm font-golos transition-all hover:-translate-y-0.5"
                    style={{ background: "hsl(260 40% 18%)", border: "1px solid hsl(260 30% 28%)", color: "hsl(45 60% 75%)" }}>
                    Редактировать профиль
                  </button>
                </div>

                {/* Кнопки действий */}
                <div className="mystic-card rounded-2xl p-5 space-y-3">
                  <h4 className="font-cormorant text-lg font-semibold mb-4" style={{ color: "hsl(45 80% 75%)" }}>Действия</h4>

                  <a href={YOOMONEY_URL} target="_blank" rel="noopener noreferrer"
                    className="btn-gold w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl">
                    <Icon name="CreditCard" size={15} />
                    <span className="font-cormorant font-semibold">Оплата</span>
                  </a>

                  <button onClick={() => setShowChat(true)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-golos transition-all hover:-translate-y-0.5"
                    style={{ background: "hsl(260 40% 16%)", border: "1px solid hsl(260 30% 25%)", color: "hsl(45 60% 75%)" }}>
                    <Icon name="MessageSquare" size={15} style={{ color: "hsl(270 60% 60%)" }} />
                    Написать владельцу
                  </button>

                  <button onClick={() => setView("home")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-golos transition-all hover:-translate-y-0.5"
                    style={{ background: "hsl(260 40% 16%)", border: "1px solid hsl(260 30% 25%)", color: "hsl(45 60% 75%)" }}>
                    <Icon name="Map" size={15} style={{ color: "hsl(43 85% 55%)" }} />
                    Все Пути
                  </button>
                </div>
              </div>

              {/* Правая колонка — мои пути */}
              <div className="md:col-span-2 space-y-5">
                <div className="mystic-card rounded-2xl p-6">
                  <h4 className="font-cormorant text-xl font-semibold mb-5" style={{ color: "hsl(45 80% 82%)" }}>Мои Пути</h4>
                  <div className="space-y-3">
                    {myPaths.map((path) => (
                      <div key={path.id} className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: "hsl(260 40% 12%)", border: `1px solid ${path.status === "in_progress" ? "hsl(43 85% 58% / 0.3)" : "hsl(260 30% 18%)"}` }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-cormorant text-base font-semibold" style={{ color: "hsl(45 80% 82%)" }}>{path.name}</span>
                            {path.status === "in_progress" && <span className="text-xs px-1.5 py-0.5 rounded font-golos" style={{ background: "hsl(43 60% 18%)", color: "hsl(43 85% 60%)" }}>активен</span>}
                            {path.status === "completed" && <span className="text-xs" style={{ color: "hsl(43 85% 58%)" }}>✦ завершён</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs" style={{ color: "hsl(220 20% 45%)" }}>
                            <span>{path.site}</span>
                            <span>·</span>
                            <span>{path.completedLevels}/{path.levels} уровней</span>
                            {path.score > 0 && <span style={{ color: "hsl(43 85% 58%)" }}>✦ {path.score}</span>}
                            {path.timeSpent !== "—" && <span>⏱ {path.timeSpent}</span>}
                          </div>
                        </div>
                        <button onClick={() => { setSelectedPath(path); setView("quest"); }}
                          className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-golos flex-shrink-0 transition-all hover:-translate-y-0.5"
                          style={{ background: "hsl(260 40% 18%)", border: "1px solid hsl(260 30% 28%)", color: "hsl(45 60% 75%)" }}>
                          <Icon name="Play" size={12} />
                          {path.status === "in_progress" ? "Продолжить" : "Начать"}
                        </button>
                      </div>
                    ))}

                    {/* Следующий потенциальный путь */}
                    {nextPath && (
                      <div className="flex items-center gap-3 p-4 rounded-xl"
                        style={{ background: "hsl(260 40% 10%)", border: "1px dashed hsl(260 30% 20%)" }}>
                        <Icon name="Sparkles" size={16} style={{ color: "hsl(270 60% 50%)" }} />
                        <div>
                          <span className="text-sm font-golos" style={{ color: "hsl(220 20% 50%)" }}>Следующий потенциальный путь:</span>
                          <span className="ml-2 font-cormorant font-semibold" style={{ color: "hsl(270 60% 60%)" }}>{nextPath.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Статистика */}
                <div className="mystic-card rounded-2xl p-6">
                  <h4 className="font-cormorant text-xl font-semibold mb-4" style={{ color: "hsl(45 80% 82%)" }}>Статистика</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Начато Путей", value: "2", icon: "Map" },
                      { label: "Баллов набрано", value: String(score), icon: "Star" },
                      { label: "Подсказок взято", value: "3", icon: "Lightbulb" },
                    ].map((s, i) => (
                      <div key={i} className="text-center p-3 rounded-xl" style={{ background: "hsl(260 40% 13%)", border: "1px solid hsl(260 30% 18%)" }}>
                        <Icon name={s.icon} size={18} className="mx-auto mb-2" style={{ color: "hsl(43 85% 55%)" }} />
                        <p className="font-cormorant text-2xl font-bold" style={{ color: "hsl(43 85% 65%)" }}>{s.value}</p>
                        <p className="text-xs mt-0.5 font-golos" style={{ color: "hsl(220 20% 40%)" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ СПИСОК УРОВНЕЙ КВЕСТА ═══ */}
        {view === "quest" && selectedPath && (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center gap-3">
              <button onClick={() => setView("home")} className="flex items-center gap-1.5 text-sm" style={{ color: "hsl(220 20% 45%)" }}>
                <Icon name="ArrowLeft" size={14} /> Все Пути
              </button>
            </div>

            <div className="mb-8">
              <p className="text-xs mb-1" style={{ color: "hsl(270 40% 55%)" }}>{selectedPath.site}</p>
              <h2 className="font-cormorant text-3xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>{selectedPath.name}</h2>
              <p className="text-sm mt-2" style={{ color: "hsl(220 20% 50%)" }}>{selectedPath.description}</p>

              <div className="flex items-center gap-5 mt-4">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(230 30% 15%)" }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${(levels.filter(l => l.solved).length / levels.length) * 100}%`,
                    background: "linear-gradient(90deg, hsl(265 55% 40%), hsl(43 85% 55%))"
                  }} />
                </div>
                <span className="text-sm font-cormorant font-semibold" style={{ color: "hsl(43 85% 60%)" }}>
                  {levels.filter(l => l.solved).length}/{levels.length}
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              {levels.map((level, i) => {
                const isActive = level.id === currentLevelInQuest?.id;
                const canAccess = level.solved || isActive;
                return (
                  <button key={level.id}
                    disabled={!canAccess}
                    onClick={() => canAccess && !level.solved && (setActiveLevel(level), setView("level"))}
                    className={`mystic-card rounded-xl p-5 text-left w-full transition-all animate-fade-in ${canAccess ? "hover:-translate-y-0.5" : "opacity-40 cursor-not-allowed"}`}
                    style={{ animationDelay: `${i * 0.07}s`, opacity: canAccess ? undefined : undefined, border: isActive ? "1px solid hsl(43 85% 58% / 0.4)" : level.solved ? "1px solid hsl(265 40% 28%)" : "1px solid hsl(260 30% 18%)" }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-cormorant font-bold text-lg"
                        style={{
                          background: level.solved ? "linear-gradient(135deg, hsl(43 85% 45%), hsl(38 75% 38%))" : isActive ? "hsl(265 55% 30%)" : "hsl(260 40% 15%)",
                          color: level.solved ? "hsl(230 35% 10%)" : "hsl(45 80% 75%)",
                          border: isActive ? "2px solid hsl(43 85% 55% / 0.5)" : "none"
                        }}>
                        {level.solved ? "✓" : level.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-cormorant text-lg font-semibold" style={{ color: level.solved ? "hsl(43 85% 65%)" : isActive ? "hsl(45 80% 82%)" : "hsl(220 20% 45%)" }}>
                            {level.title}
                          </span>
                          {level.solved && level.hintsUsed > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-golos" style={{ background: "hsl(260 40% 16%)", color: "hsl(270 50% 60%)" }}>
                              -{level.hintsUsed * 50} баллов
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5 font-golos" style={{ color: "hsl(220 20% 40%)" }}>
                          {level.solved ? "Пройден" : isActive ? "Текущий уровень — нажми чтобы войти" : "Заблокирован"}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {level.solved ? (
                          <Icon name="CheckCircle" size={18} style={{ color: "hsl(43 85% 55%)" }} />
                        ) : isActive ? (
                          <Icon name="ChevronRight" size={18} style={{ color: "hsl(43 85% 55%)" }} />
                        ) : (
                          <Icon name="Lock" size={16} style={{ color: "hsl(220 20% 35%)" }} />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ ПРОХОЖДЕНИЕ УРОВНЯ ═══ */}
        {view === "level" && activeLevel && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="mb-6 flex items-center gap-3">
              <button onClick={() => { setView("quest"); setAnswerStatus("idle"); setAnswerInput(""); }} className="flex items-center gap-1.5 text-sm" style={{ color: "hsl(220 20% 45%)" }}>
                <Icon name="ArrowLeft" size={14} /> Вернуться к уровням
              </button>
            </div>

            {/* Заголовок уровня */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 font-cormorant font-bold text-2xl"
                style={{ background: "linear-gradient(135deg, hsl(265 55% 30%), hsl(225 55% 25%))", color: "hsl(43 85% 65%)", border: "2px solid hsl(43 85% 58% / 0.3)" }}>
                {activeLevel.number}
              </div>
              <h2 className="font-cormorant text-3xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>{activeLevel.title}</h2>
              <p className="text-xs mt-1" style={{ color: "hsl(270 40% 55%)" }}>Уровень {activeLevel.number} · {selectedPath?.name}</p>
            </div>

            {/* Карточка загадки */}
            <div className="mystic-card rounded-2xl p-8 mb-6" style={{ border: "1px solid hsl(260 30% 25%)" }}>
              {activeLevel.type === "image" && (
                <div className="w-full h-48 rounded-xl mb-6 flex items-center justify-center" style={{ background: "hsl(260 40% 14%)", border: "1px solid hsl(260 30% 22%)" }}>
                  <div className="text-center">
                    <Icon name="Image" size={40} style={{ color: "hsl(260 40% 35%)" }} />
                    <p className="text-xs mt-2" style={{ color: "hsl(220 20% 35%)" }}>Изображение уровня</p>
                  </div>
                </div>
              )}
              {activeLevel.type === "audio" && (
                <div className="w-full p-4 rounded-xl mb-6 flex items-center gap-4" style={{ background: "hsl(260 40% 14%)", border: "1px solid hsl(260 30% 22%)" }}>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(265 55% 35%)" }}>
                    <Icon name="Play" size={16} style={{ color: "hsl(45 80% 88%)" }} />
                  </button>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(260 30% 25%)" }} />
                  <span className="text-xs font-mono" style={{ color: "hsl(220 20% 40%)" }}>0:00</span>
                </div>
              )}

              <p className="font-cormorant text-xl leading-relaxed text-center" style={{ color: "hsl(45 80% 82%)" }}>
                {activeLevel.riddle}
              </p>
            </div>

            {/* Ввод ответа */}
            <div className="mystic-card rounded-2xl p-6 mb-5" style={{ border: `1px solid ${answerStatus === "correct" ? "hsl(43 85% 58% / 0.5)" : answerStatus === "wrong" ? "hsl(0 50% 40%)" : "hsl(260 30% 22%)"}` }}>
              <label className="text-xs font-golos mb-3 block" style={{ color: "hsl(220 20% 50%)" }}>Твой ответ</label>
              <div className="flex gap-3">
                <input
                  value={answerInput}
                  onChange={e => setAnswerInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAnswer()}
                  placeholder="Введи ответ..."
                  disabled={answerStatus === "correct"}
                  className="mystic-input flex-1 px-4 py-3 rounded-xl text-base font-cormorant"
                  style={{ fontSize: "1.1rem", letterSpacing: "0.04em" }}
                />
                <button onClick={handleAnswer} disabled={answerStatus === "correct" || !answerInput.trim()}
                  className="btn-gold px-6 py-3 rounded-xl font-cormorant font-semibold text-base disabled:opacity-50">
                  Проверить
                </button>
              </div>

              {answerStatus === "wrong" && (
                <p className="text-sm mt-3 flex items-center gap-2 animate-fade-in" style={{ color: "#f87171" }}>
                  <Icon name="X" size={14} /> Неверно, попробуй ещё раз
                </p>
              )}
            </div>

            {/* Подсказки */}
            <div className="mystic-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-cormorant text-lg font-semibold" style={{ color: "hsl(45 80% 75%)" }}>Подсказки</h4>
                <span className="text-xs font-golos" style={{ color: "hsl(220 20% 40%)" }}>−50 баллов за каждую</span>
              </div>
              <div className="space-y-2">
                {activeLevel.hints.map((hint, i) => {
                  const currentLevel = levels.find(l => l.id === activeLevel.id);
                  const isRevealed = (currentLevel?.hintsUsed ?? 0) > i;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all"
                      style={{ background: isRevealed ? "hsl(265 40% 14%)" : "hsl(260 40% 12%)", border: `1px solid ${isRevealed ? "hsl(265 40% 28%)" : "hsl(260 30% 18%)"}` }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                        style={{ background: isRevealed ? "hsl(265 55% 35%)" : "hsl(260 40% 20%)", color: "hsl(45 80% 75%)" }}>
                        {i + 1}
                      </div>
                      {isRevealed ? (
                        <p className="text-sm font-golos" style={{ color: "hsl(45 70% 75%)" }}>{hint}</p>
                      ) : (
                        <button onClick={() => handleHint(i)} className="text-sm font-golos text-left" style={{ color: "hsl(220 20% 45%)" }}>
                          <span style={{ color: "hsl(270 50% 55%)" }}>Открыть подсказку {i + 1}</span>
                          <span className="ml-2 text-xs" style={{ color: "hsl(0 50% 55%)" }}>−50 баллов</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ АНИМАЦИЯ «ПРОХОД ОТКРЫТ» ═══ */}
      {showUnlockAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "hsl(230 35% 5% / 0.92)", backdropFilter: "blur(12px)" }}>
          <div className="text-center animate-fade-in-scale">
            {/* Золотое сияние */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full animate-glow-pulse" style={{ background: "radial-gradient(circle, hsl(43 85% 55% / 0.3) 0%, transparent 70%)", transform: "scale(2)" }} />
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(43 85% 45%), hsl(38 75% 35%))", border: "3px solid hsl(43 90% 65%)", boxShadow: "0 0 40px hsl(43 85% 55% / 0.6)" }}>
                <Icon name="Unlock" size={40} style={{ color: "hsl(230 35% 8%)" }} />
              </div>
            </div>

            {/* Золотая кнопка с оттиском */}
            <div className="btn-gold inline-flex items-center gap-3 px-10 py-4 rounded-2xl mb-4" style={{ fontSize: "1.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, letterSpacing: "0.1em", boxShadow: "0 0 40px hsl(43 85% 55% / 0.5), inset 0 1px 0 hsl(45 100% 75% / 0.4)" }}>
              <span style={{ fontSize: "1.2rem" }}>✦</span>
              ПРОХОД ОТКРЫТ
              <span style={{ fontSize: "1.2rem" }}>✦</span>
            </div>

            <p className="font-cormorant text-xl" style={{ color: "hsl(270 60% 70%)" }}>Следующий уровень разблокирован</p>

            {/* Частицы */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute animate-float"
                  style={{
                    left: `${10 + (i * 8)}%`, top: `${20 + (i % 4) * 15}%`,
                    fontSize: "1.2rem",
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: `${2 + (i % 3)}s`,
                    filter: "drop-shadow(0 0 6px hsl(43 85% 58%))",
                    opacity: 0.6 + (i % 3) * 0.1,
                    color: "hsl(43 85% 65%)"
                  }}>✦</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ МОДАЛ — заблокированный путь ═══ */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={() => setShowLockModal(null)}>
          <div className="mystic-card rounded-2xl w-full max-w-sm animate-fade-in-scale p-6 text-center" style={{ border: "1px solid hsl(260 30% 28%)" }} onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "hsl(0 30% 15%)", border: "1px solid hsl(0 30% 28%)" }}>
              <Icon name="Lock" size={24} style={{ color: "#f87171" }} />
            </div>
            <h3 className="font-cormorant text-2xl font-bold mb-2" style={{ color: "hsl(45 80% 82%)" }}>{showLockModal.name}</h3>
            <p className="text-sm mb-2" style={{ color: "hsl(220 20% 50%)" }}>{showLockModal.description}</p>
            <p className="text-sm mb-6" style={{ color: "#f87171" }}>{showLockModal.lockReason}</p>
            {showLockModal.price && (
              <a href={YOOMONEY_URL} target="_blank" rel="noopener noreferrer"
                className="btn-gold w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl mb-3">
                <Icon name="CreditCard" size={16} />
                <span className="font-cormorant font-semibold text-base">Оплатить {showLockModal.price}₽ и открыть</span>
              </a>
            )}
            <button onClick={() => setShowLockModal(null)} className="w-full py-2 rounded-lg text-sm font-golos" style={{ background: "hsl(260 40% 15%)", border: "1px solid hsl(260 30% 22%)", color: "hsl(220 20% 50%)" }}>Закрыть</button>
          </div>
        </div>
      )}

      {/* ═══ ФОРМА ОБРАЩЕНИЯ (незарегистрированные) ═══ */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={() => setShowContactForm(false)}>
          <div className="mystic-card rounded-2xl w-full max-w-md animate-fade-in-scale p-6" style={{ border: "1px solid hsl(260 30% 28%)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-cormorant text-2xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Сообщить владельцу</h3>
              <button onClick={() => setShowContactForm(false)} className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "hsl(220 20% 45%)" }}>
                <Icon name="X" size={15} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>Ваше имя</label>
                <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Имя" className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
              </div>
              <div>
                <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>Email</label>
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="email@mail.ru" className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
              </div>
              <div>
                <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>Сообщение</label>
                <textarea value={contactText} onChange={e => setContactText(e.target.value)} placeholder="Опишите вопрос или проблему..." rows={4}
                  className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos resize-none" />
              </div>
              {contactSent ? (
                <div className="w-full py-3 rounded-xl text-center font-cormorant font-semibold text-base flex items-center justify-center gap-2 animate-fade-in" style={{ background: "hsl(43 40% 18%)", color: "hsl(43 85% 58%)" }}>
                  <Icon name="CheckCircle" size={18} /> Отправлено!
                </div>
              ) : (
                <button onClick={sendContact} className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Отправить</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ МОДАЛ РЕДАКТИРОВАНИЯ ПРОФИЛЯ ═══ */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={() => setShowEditProfile(false)}>
          <div className="mystic-card rounded-2xl w-full max-w-md animate-fade-in-scale p-6" style={{ border: "1px solid hsl(260 30% 28%)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-cormorant text-2xl font-bold" style={{ color: "hsl(45 80% 82%)" }}>Редактировать профиль</h3>
              <button onClick={() => setShowEditProfile(false)} style={{ color: "hsl(220 20% 45%)" }}><Icon name="X" size={16} /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: "name", label: "Имя", type: "text" },
                { key: "email", label: "Email", type: "email" },
                { key: "phone", label: "Телефон", type: "text" },
                { key: "password", label: "Новый пароль", type: "password" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-golos mb-1.5 block" style={{ color: "hsl(220 20% 50%)" }}>{f.label}</label>
                  <input value={profileForm[f.key as keyof typeof profileForm]}
                    onChange={e => setProfileForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    type={f.type} placeholder={f.key === "password" ? "Оставьте пустым, если не меняете" : ""}
                    className="mystic-input w-full px-4 py-2.5 rounded-xl text-sm font-golos" />
                </div>
              ))}
              {profileSaved ? (
                <div className="w-full py-3 rounded-xl text-center font-cormorant font-semibold flex items-center justify-center gap-2" style={{ background: "hsl(43 40% 18%)", color: "hsl(43 85% 58%)" }}>
                  <Icon name="CheckCircle" size={18} /> Сохранено!
                </div>
              ) : (
                <button onClick={saveProfile} className="w-full btn-gold py-3 rounded-xl font-cormorant font-semibold text-base">Сохранить</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ЧАТ С ВЛАДЕЛЬЦЕМ (в кабинете участника) ═══ */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={() => setShowChat(false)}>
          <div className="mystic-card rounded-2xl w-full max-w-md animate-fade-in-scale flex flex-col" style={{ border: "1px solid hsl(260 30% 28%)", height: "520px" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "hsl(260 25% 18%)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold font-cormorant" style={{ background: "linear-gradient(135deg, hsl(265 55% 30%), hsl(225 55% 25%))", color: "hsl(43 85% 65%)" }}>В</div>
                <div>
                  <p className="font-cormorant font-semibold" style={{ color: "hsl(45 80% 82%)" }}>Владелец</p>
                  <p className="text-xs flex items-center gap-1" style={{ color: "#4ade80" }}>
                    <span className="status-dot status-online" /> онлайн
                  </p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "hsl(220 20% 45%)" }}>
                <Icon name="X" size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${!msg.isOwner ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[75%]">
                    <div className="px-4 py-2.5 rounded-2xl" style={{
                      background: !msg.isOwner ? "linear-gradient(135deg, hsl(265 55% 32%), hsl(43 60% 32%))" : "hsl(230 30% 13%)",
                      border: !msg.isOwner ? "none" : "1px solid hsl(260 30% 22%)",
                      color: "hsl(45 80% 88%)",
                      borderTopRightRadius: !msg.isOwner ? "4px" : undefined,
                      borderTopLeftRadius: msg.isOwner ? "4px" : undefined,
                    }}>
                      <p className="text-sm font-golos">{msg.text}</p>
                    </div>
                    <p className={`text-xs mt-1 ${!msg.isOwner ? "text-right" : ""}`} style={{ color: "hsl(220 20% 35%)" }}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t" style={{ borderColor: "hsl(260 25% 18%)" }}>
              <div className="flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChatMessage()}
                  placeholder="Написать владельцу..." className="flex-1 mystic-input px-4 py-2.5 rounded-xl text-sm font-golos" />
                <button onClick={sendChatMessage} className="btn-gold px-4 py-2.5 rounded-xl">
                  <Icon name="Send" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}