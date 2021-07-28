import React, { memo } from 'react';
import problemsJSON from '../../public/problems.json';
import Link from 'next/link';

interface Props {
  problems: typeof problemsJSON;
}

export default memo(function ProblemList({ problems }: Props) {
  const contestProblems: { [key: string]: typeof problems } = {};
  problems.forEach(
    (p) =>
      (contestProblems[p.contestId] = contestProblems[p.contestId]
        ? [...contestProblems[p.contestId], p]
        : [p])
  );

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-100 rounded-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contest
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(contestProblems).map(
                  ([contestId, problems], i) => (
                    <tr
                      key={problems[0].contestId}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {contestId.toUpperCase()}
                      </td>
                      {problems.map((p) => (
                        <td
                          key={p.id}
                          className="px-6 py-4 whitespace-nowrap text-sm"
                        >
                          <Link href={`/test_cases/${p.id}`}>
                            <a className="text-blue-500 hover:underline">
                              {p.title}
                            </a>
                          </Link>
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});
