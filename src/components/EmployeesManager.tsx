'use client';

import {
  Box,
  Button,
  Flex,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Select,
  Switch,
  Spinner,
  useToast,
  Input,
  Text, // Asegúrate de que Chakra UI esté importando el componente Text
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import config from '../config/env';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
};

const EmployeesManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [originalRoles, setOriginalRoles] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<{ [key: number]: boolean }>({});
  const [changes, setChanges] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [usersPerPage] = useState(5); // Usuarios por página
  const [searchQuery, setSearchQuery] = useState(''); // Búsqueda
  const [sortField, setSortField] = useState<string | null>(null); // Campo para ordenar
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Orden de clasificación
  const toast = useToast(); // Hook para mostrar mensajes de toast
  const router = useRouter();
  const currentUserRole = String(localStorage.getItem('id_rol'));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const id_pasteleria = localStorage.getItem('id_pasteleria');
        const usuario = localStorage.getItem('usuario');

        const response = await fetch(`${config.backendHost}/pastelerias/${id_pasteleria}/usuarios`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setLoading(false);
          toast({
            title: 'Sesión expirada',
            description: 'La sesión ha expirado, por favor inicia sesión nuevamente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Error al cargar los usuarios');
        }

        const data = await response.json();
        const filteredData = data.filter((user: User) => user.username !== usuario);

        setUsers(filteredData);
        const roles = filteredData.reduce((acc: { [key: number]: string }, user: User) => {
          acc[user.id] = user.role;
          return acc;
        }, {});
        setOriginalRoles(roles);
      } catch (err) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los usuarios.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast, router]);

  // Lógica de paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  // Filtrar los usuarios según la búsqueda
  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = filteredUsers.sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = (a[sortField as keyof User] as string) || ''; // Valor de 'a' o vacío si es null/undefined
    const bValue = (b[sortField as keyof User] as string) || ''; // Valor de 'b' o vacío si es null/undefined

    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Usuarios para mostrar en la página actual
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleToggleEnabled = (id: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, enabled: !user.enabled } : user
      )
    );
    setChanges((prevChanges) => ({ ...prevChanges, [id]: true }));
  };

  const handleRoleChange = (id: number, newRole: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, role: newRole } : user
      )
    );
    setChanges((prevChanges) => ({ ...prevChanges, [id]: true }));
  };

  const handleSaveChanges = async (user: User) => {
    try {
      setSaving((prev) => ({ ...prev, [user.id]: true }));
      const token = localStorage.getItem('token');

      const response = await fetch(`${config.backendHost}/users/${user.username}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          disabled: !user.enabled,
          role: String(user.role),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }

      toast({
        title: 'Éxito',
        description: 'Usuario actualizado correctamente.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setChanges((prevChanges) => ({ ...prevChanges, [user.id]: false }));
      setOriginalRoles((prevRoles) => ({ ...prevRoles, [user.id]: user.role }));
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el usuario.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const isRoleReadOnly = (role: string, originalRole: string) => {
    const rolesHierarchy: { [key: string]: number } = { '17': 1, '11': 2, '12': 3 };

    if (!(originalRole in rolesHierarchy) || !(currentUserRole in rolesHierarchy)) {
      return true;
    }

    return rolesHierarchy[currentUserRole] >= rolesHierarchy[originalRole];
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="85vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Flex minH="85vh" align="start" justify="center" bg="none">
      <Stack spacing={8} mx="auto" w="100%" bg="none" maxW="1000px" pt={16} px={6}>
        <Box w="100%" maxW="1000px" mx="auto" p={6} bg="none" rounded="lg">
          <Stack align="center">
            {/* Campo de búsqueda */}
            {users.length > 0 && (
              <Input
                placeholder="Buscar por nombre de usuario o correo"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                mb={4}
                maxW="300px"
              />
            )}
            {users.length > 0 ? (
              <>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th cursor="pointer" onClick={() => handleSort('username')}>
                        Nombre de Usuario {sortField === 'username' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Th>
                      <Th cursor="pointer" onClick={() => handleSort('email')}>
                        Correo Electrónico {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Th>
                      <Th>Rol</Th>
                      <Th>Estado</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentUsers.map((user) => (
                      <Tr key={user.id}>
                        <Td>{user.username}</Td>
                        <Td>{user.email}</Td>
                        <Td>
                          <Select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            isDisabled={isRoleReadOnly(user.role, originalRoles[user.id])}
                          >
                            <option value="11">Administrador</option>
                            <option value="12">Empleado</option>
                          </Select>
                        </Td>
                        <Td>
                          <Switch
                            colorScheme="teal"
                            isChecked={user.enabled}
                            onChange={() => handleToggleEnabled(user.id)}
                            isDisabled={isRoleReadOnly(user.role, originalRoles[user.id])}
                          />
                        </Td>
                        <Td>
                          <Button
                            colorScheme="blue"
                            size="sm"
                            onClick={() => handleSaveChanges(user)}
                            isLoading={saving[user.id]}
                            isDisabled={!changes[user.id]}
                          >
                            <CheckIcon boxSize={4} /> {/* Ícono de guardado */}
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                {/* Paginación */}
                <Flex justify="space-between" align="center" mt={4} w="100%">
                  <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
                    Anterior
                  </Button>
                  <Text>
                    Página {currentPage} de {totalPages}
                  </Text>
                  <Button onClick={goToNextPage} disabled={currentPage === totalPages}>
                    Siguiente
                  </Button>
                </Flex>
              </>
            ) : (
              <p>No hay usuarios registrados</p>
            )}
            <Link href="/admin/employee" passHref>
              <Button as="a" colorScheme="blue" size="sm" mt="10px">
                Nuevo Empleado +
              </Button>
            </Link>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default EmployeesManager;
