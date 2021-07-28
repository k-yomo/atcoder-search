import React, { memo } from 'react';
import Link from 'next/link';
import GithubIcon from '@src/components/GithubIcon';

export default memo(function Header() {
  return (
    <header>
      <div className="relative bg-white mx-auto px-6 border-b-[1px] border-gray-200">
        <div className="flex justify-between items-center h-20 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/">
              <a>AtCoder Search</a>
            </Link>
          </div>
          <div className="flex items-center justify-end flex-1">
            <a href="https://github.com/k-yomo/atcoder-search">
              <GithubIcon />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
});
