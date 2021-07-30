import React, { memo, useCallback } from 'react';
import { useToast } from '@src/components/Toast';
import { DownloadIcon } from '@heroicons/react/outline';

interface Props {
  fileName: string;
  text: string;
}

export default memo(function DownloadTextButton({ fileName, text }: Props) {
  const toast = useToast();
  const onClickDownload = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      const blob = new Blob([text], { type: 'text/plain' });
      if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, fileName);
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      } else {
        const element = document.createElement('a');
        element.href = URL.createObjectURL(blob);
        element.download = fileName;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
      }
      toast('テストケースをダウンロードしました', { type: 'success' });
    });
  }, [toast, fileName, text]);
  return (
    <button
      type="button"
      onClick={onClickDownload}
      className="inline-flex items-center px-2 py-1 border-none border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm hover:bg-violet-100 dark:hover:bg-violet-800"
    >
      <DownloadIcon
        className="-ml-0.5 mr-1 h-4 w-4 text-violet-500"
        aria-hidden="true"
      />
      <span className="text-gray-600 dark:text-gray-300">DOWNLOAD</span>
    </button>
  );
});
