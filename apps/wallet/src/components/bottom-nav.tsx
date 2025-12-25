"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PieChart, ArrowLeftRight, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { cn } from '@repo/ui/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg pb-safe z-50">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          
          <Link href="/" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isActive('/') ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">Inicio</span>
          </Link>

          <Link href="/assets" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isActive('/assets') ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <PieChart className="h-5 w-5" />
            <span className="text-[10px] font-medium">Portafolio</span>
          </Link>

          <div className="relative -top-6">
             <Button size="icon" className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 border-4 border-background hover:scale-105 transition-transform" asChild>
                <Link href="/invest">
                    <Plus className="h-7 w-7" />
                </Link>
             </Button>
          </div>

          <Link href="/exchange" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isActive('/exchange') ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
             <ArrowLeftRight className="h-5 w-5" />
            <span className="text-[10px] font-medium">Exchange</span>
          </Link>

          <Link href="/chat" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isActive('/chat') ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-[10px] font-medium">Chat</span>
          </Link>
        </div>
      </nav>
  )
}
