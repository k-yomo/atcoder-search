import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function IndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/test_cases');
  }, [router]);

  return <></>;
}
