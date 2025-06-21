import React from 'react';

function authLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex items-center justify-center">{children}</div>
  );
}

export default authLayout;
