import React, { memo } from 'react';
import ClipboardCopyButton from '@src/components/ClipboardCopyButton';
import DownloadTextButton from '@src/components/DownloadTextButton';
import CodeBlock from '@src/components/CodeBlock';
import { TestCase } from '@src/pages/test_cases/[problemId]';
import EllipsizedTextWarning from '@src/components/EllipsizedTextWarning';

interface Props {
  testCase: TestCase;
}

export default memo(function TestCaseCard({ testCase }: Props) {
  return (
    <div
      key={testCase.fileName}
      className="p-4 bg-white dark:bg-gray-900 round-md"
    >
      <h3 className="text-xl text-black dark:text-white">
        {testCase.fileName}
      </h3>
      <div className="mt-3">
        <div className="flex items-center">
          <h4 className="w-7 mr-2 text-md">IN</h4>
          <ClipboardCopyButton text={testCase.in} />
          <DownloadTextButton
            fileName={`${testCase.problemId}_in_${testCase.fileName}`}
            text={testCase.in}
          />
        </div>
        <div className="my-1">
          <CodeBlock code={testCase.in.substring(0, 1000)} />
        </div>
        {testCase.in.length > 1000 && <EllipsizedTextWarning />}
      </div>
      <div className="mt-3">
        <div className="flex items-center">
          <h4 className="w-7 mr-2 text-md">OUT</h4>
          <ClipboardCopyButton text={testCase.out} />
          <DownloadTextButton
            fileName={`${testCase.problemId}_out_${testCase.fileName}`}
            text={testCase.out}
          />
        </div>
        <div className="my-1">
          <CodeBlock code={testCase.out.substring(0, 1000)} />
        </div>
        {testCase.out.length > 1000 && <EllipsizedTextWarning />}
      </div>
    </div>
  );
});
