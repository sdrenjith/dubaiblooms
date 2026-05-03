import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import Container from '@/components/common/Container';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <Header />
      <div className="h-[76px] sm:h-[84px] lg:h-[88px]" />
      <main className="flex-1 w-full overflow-hidden">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;
