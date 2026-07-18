/* eslint-disable @next/next/no-img-element */
export function CerityMark({ className = "" }: { className?: string }) {
  return <img src="/cerity-mark.svg" alt="" className={`block ${className}`} />;
}

export function CerityLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/cerity-logo.svg"
      alt="Cerity Partners"
      className={`block ${className}`}
    />
  );
}

export function CerityLockup({ className = "" }: { className?: string }) {
  return <CerityLogo className={className} />;
}
