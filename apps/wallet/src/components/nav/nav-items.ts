import {
  Building2,
  ArrowLeftRight,
  MessageSquare,
  Wallet,
  User,
  Blocks,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const PROJECTS_ITEM: NavItem = { href: "/invest", label: "Proyectos", icon: Building2 };
export const EXCHANGE_ITEM: NavItem = { href: "/exchange", label: "Exchange", icon: ArrowLeftRight };
export const TOKENIZATION_ITEM: NavItem = { href: "/tokenization", label: "Tokenización", icon: Blocks };
export const CHAT_ITEM: NavItem = { href: "/chat", label: "Chat", icon: MessageSquare };
export const WALLET_ITEM: NavItem = { href: "/assets", label: "Wallet", icon: Wallet };
export const ACCOUNT_ITEM: NavItem = { href: "#account", label: "Cuenta", icon: User };

/** Bottom nav (mobile/tablet) item sets. */
export const BOTTOM_LEFT_ITEMS: NavItem[] = [PROJECTS_ITEM, EXCHANGE_ITEM];
export const BOTTOM_RIGHT_ITEMS: NavItem[] = [CHAT_ITEM, WALLET_ITEM, ACCOUNT_ITEM];

/** Top nav (laptop+) main links. Proyectos/Exchange open the launch notice. */
export const TOP_MAIN_ITEMS: (NavItem & { blocked?: boolean })[] = [
  { ...PROJECTS_ITEM, blocked: true },
  { ...EXCHANGE_ITEM, blocked: true },
  TOKENIZATION_ITEM,
];

/** Prefix match on a path-segment boundary: /exchange is active for /exchange/ABC. */
export function isNavActive(pathname: string | null, href: string) {
  if (!pathname || href.startsWith("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
