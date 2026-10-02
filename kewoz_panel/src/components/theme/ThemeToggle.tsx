import { MonitorCog, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/common/useTheme';
import { Button } from '../ui/Button';
import type { ButtonProps } from '../ui/Button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps extends Omit<ButtonProps, 'onClick' | 'size'> { }

export function ThemeToggle({ variant = 'outline', className, ...props }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('light');
  };

  return (
    <Button
      variant='default'
      size="icon"
      className='h-10 w-10 border  rounded-full text-text  '
      onClick={toggleTheme}
      {...props}
    >
      {theme === 'light' && <Sun className="h-5 w-5 " />}
      {theme === 'dark' && <Moon className="h-5 w-5" />}
      {/* {theme === 'system' && <MonitorCog className="h-4 w-4" />} */}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
