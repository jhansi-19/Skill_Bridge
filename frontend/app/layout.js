import '@/styles/globals.css';
import { AppProvider } from '@/providers/AppProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';

export const metadata = {
  title: 'SkillBridge — Student Freelance Marketplace',
  description: 'Connect students with clients. Bid on projects, collaborate in real-time, and get paid securely.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppProvider>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
