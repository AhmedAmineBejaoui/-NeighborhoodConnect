import { Moon, Sun, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-context';
import { useTranslations } from '@/lib/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, language, toggleTheme, setLanguage } = useTheme();
  const t = useTranslations(language);

  return (
    <div className="flex items-center space-x-2">
      {/* Bouton Mode Sombre/Clair */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="relative h-9 w-9 rounded-md border border-neutral-200 bg-white/10 backdrop-blur-md hover:bg-white/20 dark:border-neutral-800 dark:bg-black/20 dark:hover:bg-black/30 transition-all duration-300"
        data-testid="toggle-theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">{theme === 'light' ? t.darkMode : t.lightMode}</span>
      </Button>

      {/* Bouton Langue */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 rounded-md border border-neutral-200 bg-white/10 backdrop-blur-md hover:bg-white/20 dark:border-neutral-800 dark:bg-black/20 dark:hover:bg-black/30 transition-all duration-300"
            data-testid="toggle-language"
          >
            <Languages className="h-4 w-4" />
            <span className="sr-only">{t.language}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-800"
        >
          <DropdownMenuItem
            onClick={() => setLanguage('fr')}
            className={`cursor-pointer ${language === 'fr' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
            data-testid="language-french"
          >
            🇫🇷 {t.french}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setLanguage('en')}
            className={`cursor-pointer ${language === 'en' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
            data-testid="language-english"
          >
            🇺🇸 {t.english}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}