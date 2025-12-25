"use client";

import { useState } from "react";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Send, Bot, User, Search, Settings } from "lucide-react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "¡Hola! Soy tu asistente de Real Invest. ¿En qué puedo ayudarte hoy? Puedo buscar oportunidades, explicarte cómo funcionan los tokens o avisarte cuando haya algo nuevo." },
    { role: "user", content: "Avisame cuando haya una oportunidad para invertir en pozo con ROI mayor al 15%" },
    { role: "assistant", content: "¡Entendido! He configurado una alerta para proyectos en pozo con un ROI estimado superior al 15%. Te notificaré en cuanto se publiquen." }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // In a real app, you would call an AI API here
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      <div className="p-4 border-b flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Asistente AI</h1>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-muted-foreground">En línea</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 pb-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[85%] ${
                  message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0 border">
                  {message.role === "assistant" ? (
                    <>
                      <AvatarImage src="/bot-avatar.png" />
                      <AvatarFallback className="bg-primary/5 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/user-avatar.png" />
                      <AvatarFallback className="bg-muted">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    message.role === "assistant"
                      ? "bg-card border text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-background/80 backdrop-blur-md border-t shrink-0">
        <div className="flex gap-2 max-w-2xl mx-auto items-center">
          <Input 
            placeholder="Preguntame lo que quieras..." 
            className="rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-11"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button size="icon" className="rounded-full h-11 w-11 shrink-0" onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
            AI puede cometer errores. Verifica la información financiera.
        </p>
      </div>
    </div>
  );
}
