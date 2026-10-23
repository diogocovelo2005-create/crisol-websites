"use client";

import { useState } from "react";
import { contactos } from "@/lib/contactos";

export function WidgetReserva() {
  const [adultos, setAdultos] = useState(2);

  const handleBooking = () => {
    window.open(contactos.booking, "_blank");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] md:flex-row z-30 relative bg-[#FBF9F6]">
      {/* Chegada */}
      <div className="flex-1 border-b border-[#E6E1D6] p-5 md:border-b-0 md:border-r md:p-6 lg:p-8">
        <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#8C857B]">
          Chegada
        </span>
        <div className="group flex cursor-pointer items-center justify-between text-lg text-[#332D27]">
          <span className="group-hover:text-caixilho transition-colors">Escolher data</span>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className="opacity-40 transition-opacity group-hover:opacity-100">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Partida */}
      <div className="flex-1 border-b border-[#E6E1D6] p-5 md:border-b-0 md:border-r md:p-6 lg:p-8">
        <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#8C857B]">
          Partida
        </span>
        <div className="group flex cursor-pointer items-center justify-between text-lg text-[#332D27]">
          <span className="group-hover:text-caixilho transition-colors">Escolher data</span>
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className="opacity-40 transition-opacity group-hover:opacity-100">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Pessoas */}
      <div className="flex-1 border-b border-[#E6E1D6] p-5 md:border-b-0 md:p-6 lg:p-8">
        <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-[#8C857B]">
          Pessoas
        </span>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setAdultos(Math.max(1, adultos - 1))} 
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D5CEC4] text-[#8C857B] transition-colors hover:border-[#332D27] hover:text-[#332D27]"
          >
            <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
              <path d="M0 1H10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <span className="select-none text-lg text-[#332D27]">
            {adultos} {adultos === 1 ? "adulto" : "adultos"}
          </span>
          <button 
            onClick={() => setAdultos(Math.max(15, adultos + 1))} 
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D5CEC4] text-[#8C857B] transition-colors hover:border-[#332D27] hover:text-[#332D27]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M0 5H10M5 0V10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Botão (Textura escura) */}
      <button
        onClick={handleBooking}
        className="flex flex-1 items-center justify-center gap-3 bg-[#42332B] p-6 text-cal transition-colors hover:bg-[#342721] md:p-6 lg:p-8"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)",
        }}
      >
        <span className="text-[13px] font-semibold tracking-widest uppercase">
          Ver no Booking
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3.33337 8H12.6667M12.6667 8L8.00004 3.33331M12.6667 8L8.00004 12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </button>
    </div>
  );
}

