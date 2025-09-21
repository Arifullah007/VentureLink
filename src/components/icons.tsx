import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <path d="M7 16.5A2.5 2.5 0 0 1 9.5 14h1a2.5 2.5 0 0 1 2.5 2.5V21" />
      <path d="M12 21h1.5a2.5 2.5 0 0 0 2.5-2.5V15a2.5 2.5 0 0 0-2.5-2.5h-1A2.5 2.5 0 0 1 10 10V7" />
      <path d="m14 7 3-3 3 3" />
      <path d="M17 4v9" />
    </svg>
  );
}
