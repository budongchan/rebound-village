import { ReactNode } from 'react';
import { ConvexReactClient, ConvexProvider } from 'convex/react';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convex = convexUrl
  ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false })
  : undefined;

export function hasConvexDeployment() {
  return Boolean(convex);
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) return <>{children}</>;

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
