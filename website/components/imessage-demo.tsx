"use client"

import { useEffect, useRef, useReducer, useCallback } from "react"

// ─── Script & titles ─────────────────────────────────────────────────────────

const SCRIPT = [
  { type: "me",   text: "yo warriors tonight?" },
  { type: "them", text: "yep vs kings. YES sitting at 61c rn 👀", typing: 1400 },
  { type: "them", text: "pool has $340 in it btw", typing: 0 },
  { type: "me",   text: "ok throw 100 on warriors" },
  { type: "them", text: "bet. proposal up —\n$100 warriors YES @ 61c\npayout $164 if they win 💰", typing: 1800 },
  { type: "them", text: "waiting on jake + mike", typing: 0 },
  { type: "me",   text: "JAKE" },
  { type: "me",   text: "bro vote yes rn" },
  { type: "jake", text: "lol ok fine", typing: 900 },
  { type: "jake", text: "yes", typing: 0 },
  { type: "mike", text: "in", typing: 600 },
  { type: "them", text: "jake in 👍 mike in 👍\n\nbet placed 🎰", typing: 1000 },
  { type: "meme", src: "/images/speed.webp" },
  { type: "ts",   text: "11:48 PM" },
  { type: "them", text: "🏆 warriors won bro\n\ncashed $164, pool sitting at $404 now", typing: 700 },
  { type: "me",   text: "LETSSS GOOOO" },
  { type: "me",   text: "omg" },
  { type: "jake", text: "LETS GOOO", typing: 500 },
  { type: "mike", text: "lmaooo", typing: 400 },
  { type: "them", text: "easy money\n\nceltics game tmrw at 7, want me to find a market?", typing: 1600 },
  { type: "me",   text: "obviously 😈" },
  { type: "meme", src: "/images/joever.jpg" },
] as const

const SENDER_NAMES: Record<string, string> = {
  them: "Teammate",
  jake: "Jake",
  mike: "Mike",
}

const TITLES: { at: number; text: string }[] = [
  { at: 0,  text: "No app." },
  { at: 3,  text: "No UI." },
  { at: 8,  text: "Just text." },
  { at: 11, text: "Wins you money." },
  { at: 16, text: "teammate" },
]

function getTitle(idx: number) {
  let t = TITLES[0]
  for (const entry of TITLES) { if (idx >= entry.at) t = entry }
  return t.text
}

// ─── State ────────────────────────────────────────────────────────────────────

type Msg =
  | { id: number; kind: "ts";   text: string }
  | { id: number; kind: "me" | "them" | "jake" | "mike"; text: string; cont: boolean }
  | { id: number; kind: "meme"; src: string }

type State = {
  messages: Msg[]
  typing: boolean
  title: string
  done: boolean
}

type Action =
  | { type: "ADD"; msg: Msg }
  | { type: "TYPING"; on: boolean }
  | { type: "TITLE"; text: string }
  | { type: "DONE" }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD":    return { ...state, messages: [...state.messages, action.msg] }
    case "TYPING": return { ...state, typing: action.on }
    case "TITLE":  return { ...state, title: action.text }
    case "DONE":   return { ...state, done: true }
  }
}

const INITIAL: State = { messages: [], typing: false, title: "No app.", done: false }

// ─── Component ────────────────────────────────────────────────────────────────

export function IMessageDemo() {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const containerRef = useRef<HTMLDivElement>(null)
  const idxRef       = useRef(0)
  const idCounter    = useRef(0)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pausedRef    = useRef(false)

  const scrollToBottom = useCallback(() => {
    // double rAF: first frame commits DOM, second frame measures and scrolls
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = containerRef.current
        if (el) el.scrollTop = el.scrollHeight
      })
    })
  }, [])

  const schedule = useCallback((fn: () => void, ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(fn, ms)
  }, [])

  const runStep = useCallback(() => {
    const idx = idxRef.current
    if (idx >= SCRIPT.length) { dispatch({ type: "DONE" }); return }

    const item = SCRIPT[idx]
    dispatch({ type: "TITLE", text: getTitle(idx) })

    const isIncoming = item.type === "them" || item.type === "jake" || item.type === "mike"
    const typingMs =
      "typing" in item && item.typing != null
        ? item.typing
        : isIncoming ? 1100 : 0

    const commit = () => {
      const id = idCounter.current++
      const prev = SCRIPT[idx - 1]

      if (item.type === "ts") {
        dispatch({ type: "ADD", msg: { id, kind: "ts", text: item.text } })
      } else if (item.type === "meme") {
        dispatch({ type: "ADD", msg: { id, kind: "meme", src: item.src } })
      } else {
        const cont = !!prev && prev.type === item.type
        dispatch({ type: "ADD", msg: { id, kind: item.type, text: item.text, cont } })
      }

      idxRef.current = idx + 1
      scrollToBottom()
      schedule(runStep, item.type === "me" ? 650 : 750)
    }

    if (typingMs > 0 && isIncoming) {
      dispatch({ type: "TYPING", on: true })
      scrollToBottom()
      schedule(() => {
        dispatch({ type: "TYPING", on: false })
        setTimeout(commit, 80)
      }, typingMs)
    } else {
      commit()
    }
  }, [schedule, scrollToBottom])

  // kick off on mount
  useEffect(() => {
    schedule(runStep, 1000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [runStep, schedule])

  // tap to advance
  const advance = useCallback(() => {
    if (idxRef.current >= SCRIPT.length) return
    if (timerRef.current) clearTimeout(timerRef.current)
    dispatch({ type: "TYPING", on: false })
    runStep()
  }, [runStep])

  return (
    <div
      className="flex flex-col items-center select-none cursor-pointer"
      onClick={advance}
      style={{ WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
    >
      {/* Phone shell */}
      <div
        className="flex flex-col"
        style={{
          width: 375,
          maxWidth: "100%",
          height: 700,
          background: "#1c1c1e",
          borderRadius: 50,
          overflow: "hidden",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Status bar */}
        <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px 0", background: "#1c1c1e" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "white" }}>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 12 }}>
              {[4, 6, 9, 12].map((h, i) => (
                <div key={i} style={{ width: 3, height: h, background: "white", borderRadius: 1 }} />
              ))}
            </div>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
              <path d="M8 2.4C5.6 2.4 3.4 3.4 1.8 5L0 3.2C2.2 1.2 5 0 8 0s5.8 1.2 8 3.2L14.2 5C12.6 3.4 10.4 2.4 8 2.4z"/>
              <path d="M8 6c-1.4 0-2.6.6-3.6 1.4L2.6 5.6C4 4.4 5.9 3.6 8 3.6s4 .8 5.4 2L11.6 7.4C10.6 6.6 9.4 6 8 6z"/>
              <circle cx="8" cy="11" r="1.8"/>
            </svg>
            <div style={{ width: 24, height: 12, border: "1.5px solid white", borderRadius: 3, position: "relative", display: "flex", alignItems: "center", padding: 2 }}>
              <div style={{ width: "75%", height: "100%", background: "#34c759", borderRadius: 1 }} />
              <div style={{ position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)", width: 2.5, height: 5, background: "white", borderRadius: "0 1px 1px 0" }} />
            </div>
          </div>
        </div>

        {/* Chat header */}
        <div style={{ flexShrink: 0, padding: "8px 20px 12px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#1c1c1e" }}>
          <div style={{ fontSize: 28, marginBottom: 2 }}>🏀</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "white" }}>squad bets</div>
          <div style={{ fontSize: 12, color: "#0a84ff", marginTop: 2 }}>jake, mike, teammate &amp; you</div>
        </div>

        {/* Messages */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px 12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            background: "#1c1c1e",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          } as React.CSSProperties}
        >
          <div style={{ textAlign: "center", fontSize: 11, fontWeight: 500, color: "#636366", margin: "10px 0 6px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
            Today 9:41 PM
          </div>

          {state.messages.map((msg) => {
            if (msg.kind === "ts") return (
              <div key={msg.id} className="msg-enter" style={{ textAlign: "center", fontSize: 11, fontWeight: 500, color: "#636366", margin: "10px 0 6px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                {msg.text}
              </div>
            )

            if (msg.kind === "meme") return (
              <div key={msg.id} className="msg-enter" style={{ display: "flex", alignItems: "flex-end", marginRight: 60 }}>
                <div style={{ borderRadius: "18px 18px 18px 5px", overflow: "hidden", maxWidth: 200 }}>
                  <img src={msg.src} alt="" style={{ width: "100%", display: "block" }} />
                </div>
              </div>
            )

            const isMe = msg.kind === "me"
            const senderName = SENDER_NAMES[msg.kind]
            return (
              <div
                key={msg.id}
                className="msg-enter"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                  marginLeft: isMe ? 60 : 0,
                  marginRight: isMe ? 0 : 60,
                }}
              >
                {!isMe && !msg.cont && senderName && (
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#636366", marginBottom: 3, marginLeft: 4 }}>
                    {senderName}
                  </span>
                )}
                <div style={{
                  padding: "9px 13px",
                  borderRadius: isMe
                    ? (msg.cont ? 18 : "18px 18px 5px 18px")
                    : (msg.cont ? 18 : "18px 18px 18px 5px"),
                  fontSize: 15,
                  lineHeight: 1.45,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: isMe ? "#0a84ff" : "#3a3a3c",
                  color: "white",
                }}>
                  {msg.text}
                </div>
              </div>
            )
          })}

          {state.typing && (
            <div className="msg-enter" style={{ display: "flex", alignItems: "flex-end", marginRight: 60 }}>
              <div style={{ background: "#3a3a3c", borderRadius: "18px 18px 18px 5px", padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 0.18, 0.36].map((delay, i) => (
                  <div key={i} style={{ width: 8, height: 8, background: "#ebebf5", opacity: 0.6, borderRadius: "50%", animation: `ripple 1.3s ${delay}s infinite ease-in-out` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{ flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "10px 14px 24px", display: "flex", alignItems: "center", gap: 10, background: "#1c1c1e" }}>
          <div style={{ flex: 1, background: "#2c2c2e", borderRadius: 20, padding: "8px 14px", fontSize: 15, color: "#636366" }}>
            iMessage
          </div>
          <div style={{ width: 32, height: 32, background: "#0a84ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </div>
        </div>
      </div>


      <style>{`
        .msg-enter { animation: msgFadeIn 0.28s ease both; }
        @keyframes msgFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ripple {
          0%, 60%, 100% { transform: scale(1); opacity: 0.4; }
          30% { transform: scale(1.35); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
