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
      <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100">
        <QRCodeSVG value={value} size={size} level="H" includeMargin={true} />
      </div>
      {ticketCode && (
        <p className="text-sm font-mono font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-xl tracking-widest">
          {ticketCode}
        </p>
      )}
    </div>
  );
}
