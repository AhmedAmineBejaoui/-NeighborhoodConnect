import { ThemeToggle } from '@/components/theme-toggle';

export function ThemeHeader() {
  return (
    <div className="absolute top-4 right-4 z-50">
      <ThemeToggle />
    </div>
  );
}