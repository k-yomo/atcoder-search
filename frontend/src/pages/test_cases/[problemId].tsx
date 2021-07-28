import React, { memo, useEffect, useState } from 'react';
import Head from 'next/head';
import fetch from 'isomorphic-unfetch';
import PageLoading from '@src/components/PageLoading';
import TestCaseCard from '@src/components/TestCaseCard';
import { GetStaticPaths, GetStaticProps } from 'next';

export type TestCase = {
  problemId: string;
  fileName: string;
  in: string;
  out: string;
};

interface Props {
  problemId: string;
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  return {
    props: {
      problemId: params?.problemId as string,
    },
    revalidate: 60 * 60 * 24 * 30, // 30days
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default memo(function TestCasePage({ problemId }: Props) {
  const [loading, setLoading] = useState(true);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  useEffect(() => {
    fetch(
      `https://storage.googleapis.com/atcoder-test-cases/${problemId}.json.gz`,
      {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache',
        headers: {
          'Accept-Encoding': 'gzip',
        },
      }
    ).then((res) => {
      res.json().then((data) => {
        data.sort((a: TestCase, b: TestCase) =>
          a.fileName < b.fileName ? -1 : 1
        );
        setTestCases(data);
        setLoading(false);
      });
    });
  }, [problemId]);

  return (
    <>
      <Head>
        <title>{problemId} テストケース - AtCoder Search</title>
        <meta name="description" content={`${problemId}のテストケース`} />
      </Head>
      {loading ? (
        <PageLoading />
      ) : (
        <div className="bg-gray-50">
          <div className="max-w-[1200px] p-4 mx-auto">
            <h1 className="mb-4 text-3xl text-black">{problemId}</h1>
            <div className="space-y-4">
              {testCases.map((testCase) => (
                <TestCaseCard key={testCase.fileName} testCase={testCase} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
});
