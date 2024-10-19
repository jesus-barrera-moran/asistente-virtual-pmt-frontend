'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  Link,
  useColorModeValue,
  useToast,  // Importamos useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '../config/env';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const toast = useToast();  // Hook para mostrar los toasts

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);  // Cambia 'email' por 'username'
      formData.append('password', password);

      const response = await fetch(`${config.backendHost}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        toast({
          title: 'Error de inicio de sesión',
          description: 'Verifica tus credenciales e inténtalo de nuevo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        const data = await response.json();
        localStorage.setItem('token', data.token.access_token);
        localStorage.setItem('id_pasteleria', data.user.id_pasteleria);
        localStorage.setItem('id_rol', JSON.stringify(data.user.id_rol));
        localStorage.setItem('usuario', data.user.usuario);
        localStorage.setItem('nombre', data.user.nombre);
        localStorage.setItem('apellido', data.user.apellido);

        toast({
          title: 'Inicio de sesión exitoso',
          description: 'Redirigiendo al panel principal...',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        router.push('/');
      }
    } catch (error) {
      toast({
        title: 'Error de conexión',
        description: 'Hubo un problema al conectar con el servidor. Inténtalo de nuevo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Inicio de Sesión</Heading>
          <Text fontSize="lg" color={useColorModeValue('gray.600', 'whiteAlpha.800')}>
            Accede al sistema con tu usuario y contraseña
          </Text>
        </Stack>
        <Box rounded="lg" bg={useColorModeValue('white', 'gray.700')} boxShadow="lg" p={8}>
          <Stack spacing={4}>
            <FormControl id="username">
              <FormLabel>Usuario</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
              />
            </FormControl>

            <FormControl id="password">
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
            </FormControl>

            <Stack spacing={10}>
              <Button
                bg="blue.400"
                color="white"
                _hover={{
                  bg: 'blue.500',
                }}
                onClick={handleSubmit}
                isLoading={loading}
              >
                Iniciar Sesión
              </Button>
            </Stack>
            <Stack pt={4}>
              <Text align="center">
                ¿No tienes una cuenta? <Link href="/register" color="blue.400">Crea tu pastelería</Link>
              </Text>
              {/* <Text align="center">
                <Link color="blue.400">¿Olvidaste tu contraseña?</Link>
              </Text> */}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Login;
