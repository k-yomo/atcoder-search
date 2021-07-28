import React, {
  createContext,
  memo,
  useContext,
  useState,
  Fragment,
  PropsWithChildren,
} from 'react';
import { Transition } from '@headlessui/react';
import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationIcon,
  XCircleIcon,
} from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/solid';

type TOAST_TYPE = 'info' | 'success' | 'warning' | 'error' | undefined;

interface ToastState {
  show: boolean;
  message: string;
  type: TOAST_TYPE;
}

interface ToastOption {
  type: TOAST_TYPE;
}

const ToastContext = createContext(function defaultToastContextValue(
  _message: string,
  _option?: ToastOption
) {
  // do nothing.
});

export const ToastProvider = memo(function ToastProvider(
  props: PropsWithChildren<{}>
) {
  const [state, setState] = useState<ToastState>({
    show: false,
    message: '',
    type: undefined,
  });

  const showToast = (message: string, option?: ToastOption) => {
    setState({ show: true, message, type: option?.type || 'info' });
    setTimeout(
      () => setState({ ...state, show: false, message: '', type: undefined }),
      3000
    );
  };

  return (
    <>
      <ToastContext.Provider value={showToast}>
        {props.children}
      </ToastContext.Provider>
      <ToastMessage
        show={state.show}
        message={state.message}
        type={state.type}
        onClose={() => {
          setState({ ...state, show: false });
        }}
      />
    </>
  );
});

export const useToast = () => useContext(ToastContext);

interface ToastMessageProps extends ToastState {
  onClose: () => void;
}

const ToastMessage = memo(function ToastMessage({
  show,
  message,
  type,
  onClose,
}: ToastMessageProps) {
  const renderIcon = () => {
    switch (type) {
      case 'info':
        return (
          <InformationCircleIcon
            className="h-6 w-6 text-blue-400"
            aria-hidden="true"
          />
        );
      case 'success':
        return (
          <CheckCircleIcon
            className="h-6 w-6 text-green-400"
            aria-hidden="true"
          />
        );
      case 'warning':
        return (
          <ExclamationIcon
            className="h-6 w-6 text-yellow-400"
            aria-hidden="true"
          />
        );
      case 'error':
        return (
          <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
        );
    }
  };

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="z-10 fixed inset-4 right-0 flex items-start px-4 py-6 pointer-events-none sm:right-4 sm:p-6"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="opacity-0 translate-y-0 translate-x-2"
            enterTo="opacity-100 translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">{renderIcon()}</div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {message}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
});
