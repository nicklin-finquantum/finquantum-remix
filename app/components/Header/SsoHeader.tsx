import { NavLink } from 'react-router-dom';

import Logo from '~/public/images/logo/logo.svg';

const SsoHeader = () => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4">
          <NavLink to="/" className="flex justify-center">
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default SsoHeader;
