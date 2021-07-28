import React, { memo, useCallback } from 'react';
import { useToast } from '@src/components/Toast';
import { ClipboardCopyIcon } from '@heroicons/react/outline';

export default memo(function ClipboardCopyButton({ text }: { text: string }) {
  const toast = useToast();
  const onClickCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      toast('クリップボードにコピーしました', { type: 'success' });
    });
  }, [toast, text]);
  return (
    <button
      type="button"
      onClick={onClickCopy}
      className="inline-flex items-center px-2 py-1 border-none  shadow-sm text-sm leading-4 font-medium rounded-sm hover:bg-pink-100"
    >
      <ClipboardCopyIcon
        className="-ml-0.5 mr-1 h-4 w-4 text-pink-500"
        aria-hidden="true"
      />
      <span className="text-gray-600">COPY</span>
    </button>
  );
});
