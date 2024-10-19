'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Stack,
  Text,
  Spinner,
  Checkbox,
  useToast, // Importar useToast
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import UserProfileView from './UserProfileView';
import { FaSave, FaTimes } from 'react-icons/fa';
import config from '../config/env';

const EmployeeForm: React.FC = () => {
  const [username, setUsername] = useState<string>(''); 
  const [email, setEmail] = useState<string>(''); 
  const [firstName, setFirstName] = useState<string>(''); 
  const [lastName, setLastName] = useState<string>(''); 
  const [currentPassword, setCurrentPassword] = useState<string>(''); 
  const [password, setPassword] = useState<string>(''); 
  const [confirmPassword, setConfirmPassword] = useState<string>(''); 
  const [updatePasswordMode, setUpdatePasswordMode] = useState<boolean>(false); 
  const [isEditing, setIsEditing] = useState<boolean>(false); 
  const [loading, setLoading] = useState<boolean>(false); 
  const [initialData, setInitialData] = useState<any>({}); 
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast(); // Hook para manejar los toasts

  useEffect(() => {
    if (pathname === '/profile') {
      const fetchUserProfile = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            toast({
              title: 'Error de autenticación',
              description: 'No hay un token de autenticación.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            setLoading(false);
            return;
          }

          const response = await fetch(`${config.backendHost}/users/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.status === 401) {
            setLoading(false);
            toast({
              title: 'Sesión expirada',
              description: 'Por favor, inicia sesión nuevamente.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            localStorage.removeItem('token');
            router.push('/login');
            return;
          }

          if (response.ok) {
            const userData = await response.json();
            setUsername(userData.usuario || '');
            setEmail(userData.email || '');
            setFirstName(userData.nombre || '');
            setLastName(userData.apellido || '');
            setInitialData({
              usuario: userData.usuario || '',
              email: userData.email || '',
              nombre: userData.nombre || '',
              apellido: userData.apellido || '',
            });
          } else {
            toast({
              title: 'Error al cargar perfil',
              description: 'No se pudieron cargar los datos del perfil.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (err) {
          toast({
            title: 'Error del servidor',
            description: 'Hubo un problema al cargar los datos del perfil.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    }
  }, [pathname]);

  const handleSubmit = async () => {
    if (updatePasswordMode && password !== confirmPassword) {
      toast({
        title: 'Error de validación',
        description: 'Las contraseñas no coinciden.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('token');

    try {
      if (updatePasswordMode) {
        const response = await fetch(`${config.backendHost}/users/me/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: password,
          }),
        });

        if (response.status === 401) {
          setLoading(false);
          toast({
            title: 'Sesión expirada',
            description: 'Por favor, inicia sesión nuevamente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.detail || 'Error desconocido.';
          toast({
            title: 'Error en la actualización',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        setUpdatePasswordMode(false);
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');

        toast({
          title: 'Contraseña actualizada',
          description: 'Tu contraseña ha sido actualizada exitosamente.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        const userPayload = {
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          ...(pathname === '/admin/employee' && { password }), 
        };

        const endpoint = pathname === '/profile' ? '/users/me' : '/users';
        const method = pathname === '/profile' ? 'PUT' : 'POST'; 

        const response = await fetch(`${config.backendHost}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(userPayload),
        });

        if (response.status === 401) {
          setLoading(false);
          toast({
            title: 'Sesión expirada',
            description: 'Por favor, inicia sesión nuevamente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.detail || 'Error desconocido.';
          toast({
            title: 'Error en la solicitud',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        if (pathname === '/profile') {
          setIsEditing(false);
        } else {
          router.push('/admin/employees');
        }

        toast({
          title: 'Usuario creado/actualizado',
          description: 'Los datos se guardaron correctamente.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error en la solicitud',
        description: 'Hubo un problema al procesar la solicitud. Por favor, intenta nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(true); // Permitir la edición de perfil
  };

  const handleCancel = () => {
    setUsername(initialData.usuario);
    setEmail(initialData.email);
    setFirstName(initialData.nombre);
    setLastName(initialData.apellido);
    setIsEditing(false); // Volver a solo lectura
    setUpdatePasswordMode(false); // Cancelar la actualización de contraseña
    setCurrentPassword('');
    setPassword('');
    setConfirmPassword('');
  };

  // Si está cargando los datos del perfil, mostramos el spinner
  if (loading) {
    return (
      <Flex justify="center" align="center" height="85vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Flex minH="85vh" align="start" justify="center" bg="none">
      <Stack spacing={8} mx="auto" maxW="lg" bg="none" pt={16} px={6}>
        <Box rounded="lg" bg="none" p={8}>
          {/* Modo perfil: solo lectura con opciones de edición */}
          {pathname === '/profile' && !isEditing && !updatePasswordMode ? (
            <UserProfileView 
              firstName={firstName}
              lastName={lastName}
              username={username}
              email={email}
              toggleEdit={toggleEdit}
              setUpdatePasswordMode={setUpdatePasswordMode}
            />
          ) : (
            <Stack spacing={4}>
              {/* Modo de edición de perfil o creación de usuario */}
              {!updatePasswordMode && (
                <>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl id="firstName">
                        <FormLabel>Nombre</FormLabel>
                        <Input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Nombre"
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl id="lastName">
                        <FormLabel>Apellido</FormLabel>
                        <Input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Apellido"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl id="username">
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nombre de usuario"
                      disabled={pathname === '/profile' && isEditing}
                    />
                  </FormControl>

                  <FormControl id="email">
                    <FormLabel>Correo Electrónico</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo electrónico"
                    />
                  </FormControl>

                  {/* Campos de contraseña solo visibles en modo de creación de usuario */}
                  {pathname === '/admin/employee' && (
                    <>
                      <FormControl id="password">
                        <FormLabel>Contraseña</FormLabel>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Ingresa una contraseña"
                        />
                      </FormControl>

                      <FormControl id="confirmPassword">
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirma la contraseña"
                        />
                      </FormControl>
                    </>
                  )}
                </>
              )}

              {/* Modo de actualización de contraseña */}
              {updatePasswordMode && (
                <>
                  <FormControl id="currentPassword">
                    <FormLabel>Contraseña Actual</FormLabel>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </FormControl>

                  <FormControl id="password">
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa una nueva contraseña"
                    />
                  </FormControl>

                  <FormControl id="confirmPassword">
                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma la nueva contraseña"
                    />
                  </FormControl>
                </>
              )}

              <Stack direction="row" spacing={4} justifyContent={'center'}>
                <Button
                  leftIcon={<FaSave />}
                  bg="blue.400"
                  color="white"
                  _hover={{ bg: 'blue.500' }}
                  onClick={handleSubmit}
                  isLoading={loading}
                >
                  {pathname === '/profile' ? (updatePasswordMode ? 'Actualizar Contraseña' : 'Guardar Cambios') : 'Crear Usuario'}
                </Button>
                {pathname === '/profile' && (
                  <Button
                    leftIcon={<FaTimes />}
                    bg="red.400"
                    color="white"
                    _hover={{ bg: 'red.500' }}
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                )}
              </Stack>
            </Stack>
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default EmployeeForm;
