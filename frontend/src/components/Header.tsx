import React, { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import GithubIcon from '@src/components/GithubIcon';
import { MoonIcon, SunIcon } from '@heroicons/react/outline';

export default memo(function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header>
      <div className="relative bg-white dark:bg-gray-900 mx-auto px-6 border-b-[1px] border-gray-200 dark:border-gray-900">
        <div className="flex justify-between items-center h-20 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/">
              <a>AtCoder Search</a>
            </Link>
          </div>

          <div className="flex items-center justify-end flex-1">
            <button
              aria-label="DarkModeToggle"
              type="button"
              className="mr-6"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted &&
                (theme === 'dark' ? (
                  <MoonIcon
                    className="text-yellow-500"
                    height={24}
                    width={24}
                  />
                ) : (
                  <SunIcon className="text-orange-500" height={24} width={24} />
                ))}
            </button>
            <a
              className="dark:text-white"
              href="https://github.com/k-yomo/atcoder-search"
            >
              {mounted && <GithubIcon darkMode={theme === 'dark'} />}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
});
