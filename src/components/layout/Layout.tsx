import { Sidebar } from './Sidebar';
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const { user } = useStore() ?? { empresa: 'GestãoGraf'};

  

  return (
    <div className="flex min-h-screen bg-background">
      { /* Desktop sidebar */ }
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      { /* Mobile sidebar */ }
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-[var(--sidebar-width)] bg-sidebar text-sidebar-foreground">
          <Sidebar onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      { /* Content area */ }
      <div className="flex-1 min-w-0 flex flex-col">
        { /* Mobile header */ }
        <header className="md:hidden sticky top-0 z-40 bg-background border-b">
          <div className="h-12 px-2 flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="ml-2 text-sm font-medium">Menu {user?.empresa}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
