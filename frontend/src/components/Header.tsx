import React, { memo } from 'react';
import Link from 'next/link';

export default memo(function Header() {
  return (
    <header>
      <div className="relative bg-white mx-auto pl-8 pr-4 sm:px-6 border-b-[1px] border-gray-200">
        <div className="flex justify-between items-center h-20 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/">
              <a>AtCoder Search</a>
            </Link>
          </div>
          <div className="flex items-center justify-end flex-1"></div>
        </div>
      </div>
    </header>
  );
});
