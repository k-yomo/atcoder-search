import React, { memo } from 'react';

interface Props {
  code: string;
}

export default memo(function CodeBlock({ code }: Props) {
  return (
    <pre className="max-h-48 p-2 bg-gray-50 border border-gray-200 rounded-sm overflow-x-scroll overflow-y-scroll">
      <code>{code}</code>
    </pre>
  );
});
