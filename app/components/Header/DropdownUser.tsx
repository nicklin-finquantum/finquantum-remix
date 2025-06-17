import { redirect } from '@remix-run/node';
import { Building2, ChevronDown, LogOut, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Separator } from '~/components/ui/separator';
import { useUser } from '~/hooks/useUser';
import {
  ADMIN_PATH,
  LOGOUT_URL,
  MANAGE_PATH,
  MEMERS_PATH,
  ORG_PATH,
  SERVICE_PATH,
} from '~/utils/consts';
import { isSuperAdmin } from '~/utils/utils';

const DropdownUser = () => {
  const { user } = useUser();
  const isAdmin = user ? isSuperAdmin(user) : false;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 hover:bg-transparent"
        >
          <span className="hidden text-sm font-medium lg:block">
            {user?.firstName} {user?.lastName}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <Link
            to={ORG_PATH}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Building2 className="h-4 w-4" />
            <span>Organization</span>
          </Link>

          {/* Organization submenu */}
          <div className="ml-4 space-y-1">
            <Link
              to={`${ORG_PATH}${MEMERS_PATH}`}
              className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              Members
            </Link>
            <Link
              to={`${ORG_PATH}${MANAGE_PATH}`}
              className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              Manage
            </Link>
          </div>

          {isAdmin && (
            <>
              <Separator className="my-2" />
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium">
                <Users className="h-4 w-4" />
                <span>Admin</span>
              </div>

              {/* Admin submenu */}
              <div className="ml-4 space-y-1">
                <Link
                  to={`${ADMIN_PATH}${SERVICE_PATH}`}
                  className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Service
                </Link>
                <Link
                  to={`${ADMIN_PATH}/manage`}
                  className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Manage
                </Link>
              </div>
            </>
          )}

          <Separator className="my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => window.location.href = LOGOUT_URL}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Log Out</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DropdownUser;
