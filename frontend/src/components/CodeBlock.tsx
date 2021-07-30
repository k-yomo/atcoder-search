import React, { memo } from 'react';

interface Props {
  code: string;
}

export default memo(function CodeBlock({ code }: Props) {
  return (
    <pre className="max-h-48 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm overflow-x-scroll overflow-y-scroll dark:text-gray-300">
      <code>{code}</code>
    </pre>
  );
});
