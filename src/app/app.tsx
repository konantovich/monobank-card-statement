import { Outlet, ReactLocation, Route, Router } from '@tanstack/react-location';
import { CenteredLayout } from '~/components';
import { Login } from '~/pages';
import { Header } from './header';

const Welcome = () => (
  <CenteredLayout className="gap-4">
    <div className="text-3xl">Welcome!</div>
    <div></div>
  </CenteredLayout>
);

const reactLocation = new ReactLocation();

const routes: Route[] = [
  {
    path: '/',
    element: <Welcome />,
  },
  {
    path: '/Login',
    element: <Login />,
  },
  
 
];

export const App = () => (
  <Router location={reactLocation} routes={routes}>
    <Header />
    <Outlet />
  </Router>
);
