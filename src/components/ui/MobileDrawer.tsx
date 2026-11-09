'use client';
import React from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showClose?: boolean;
}

export function MobileDrawer({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  showClose = true,
}: MobileDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[92vh] max-w-md flex-col rounded-t-[32px] bg-card border-t border-border shadow-2xl focus:outline-none">
          {/* iOS Grab Handle */}
          <div className="mx-auto mt-3 h-1.5 w-12 flex-shrink-0 rounded-full bg-muted-foreground/30 active:scale-95 transition-transform" />

          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-border/40">
              <div>
                {title && (
                  <Drawer.Title className="text-lg font-black text-foreground tracking-tight">
                    {title}
                  </Drawer.Title>
                )}
                {description && (
                  <Drawer.Description className="text-xs text-muted-foreground mt-0.5">
                    {description}
                  </Drawer.Description>
                )}
              </div>
              {showClose && (
                <Drawer.Close asChild>
                  <button
                    type="button"
                    aria-label="Tutup"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-90 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Drawer.Close>
              )}
            </div>
          )}

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain hide-scrollbar">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="border-t border-border/40 p-4 safe-area-bottom bg-card/80 backdrop-blur-md">
              {footer}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
