import { redirect } from '@remix-run/node';
import { useState, useEffect } from 'react';

import Header from '~/components/Header';
import Sidebar from '~/components/Sidebar';
import useModal from '~/hooks/useModal';
import { useUser } from '~/hooks/useUser';
import type { USER } from '~/types/user';
import { MEMERS_PATH, ORG_PATH, SIGNIN_URL } from '~/utils/consts';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // const { Modal, setMessage, setOkFunction, handleOkRedirect, openModal } = useModal();

  if (!user && window) {
    window.location.href = SIGNIN_URL;
  }

  // useEffect(() => {
  //   if (!user) {
  //     redirect(SIGNIN_URL);
  //   }

  //   if (
  //     window.location.pathname !== `${ORG_PATH}${MEMERS_PATH}` &&
  //     window.location.pathname !== `${ORG_PATH}/create` &&
  //     !user?.organization
  //   ) {
  //     setMessage(<span>You need to be part of an organization first</span>);
  //     setOkFunction(() => handleOkRedirect(`${ORG_PATH}${MEMERS_PATH}`));
  //     openModal();
  //   }
  // }, [handleOkRedirect, openModal, setMessage, setOkFunction, user]);

  return (
    <div className="page-container dark:bg-boxdark-2 dark:text-bodydark">
      {/* {Modal} */}
      {/* ===== Page Wrapper Start ===== */}
      <div className="flex h-screen overflow-hidden">
        {/* ===== Sidebar Start ===== */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* ===== Sidebar End ===== */}

        {/* ===== Content Area Start ===== */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* ===== Header Start ===== */}
          <Header _sidebarOpen={sidebarOpen} _setSidebarOpen={setSidebarOpen} />
          {/* ===== Header End ===== */}

          {/* ===== Main Content Start ===== */}
          <main>
            <div className="mx-auto px-4 pt-6 md:px-6 2xl:px-10">
              {children}
            </div>
          </main>
          {/* ===== Main Content End ===== */}
        </div>
        {/* ===== Content Area End ===== */}
      </div>
      {/* ===== Page Wrapper End ===== */}
    </div>
  );
};

export default DefaultLayout;
