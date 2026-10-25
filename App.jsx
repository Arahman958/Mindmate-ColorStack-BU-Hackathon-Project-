
import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "mindmate-conversations";
const JOURNAL_STORAGE_KEY = "mindmate-journal";

const modes = [
  {
    id: "listen",
    icon: "☁",
    title: "Just listen",
    description: "I want to get things off my chest.",
  },
  {
    id: "understand",
    icon: "✳",
    title: "Help me understand",
    description: "Let's untangle what I'm feeling.",
  },
  {
    id: "step",
    icon: "↗",
    title: "One small step",
    description: "Help me figure out what to do next.",
  },
];

function createChat() {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: "New conversation",
    messages: [],
    mode: "listen",
    updatedAt: Date.now(),
  };
}

function loadChats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (chat) =>
            chat &&
            typeof chat.id === "string" &&
            Array.isArray(chat.messages)
        )
      ) {
        return parsed;
      }
    }
  } catch {
    console.warn("MindMate could not load saved conversations.");
  }

  const initialChat = createChat();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([initialChat]));
  } catch {
    // The app can still be used if browser storage is unavailable.
  }

  return [initialChat];
}

function App() {
  const [chats, setChats] = useState(loadChats);
  const [selectedChatId, setSelectedChatId] = useState(
    () => loadChats()[0].id
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [activePage, setActivePage] = useState(() => {
  const savedPage = localStorage.getItem("mindmate-active-page");

  if (["chat", "journal", "meditation"].includes(savedPage)) {
    return savedPage;
  }

  return "chat";
});
  const [journalEntries, setJournalEntries] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
});

const [journalText, setJournalText] = useState("");
const [editingEntryId, setEditingEntryId] = useState(null);
const [meditationDuration, setMeditationDuration] = useState(5);
const [meditationTimeLeft, setMeditationTimeLeft] = useState(300);
const [meditationRunning, setMeditationRunning] = useState(false);

  const currentChat =
    chats.find((chat) => chat.id === selectedChatId) || chats[0];

  const mode = currentChat?.mode || "listen";
  const messages = currentChat?.messages || [];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [chats]);

  useEffect(() => {
  try {
    localStorage.setItem(
      JOURNAL_STORAGE_KEY,
      JSON.stringify(journalEntries)
    );
  } catch (error) {
    console.error("Could not save journal entries:", error);
  }
}, [journalEntries]);


// Save the currently selected page so it survives a refresh.
useEffect(() => {
  try {
    localStorage.setItem("mindmate-active-page", activePage);
  } catch (error) {
    console.error("Could not save the current page:", error);
  }
}, [activePage]);

// Run the meditation countdown.
useEffect(() => {
  if (
    activePage !== "meditation" ||
    !meditationRunning ||
    meditationTimeLeft <= 0
  ) {
    return;
  }

  const timer = setTimeout(() => {
    setMeditationTimeLeft((previousTime) => previousTime - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [activePage, meditationRunning, meditationTimeLeft]);


  function updateChat(chatId, updater) {
    setChats((previous) =>
      previous.map((chat) =>
        chat.id === chatId
          ? { ...updater(chat), updatedAt: Date.now() }
          : chat
      )
    );
  }

  function startNewChat() {
  if (loading) return;

  const chat = createChat();
  setChats((previous) => [chat, ...previous]);
  setSelectedChatId(chat.id);
  setMessage("");
  setActivePage("chat");
}

  function selectChat(chatId) {
  if (loading) return;

  setSelectedChatId(chatId);
  setMessage("");
  setActivePage("chat");
}

  function deleteChat(chatId) {
    if (loading) return;

    const remaining = chats.filter((chat) => chat.id !== chatId);

    if (remaining.length === 0) {
      const freshChat = createChat();
      setChats([freshChat]);
      setSelectedChatId(freshChat.id);
    } else {
      setChats(remaining);

      if (selectedChatId === chatId) {
        setSelectedChatId(remaining[0].id);
      }
    }

    setMessage("");
  }

  async function sendMessage(event) {
    event?.preventDefault();

    const text = message.trim();
    if (!text || loading || !currentChat) return;

    const chatId = currentChat.id;
    const previousMessages = currentChat.messages;

    const updatedMessages = [
      ...previousMessages,
      { role: "user", content: text },
    ];

    updateChat(chatId, (chat) => ({
      ...chat,
      title:
        chat.messages.length === 0
          ? text.slice(0, 36) + (text.length > 36 ? "…" : "")
          : chat.title,
      messages: updatedMessages,
    }));

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: previousMessages.slice(-10),
          mode: currentChat.mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      updateChat(chatId, (chat) => ({
        ...chat,
        messages: [
          ...chat.messages,
          { role: "assistant", content: data.reply },
        ],
      }));
    } catch {
      updateChat(chatId, (chat) => ({
        ...chat,
        messages: [
          ...chat.messages,
          {
            role: "assistant",
            content:
              "I couldn't connect just now. Please check your connection and try again in a moment.",
          },
        ],
      }));
    } finally {
      setLoading(false);
    }
  }

  function saveJournalEntry() {
  const text = journalText.trim();

  if (!text) return;

  if (editingEntryId !== null) {
    setJournalEntries((previousEntries) =>
      previousEntries.map((entry) =>
        entry.id === editingEntryId
          ? { ...entry, text }
          : entry
      )
    );

    setEditingEntryId(null);
    setJournalText("");
    return;
  }

  const newEntry = {
    id: Date.now(),
    text,
    date: new Date().toLocaleString(),
  };

  setJournalEntries((previousEntries) => [
    newEntry,
    ...previousEntries,
  ]);

  setJournalText("");
}

function deleteJournalEntry(id) {
  setJournalEntries((previousEntries) =>
    previousEntries.filter((entry) => entry.id !== id)
  );
}

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="MindMate home">
          <span className="brand-mark">m</span>
          <span>
            mindmate<span className="brand-period">.</span>
          </span>
        </a>

        <span className="header-note">
          <span className="status-dot" />
          A little space for you
        </span>
      </header>

      <div className="app-layout">
        <aside className="sidebar" aria-label="Conversation sidebar">
  <button
    className="new-chat-button"
    onClick={startNewChat}
    disabled={loading}
    type="button"
  >
    <span>＋</span> New chat
  </button>

  <button
    className={`new-chat-button ${activePage === "journal" ? "active" : ""}`}
    onClick={() => setActivePage("journal")}
    type="button"
  >
    <span>✎</span> Journal
  </button>

  <button
  className={`new-chat-button ${activePage === "meditation" ? "active" : ""}`}
  onClick={() => setActivePage("meditation")}
  type="button"
>
  <span>☯</span> Meditation
</button>

  <div className="sidebar-label">YOUR CONVERSATIONS</div>

  <div className="conversation-list">
    {chats.map((chat) => (
      <div
        className={`conversation-item ${
          chat.id === currentChat.id ? "active" : ""
        }`}
        key={chat.id}
      >
        <button
          className="conversation-select"
          type="button"
          onClick={() => selectChat(chat.id)}
          disabled={loading}
          title={chat.title}
        >
          <span className="conversation-icon">◷</span>
          <span className="conversation-title">{chat.title}</span>
        </button>

        <button
          className="delete-chat-button"
          type="button"
          onClick={() => deleteChat(chat.id)}
          disabled={loading}
          aria-label={`Delete ${chat.title}`}
          title="Delete conversation"
        >
          ×
        </button>
      </div>
    ))}
  </div>

  <div className="sidebar-footer">
    <span>MindMate prototype</span>
    <small>Chats are saved in this browser.</small>
  </div>
</aside>

        <section className="main-content">
          {activePage === "journal" ? (
  <section className="journal-panel">
    <div className="journal-heading">
      <p>YOUR PRIVATE SPACE</p>
      <h1>Dear diary.</h1>
      <p>
        Take a moment to check in with yourself.
        Write whatever is on your mind.
      </p>
    </div>

    <textarea
      className="journal-input"
      value={journalText}
      onChange={(event) => setJournalText(event.target.value)}
      placeholder="How are you feeling today? What's on your mind?"
      rows={6}
    />

    <button
      className="new-chat-button"
      type="button"
      onClick={saveJournalEntry}
      disabled={!journalText.trim()}
    >
      Save entry
    </button>

    <div className="journal-entries">
      <h2>Previous entries</h2>

      {journalEntries.length === 0 ? (
        <p>Your entries will appear here when you save them.</p>
      ) : (
        journalEntries.map((entry) => (
          <article className="journal-entry" key={entry.id}>
  <small>{entry.date}</small>
  
<p className="journal-entry-preview">
  {entry.text.split("\n")[0].slice(0, 120)}
  {entry.text.split("\n")[0].length > 120 ? "..." : ""}
</p>


  <button
    type="button"
    onClick={() => {
      setJournalText(entry.text);
      setEditingEntryId(entry.id);
    }}
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() => {
      deleteJournalEntry(entry.id);

      if (editingEntryId === entry.id) {
        setEditingEntryId(null);
        setJournalText("");
      }
    }}
  >
    Delete
  </button>
</article>
        ))
      )}
    </div>
    </section>
) : activePage === "meditation" ? (
  <section className="meditation-panel">
    <div className="meditation-heading">
      <p>TAKE A MOMENT FOR YOURSELF</p>
      <h1>Find your calm.</h1>
      <p>
        Slow down, take a breath, and give yourself a little space.
      </p>
    </div>

    <div className={`breathing-circle ${meditationRunning ? "breathing-active" : ""}`}>
  <span>
    {!meditationRunning
      ? "Ready?"
      : meditationTimeLeft % 8 >= 4
        ? "Breathe in..."
        : "Breathe out..."}
  </span>
</div>
    <div className="meditation-timer">
      {Math.floor(meditationTimeLeft / 60)
        .toString()
        .padStart(2, "0")}
      :
      {(meditationTimeLeft % 60).toString().padStart(2, "0")}
    </div>

    <div className="meditation-controls">
      <label htmlFor="meditation-duration">Session length</label>
      <select
        id="meditation-duration"
        value={meditationDuration}
        onChange={(event) => {
          const minutes = Number(event.target.value);
          setMeditationDuration(minutes);
          setMeditationTimeLeft(minutes * 60);
          setMeditationRunning(false);
        }}
        disabled={meditationRunning}
      >
        <option value={1}>1 minute</option>
        <option value={3}>3 minutes</option>
        <option value={5}>5 minutes</option>
        <option value={10}>10 minutes</option>
      </select>

      <div className="meditation-buttons">
        <button
          type="button"
          onClick={() => setMeditationRunning((running) => !running)}
          disabled={meditationTimeLeft <= 0}
        >
          {meditationRunning ? "Pause" : "Start"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMeditationRunning(false);
            setMeditationTimeLeft(meditationDuration * 60);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  </section>
) : (
  <section className="workspace">
            <aside className="intro">
              <div className="eyebrow">
                <span>✳</span> YOUR SPACE, YOUR PACE
              </div>

              <h1>
                You don't have
                <br />
                to figure it all
                <br />
                <span>out today.</span>
              </h1>

              <p className="intro-copy">
                Whatever is on your mind, there's room for it here.
                No pressure, no judgment. Just a place to start.
              </p>

              <div className="gentle-note">
                <span className="note-icon">☼</span>
                <p>
                  <strong>A gentle reminder</strong>
                  <br />
                  Small steps count. So does simply showing up.
                </p>
              </div>

              <div className="decorative-orbit orbit-one" />
              <div className="decorative-orbit orbit-two" />
            </aside>

            <section className="chat-panel" aria-label="MindMate chat">
              <div className="chat-heading">
                <div className="avatar">m.</div>
                <div>
                  <h2>Your MindMate</h2>
                  <p>Here with you, one message at a time</p>
                </div>
                <span className="online-indicator" title="Ready" />
              </div>

              <div className="chat-body">
                {messages.length === 0 && (
                  <div className="welcome">
                    <div className="welcome-symbol">✳</div>
                    <h3>Hey, I'm glad you're here.</h3>
                    <p>
                      What's been on your mind lately?
                      We can take it one thing at a time.
                    </p>
                  </div>
                )}

                <div className="mode-selector">
                  <div className="prompt-label">
                    HOW WOULD YOU LIKE ME TO HELP?
                  </div>

                  <div className="mode-list">
                    {modes.map((item) => (
                      <button
                        className={`mode-card ${
                          mode === item.id ? "selected" : ""
                        }`}
                        key={item.id}
                        onClick={() =>
                          updateChat(currentChat.id, (chat) => ({
                            ...chat,
                            mode: item.id,
                          }))
                        }
                        type="button"
                        aria-pressed={mode === item.id}
                        disabled={loading}
                      >
                        <span className="mode-icon">{item.icon}</span>
                        <span className="mode-text">
                          <strong>{item.title}</strong>
                          <small>{item.description}</small>
                        </span>
                        <span className="mode-check">
                          {mode === item.id ? "✓" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {messages.length > 0 && (
                  <div className="message-list" aria-live="polite">
                    {messages.map((item, index) => (
                      <div
                        className={`message-row ${
                          item.role === "user" ? "user-row" : ""
                        }`}
                        key={`${index}-${item.role}`}
                      >
                        {item.role === "assistant" && (
                          <span className="message-avatar">m.</span>
                        )}
                        <div className={`message-bubble ${item.role}`}>
                          {item.content}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="message-row">
                        <span className="message-avatar">m.</span>
                        <div className="message-bubble assistant typing">
                          MindMate is thinking<span>.</span>
                          <span>.</span>
                          <span>.</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form className="composer" onSubmit={sendMessage}>
                <label className="sr-only" htmlFor="message-input">
                  Your message
                </label>
                <textarea
                  id="message-input"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Write whatever's on your mind..."
                  rows="2"
                  maxLength="4000"
                  disabled={loading}
                />
                <div className="composer-bottom">
                  <span>Take your time. There's no rush.</span>
                  <button
                    className="send-button"
                    type="submit"
                    disabled={!message.trim() || loading}
                    aria-label="Send message"
                  >
                    {loading ? "…" : "↑"}
                  </button>
                </div>
              </form>

              <p className="disclaimer">
                MindMate offers supportive conversation, not professional
                mental health care or emergency support.
              </p>

                  {storageWarning && (
                <p className="storage-warning" role="alert">
                  Browser storage is unavailable or full. Your latest changes
                  may not survive a refresh.
                </p>
              )}
                        </section>
          </section>
        )}
      </section>
      </div>

      <footer className="page-footer">
        <span>
          mindmate<span className="brand-period">.</span>
        </span>
        <span>Made for the days when you need a little space.</span>
      </footer>
    </main>
  );
}

export default App;
