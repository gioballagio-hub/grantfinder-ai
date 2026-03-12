"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Database,
  Globe,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import "./Sidebar.css";

const NAV_ITEMS = [
  { href: "/", icon: Search, label: "Cerca" },
  { href: "/bandi", icon: Database, label: "Catalogo Bandi" },
  { href: "/fonti-dati", icon: Globe, label: "Fonti Dati" },
  { href: "/come-funziona", icon: HelpCircle, label: "Come Funziona" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Spacer to push content right */}
      <div className="sidebar-spacer" />

      <aside
        className={`sidebar ${expanded ? "expanded" : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo */}
        <a href="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Sparkles size={22} className="text-gold" />
          </div>
          <div className="sidebar-logo-text">
            <span className="text-light font-bold text-sm tracking-tight">
              GrantFinder
            </span>
            <span className="text-gold font-bold text-sm"> AI</span>
          </div>
        </a>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <a
                key={href}
                href={href}
                data-tooltip={label}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                <div className="sidebar-item-icon">
                  <Icon size={20} />
                </div>
                <span className="sidebar-item-label">{label}</span>
              </a>
            );
          })}
        </nav>

        {/* Bottom branding */}
        <div className="sidebar-bottom">
          <div className="sidebar-item-icon">
            <img
              src="/logo_AIXUM_senza_sfondo.png"
              alt="AIXUM"
              className="w-5 h-5 object-contain opacity-50"
            />
          </div>
          <span className="sidebar-item-label text-[11px] text-dark-muted">
            Powered by AIXUM
          </span>
        </div>
      </aside>
    </>
  );
}
