import {
  SITEMAP,
  registerAndLoginList,
  userList,
} from '@components/Header/menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { Separator } from '@components/ui/separator';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  isLoggedin: boolean;
  onSignOut: () => void;
};

type List = {
  name: string;
  icon?: JSX.Element;
  url: string;
};

const defaultAvatar = '/header__defaultAvatar.svg';
const fakeAvatar = '/header__fakeAvatar.svg';

const HamburgerBotton = ({ isLoggedin, onSignOut }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="mx-[3px] flex items-center justify-center rounded-full border border-primary p-3 data-[state=open]:mx-0 data-[state=open]:border-4">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
        <Image
          className="ml-2"
          src={isLoggedin ? fakeAvatar : defaultAvatar}
          alt="user"
          width={40}
          height={40}
        />
      </PopoverTrigger>
      <PopoverContent className="h-0 w-0 border-none bg-transparent p-0">
        <div className="no-scrollbar absolute right-[-56px] hidden h-fit max-h-[450px] w-[272px] overflow-scroll rounded-[32px] border-4 border-black bg-surface pt-6 xl:block">
          {isLoggedin ? (
            <>
              {userList.map((user: List) => (
                <Link
                  className="mb-4 flex justify-between px-8 py-2"
                  key={user.name}
                  href={user.url}
                >
                  <div className="text-xl font-semibold">{user.name}</div>
                  {user.icon && user.icon}
                </Link>
              ))}
            </>
          ) : (
            <>
              {registerAndLoginList.map((list: List) => (
                <Link
                  className="mb-4 flex justify-between px-8 py-2"
                  key={list.name}
                  href={list.url}
                >
                  <div className="text-xl font-semibold">{list.name}</div>
                  {list.icon && list.icon}
                </Link>
              ))}
            </>
          )}
          <Separator className="mb-4 h-[1px] bg-primary" />
          {SITEMAP.map((map: List) => (
            <Link
              className="mb-4 flex justify-between px-8 py-2"
              key={map.name}
              href={map.url}
            >
              <div className="text-base">{map.name}</div>
            </Link>
          ))}

          {isLoggedin && (
            <>
              <Separator className="h-[1px] bg-primary" />
              <Link href="/">
                <button
                  type="button"
                  className="block h-[76px] w-full px-8 py-0 text-start text-base"
                  onClick={() => {
                    setIsOpen(false);
                    onSignOut?.();
                  }}
                >
                  登出
                </button>
              </Link>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HamburgerBotton;