"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Badge } from "@repo/ui/components/ui/badge";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  MessageSquare,
  Send,
  Search,
  User,
  Clock,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { formatDateTime } from "@/lib/format";

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    userId: "user-001",
    userName: "Juan Pérez",
    lastMessage: "¿Cuándo estará disponible la tokenización?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    unread: 2,
  },
  {
    id: "2",
    userId: "user-002",
    userName: "María García",
    lastMessage: "Gracias por la información",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unread: 0,
  },
  {
    id: "3",
    userId: "user-003",
    userName: "Carlos Rodríguez",
    lastMessage: "Necesito ayuda con mi inversión",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unread: 1,
  },
];

const mockMessages = {
  "1": [
    {
      id: "m1",
      sender: "user",
      content: "Hola, estoy interesado en invertir en propiedades tokenizadas",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "m2",
      sender: "admin",
      content: "¡Hola! Gracias por tu interés. Estamos encantados de ayudarte.",
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
    },
    {
      id: "m3",
      sender: "user",
      content: "¿Cuándo estará disponible la tokenización?",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
  ],
  "2": [
    {
      id: "m4",
      sender: "user",
      content: "¿Cómo funciona el proceso de inversión?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      id: "m5",
      sender: "admin",
      content:
        "El proceso es simple: 1) Regístrate, 2) Deposita fondos, 3) Invierte en tokens de propiedades",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
    },
    {
      id: "m6",
      sender: "user",
      content: "Gracias por la información",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ],
  "3": [
    {
      id: "m7",
      sender: "user",
      content: "Necesito ayuda con mi inversión",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ],
};

export function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = selectedConversation
    ? mockMessages[selectedConversation as keyof typeof mockMessages] || []
    : [];

  const currentConversation = mockConversations.find(
    (c) => c.id === selectedConversation
  );

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Here you would send the message to the backend
    console.log("Sending message:", message);
    setMessage("");
  };

  return (
    <div className="container py-6 mx-auto max-w-7xl h-[calc(100vh-8rem)]">
      <div className="flex gap-4 h-full">
        {/* Conversations List */}
        <Card className="w-80 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex gap-2 items-center">
              <MessageSquare className="w-5 h-5" />
              Conversaciones
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={cn(
                    "w-full p-3 text-left rounded-lg transition-colors hover:bg-muted",
                    selectedConversation === conversation.id &&
                      "bg-muted border border-primary/20"
                  )}
                >
                  <div className="flex gap-3 items-start">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {conversation.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-sm truncate">
                          {conversation.userName}
                        </p>
                        {conversation.unread > 0 && (
                          <Badge variant="default" className="ml-2 text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex gap-1 items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(conversation.timestamp)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex gap-3 items-center">
                  <Avatar>
                    <AvatarFallback>
                      {currentConversation?.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {currentConversation?.userName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      ID: {currentConversation?.userId}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Perfil
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        msg.sender === "admin" && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {msg.sender === "admin" ? "A" : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "flex-1 max-w-[70%]",
                          msg.sender === "admin" && "flex flex-col items-end"
                        )}
                      >
                        <div
                          className={cn(
                            "p-3 rounded-lg",
                            msg.sender === "admin"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Separator />
              <div className="p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Escribe un mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Presiona Enter para enviar, Shift+Enter para nueva línea
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center flex-1 text-center">
              <MessageSquare className="mb-4 w-16 h-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                Selecciona una conversación
              </h3>
              <p className="text-sm text-muted-foreground">
                Elige un usuario de la lista para comenzar a chatear
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
