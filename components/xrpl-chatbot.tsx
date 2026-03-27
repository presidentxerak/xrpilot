"use client"

import { useState, useRef, useEffect } from "react"
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "user" | "bot"
  content: string
}

const QUICK_QUESTIONS = [
  "What is XRP?",
  "How do I create a wallet?",
  "Is my wallet secure?",
  "How do I send XRP?",
  "What are digital objects?",
  "What are the fees?",
]

const KNOWLEDGE_BASE: Record<string, string> = {
  "what is xrp":
    "XRP is the native digital currency of the XRP Ledger (XRPL). Think of it like digital cash that can be sent anywhere in the world in 3-5 seconds, with fees less than a penny. It's not controlled by any single company or government — it's maintained by a global network of computers.",

  "what is xrpl":
    "The XRP Ledger (XRPL) is an open-source, decentralized blockchain. It has been running continuously since 2012. It processes transactions in 3-5 seconds and handles 1,500+ transactions per second. It's used by banks, payment providers, and individuals worldwide.",

  "how do i create a wallet":
    "Creating a wallet with Pilot is simple:\n\n1. Tap 'Create Wallet' on the landing page\n2. Choose a 6-digit PIN to secure your wallet\n3. Your wallet is created instantly on your device\n4. We activate it for free — no purchase needed!\n\nThe whole process takes about 60 seconds.",

  "is my wallet secure":
    "Absolutely! Your wallet uses multiple layers of security:\n\n• AES-256-GCM encryption (the same standard used by banks and governments)\n• Your keys are encrypted with your PIN and never leave your device\n• PBKDF2 key derivation with 600,000 iterations (makes brute-force attacks impractical)\n• No one — not even us — can access your wallet without your PIN",

  "how do i send xrp":
    "Sending XRP is easy:\n\n1. Go to your wallet dashboard and tap 'Send'\n2. Enter the recipient's address (starts with 'r')\n3. Enter the amount of XRP to send\n4. Add a destination tag if needed (some exchanges require this)\n5. Review the details and enter your PIN to confirm\n\nYour payment arrives in 3-5 seconds!",

  "what are digital objects":
    "Digital objects (sometimes called NFTs) are unique digital items stored on the XRP Ledger. They can represent:\n\n• Event tickets\n• Art and collectibles\n• Loyalty coupons\n• Certificates and credentials\n• Domain names\n\nThink of them as digital versions of physical objects that you truly own.",

  "what are the fees":
    "XRP Ledger fees are incredibly low:\n\n• Sending XRP: ~0.00001 XRP (less than $0.00001)\n• Creating a wallet: Free with Pilot (we cover the 1 XRP reserve)\n• No monthly fees, no subscription, no hidden costs\n\nCompare that to bank wire fees of $25-50 or crypto fees on other networks of $1-50+.",

  "what is a recovery key":
    "Your recovery key (also called a seed or secret) is a special code that can restore your wallet on any device. It's like a master password for your wallet.\n\n• Store it somewhere safe and private (written on paper, in a secure note)\n• Never share it with anyone — anyone with this key controls your wallet\n• You can export it from Settings > Security > Recovery Key",

  "what is a destination tag":
    "A destination tag is an optional number attached to a payment. It's mainly used by exchanges (like Coinbase or Binance) to identify which customer a payment belongs to.\n\n• Personal wallets like Pilot don't need one\n• If sending to an exchange, they will provide a destination tag\n• If someone asks for yours, tell them it's a personal wallet and one isn't needed",

  "what is the reserve":
    "The XRP Ledger requires a small minimum balance (reserve) to keep your account active:\n\n• Base reserve: 1 XRP (to keep your account open)\n• Owner reserve: 0.2 XRP per object you own (trust lines, offers, etc.)\n\nThis reserve cannot be spent — it stays in your account. With Pilot, we fund this for you during setup!",

  "how fast is xrp":
    "XRP transactions settle in 3-5 seconds. That's:\n\n• ~600x faster than Bitcoin (~30+ minutes)\n• ~60x faster than Ethereum (~5+ minutes)\n• ~same speed as tapping your credit card, but works globally\n\nThe network can handle 1,500+ transactions per second.",
}

function findAnswer(question: string): string {
  const q = question.toLowerCase().trim()

  // Direct keyword matching
  for (const [key, answer] of Object.entries(KNOWLEDGE_BASE)) {
    if (q.includes(key) || key.split(" ").every((word) => q.includes(word))) {
      return answer
    }
  }

  // Fuzzy matching
  if (q.includes("wallet") && q.includes("creat")) return KNOWLEDGE_BASE["how do i create a wallet"]
  if (q.includes("wallet") && q.includes("secur")) return KNOWLEDGE_BASE["is my wallet secure"]
  if (q.includes("safe")) return KNOWLEDGE_BASE["is my wallet secure"]
  if (q.includes("send") || q.includes("transfer") || q.includes("pay")) return KNOWLEDGE_BASE["how do i send xrp"]
  if (q.includes("nft") || q.includes("object") || q.includes("collecti")) return KNOWLEDGE_BASE["what are digital objects"]
  if (q.includes("fee") || q.includes("cost") || q.includes("price") || q.includes("cheap")) return KNOWLEDGE_BASE["what are the fees"]
  if (q.includes("recovery") || q.includes("seed") || q.includes("backup") || q.includes("secret")) return KNOWLEDGE_BASE["what is a recovery key"]
  if (q.includes("tag") || q.includes("memo")) return KNOWLEDGE_BASE["what is a destination tag"]
  if (q.includes("reserve") || q.includes("minimum") || q.includes("activation")) return KNOWLEDGE_BASE["what is the reserve"]
  if (q.includes("fast") || q.includes("speed") || q.includes("slow") || q.includes("time")) return KNOWLEDGE_BASE["how fast is xrp"]
  if (q.includes("xrp") && !q.includes("xrpl")) return KNOWLEDGE_BASE["what is xrp"]
  if (q.includes("xrpl") || q.includes("ledger") || q.includes("blockchain")) return KNOWLEDGE_BASE["what is xrpl"]

  return "Great question! I don't have a specific answer for that yet. Here are some topics I can help with:\n\n• What is XRP / XRPL?\n• How to create a wallet\n• How to send & receive\n• Security & recovery\n• Fees & reserves\n• Digital objects\n\nTry asking about any of these!"
}

export function XrplChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content:
        "Hi! I'm Pilot Assistant, your guide to the XRP ecosystem. Ask me anything about wallets, XRP, or how to get started!",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = (text?: string) => {
    const question = text ?? input.trim()
    if (!question) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const answer = findAnswer(question)
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        content: answer,
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 600 + Math.random() * 800)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-50 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center",
          "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white",
          "hover:shadow-primary/25 hover:scale-105 active:scale-95",
          isOpen
            ? "bottom-[480px] md:bottom-[540px] right-4 md:right-6 w-10 h-10"
            : "bottom-20 md:bottom-6 right-4 md:right-6 w-14 h-14"
        )}
      >
        {isOpen ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
          </>
        )}
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed z-40 bottom-0 md:bottom-6 right-0 md:right-6 transition-all duration-300",
          "w-full md:w-[400px] md:rounded-2xl overflow-hidden",
          "bg-background border border-border shadow-2xl",
          isOpen
            ? "h-[470px] md:h-[520px] opacity-100 translate-y-0"
            : "h-0 opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Pilot Assistant</p>
              <p className="text-white/70 text-xs">XRPL Expert</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-140px)]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  msg.role === "bot"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {msg.role === "bot" ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[80%] whitespace-pre-line",
                  msg.role === "bot"
                    ? "bg-muted/50 text-foreground rounded-tl-md"
                    : "bg-primary text-primary-foreground rounded-tr-md"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* Quick questions - show when few messages */}
          {messages.length <= 2 && !isTyping && (
            <div className="pt-2 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Popular questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about XRP, wallets, fees..."
              className="flex-1 bg-muted/30 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="rounded-xl w-10 h-10 bg-primary hover:bg-primary/90 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
