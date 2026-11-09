'use client';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  ticketCode?: string;
}

export default function QRCodeDisplay({ value, size = 200, ticketCode }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 bg-white rounded-3xl shadow-xl shadow-black/5 border border-border/80">
        <QRCodeSVG value={value} size={size} level="H" includeMargin={true} />
      </div>
      {ticketCode && (
        <p className="text-xs font-mono font-black text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl tracking-widest shadow-sm">
          {ticketCode}
        </p>
      )}
    </div>
  );
}
