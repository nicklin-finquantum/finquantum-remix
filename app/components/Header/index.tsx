// import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';

interface HeaderProps {
  _sidebarOpen: string | boolean | undefined;
  _setSidebarOpen: (arg0: boolean) => void;
}

const Header = ({ _sidebarOpen, _setSidebarOpen }: HeaderProps) => {
  return (
    <header className="bg-transparent sticky top-0 z-999 flex w-full drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="bg-white flex flex-grow items-center justify-between ml-1 p-4 shadow-2 md:px-6 2xl:px-11">
        <div className="hidden sm:block">
          <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="relative">
              {/* Search functionality commented out for now */}
            </div>
          </form>
        </div>
        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <li>
              <a
                href="mailto:customersupport@finquantuminc.com"
                className="text-blue-500 hover:text-blue-600 transition-colors"
              >
                Contact Support
              </a>
            </li>
            {/* <DropdownNotification /> */}
          </ul>
          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

export default Header;
