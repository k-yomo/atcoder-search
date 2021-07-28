import React, { memo } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/outline';

export default memo(function EllipsizedTextWarning() {
  return (
    <div className="flex items-center">
      <ExclamationCircleIcon className="h-4 w-4 mr-1 text-amber-500" />
      <span className="text-sm text-gray-600">
        表示文字列は省略されています
      </span>
    </div>
  );
});
