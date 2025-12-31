// Placeholder - install with: npx shadcn-ui@latest add dialog
import * as React from 'react';
export const Dialog = ({ children, open, onOpenChange, ...props }: any) => (
  open ? <div {...props}>{children}</div> : null
);
export const DialogContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const DialogHeader = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const DialogTitle = ({ children, ...props }: any) => <h2 {...props}>{children}</h2>;
export const DialogFooter = ({ children, ...props }: any) => <div {...props}>{children}</div>;
