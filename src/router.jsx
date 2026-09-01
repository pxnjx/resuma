import { useEffect, useState } from 'react';

// Minimal hash-based router — zero dependencies and works on any
// static host (no server rewrites needed), matching `base: './'`.
// Routes: #/  #/dashboard  #/templates  #/builder/:id

function currentRoute() {
  const hash = window.location.hash || '';
  if (!hash.startsWith('#')) return '/';
  return hash.slice(1) || '/';
}

export function useHashRoute() {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function navigate(to) {
  if (window.location.hash === '#' + to) return;
  window.location.hash = to;
}

// Anchor-styled link that keeps the hash router in sync.
export function Link({ to, children, ...rest }) {
  return (
    <a
      href={'#' + to}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
