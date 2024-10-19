import { Icon } from './lib/chakra';
import {
  MdLock,
  MdAutoAwesome,
  MdOutlineManageAccounts,
} from 'react-icons/md';

// Auth Imports
import { IRoute } from './types/navigation';

const routes: IRoute[] = [
  {
    name: 'Asistente',
    path: '/',
    icon: (
      <Icon as={MdAutoAwesome} width="20px" height="20px" color="inherit" />
    ),
    collapse: false,
    permissionLevel: [],
  },
  {
    name: 'Administración',
    path: '/admin',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    collapse: true,
    permissionLevel: [1, 2],
    items: [
      {
        name: 'Empleados',
        layout: '/admin',
        path: '/employees',
      },
      {
        name: 'Documentos',
        layout: '/admin',
        path: '/documents',
      },
      {
        name: 'Bases de Datos',
        layout: '/admin',
        path: '/databases',
      },
    ],
  },
  {
    name: 'Perfil',
    path: '/profile',
    icon: (
      <Icon
        as={MdOutlineManageAccounts}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    collapse: false,
    permissionLevel: [1, 2, 3],
  },
];

export default routes;
