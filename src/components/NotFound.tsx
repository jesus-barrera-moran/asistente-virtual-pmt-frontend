'use client';
import React from 'react';
import { Box, Heading, Text, Button, Flex, Icon } from '@chakra-ui/react';
import { FiHome } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const BakeryNotFound: React.FC = () => {
  const router = useRouter();

  // Función para regresar a la página de inicio
  const handleGoHome = () => {
    router.push('/'); // Redirigir a la página de inicio
  };

  return (
    <Flex
      height="100vh"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
      p={4}
    >
      <Box textAlign="center">
        <Heading
          as="h1"
          size="2xl"
          mb={4}
          fontWeight="bold"
          color="teal.500"
        >
          Pastelería no encontrada
        </Heading>
        <Text fontSize="lg" mb={6} color="gray.600">
          Lo sentimos, no pudimos encontrar la pastelería que estás buscando.
          Puede que el enlace esté roto o la pastelería ya no exista.
        </Text>
        {/* <Button
          leftIcon={<Icon as={FiHome} />}
          colorScheme="teal"
          onClick={handleGoHome}
        >
          Regresar a la página principal
        </Button> */}
      </Box>
    </Flex>
  );
};

export default BakeryNotFound;
