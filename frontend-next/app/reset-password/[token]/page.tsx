import { ResetPasswordPage as Component } from '@/app/_pages/ResetPasswordPage';

export default function Page() {
  return <Component />;
}


export function generateStaticParams() {
  return [{ token: '1' }]; // Fallback ID for static export
}
