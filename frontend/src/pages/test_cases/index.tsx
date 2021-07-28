import React, { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import Fuse from 'fuse.js';
import { SearchIcon } from '@heroicons/react/solid';
import ProblemList from '@src/components/ProblemList';
import problemsJSON from '../../../public/problems.json';

export default function TestCaseListPage() {
  problemsJSON.sort((a, b) => (a.contestId < b.contestId ? -1 : 1));
  const [problems, setProblems] = useState(problemsJSON);
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>();

  const fuse = useMemo(
    () =>
      new Fuse(problemsJSON, {
        keys: [{ name: 'contestId', weight: 2 }, 'title'],
      }),
    []
  );

  const onSearch = useCallback(
    (e) => {
      const keyword = e.target.value.trim();
      setSearchKeyword(keyword);
      if (keyword === '') {
        setProblems(problemsJSON);
      } else {
        setProblems(fuse.search(keyword).map((result) => result.item));
      }
    },
    [fuse]
  );

  return (
    <>
      <Head>
        <title>テストケース一覧 - AtCoder Search</title>
        <meta name="description" content="AtCoderのテストケース一覧ページ" />
      </Head>
      <div className="m-4">
        <h1 className="text-3xl text-black">Test Cases</h1>
        <div className="my-4 max-w-xl w-full lg:max-w-lg">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative text-gray-400 focus-within:text-gray-600">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <SearchIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="search"
              className="block w-full bg-white py-3 pl-10 pr-3 border border-gray-300 rounded-sm leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white focus:border-white"
              placeholder="Search"
              type="search"
              name="search"
              value={searchKeyword}
              onChange={onSearch}
            />
          </div>
        </div>
        <ProblemList problems={problems} />
      </div>
    </>
  );
}
