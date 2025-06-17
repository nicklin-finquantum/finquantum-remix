import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import SsoHeader from '~/components/Header/SsoHeader';
import { useUser } from '~/hooks/useUser';

const SsoLayout = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  });

  return (
    <div className="page-container dark:bg-boxdark-2 dark:text-bodydark">
      {/* ===== Page Wrapper Start ===== */}
      <SsoHeader />
      <div className="flex justify-center">
        {/* ===== Main Content Start ===== */}
        <main>
          <div className="mx-auto p-4 md:p-6 2xl:p-10">
            <Outlet />
          </div>
        </main>
      </div>
      {/* ===== Page Wrapper End ===== */}
    </div>
  );
};

export default SsoLayout;
