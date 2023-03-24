import { Link, LinkProps, useMatchRoute } from '@tanstack/react-location';
import clsx from 'clsx';

const NavItem = (props: LinkProps) => {
  const matchRoute = useMatchRoute();
  const active = Boolean(matchRoute({ to: props.to }));
  return (
    <li className="px-1 text-[50%] lg:px-4 md:text-[100%] md:px-4 sm:text-[70%]">
      <Link
        {...props}
        className={clsx(
          'relative flex items-center h-12 px-1',
          'text-slate-200 hover:text-white hover:drop-shadow shadow-white transition-all',
          'after:h-0.5 after:w-full after:bg-white after:absolute after:bottom-px after:left-0 ',
          'after:shadow after:shadow-white after:transition-all after:origin-center ',
          active ? 'after:scale-100' : 'after:scale-0',
        )}
      />
    </li>
  );
};

export const Header = () => (
  <header className="sticky top-0 w-full z-10 ">
    <nav className="bg-blue-600 shadow-lg fixed w-full">
      <ul className="flex items-center justify-center">
        <NavItem to="/">Home</NavItem>
        <NavItem to="/Login">Login</NavItem>
      </ul>
    </nav>
  </header>
);
