import {
    Box,
    Button,
    Flex,
    Stack,
    Divider,
    Table,
    Tbody,
    Tr,
    Td,
    Text,
    Icon,
  } from '@chakra-ui/react';
  import { FaServer, FaNetworkWired, FaUser, FaEdit, FaLock, FaCheckCircle, FaDatabase } from 'react-icons/fa';

  interface DatabaseConnectionDetailsProps {
    loading: boolean;
    categoria: string;
    nombre: string;
    servidor: string;
    puerto: string;
    usuario: string;
    onEdit: () => void;
    onUpdatePassword: () => void;
    onTestConnection: () => void;
  }

  const DatabaseConnectionDetails: React.FC<DatabaseConnectionDetailsProps> = ({
    loading,
    categoria,
    nombre,
    servidor,
    puerto,
    usuario,
    onEdit,
    onUpdatePassword,
    onTestConnection,
  }) => {
    return (
      <Stack spacing={6}>
        <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4}>
            {categoria.toUpperCase()}
        </Text>
        <Divider />

        <Box>
          <Table variant="simple" size="md">
            <Tbody>
              <Tr>
                <Td>
                  <Flex align="center">
                    <Icon as={FaDatabase} color="blue.400" mr={2} />
                    <Text fontWeight="semibold" color="gray.600">
                      Nombre:
                    </Text>
                  </Flex>
                </Td>
                <Td>{nombre}</Td>
              </Tr>

              <Tr>
                <Td>
                  <Flex align="center">
                    <Icon as={FaServer} color="blue.400" mr={2} />
                    <Text fontWeight="semibold" color="gray.600">
                      Servidor:
                    </Text>
                  </Flex>
                </Td>
                <Td>{servidor}</Td>
              </Tr>

              <Tr>
                <Td>
                  <Flex align="center">
                    <Icon as={FaNetworkWired} color="blue.400" mr={2} />
                    <Text fontWeight="semibold" color="gray.600">
                      Puerto:
                    </Text>
                  </Flex>
                </Td>
                <Td>{puerto}</Td>
              </Tr>

              <Tr>
                <Td>
                  <Flex align="center">
                    <Icon as={FaUser} color="blue.400" mr={2} />
                    <Text fontWeight="semibold" color="gray.600">
                      Usuario:
                    </Text>
                  </Flex>
                </Td>
                <Td>{usuario}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Botones para editar y actualizar clave */}
        <Flex justify="center" mt={4}>
          <Button
            leftIcon={<FaEdit />}
            onClick={onEdit}
            bg="blue.400"
            color="white"
            _hover={{ bg: 'blue.500' }}
            mr={3}
          >
            Editar Conexión
          </Button>
          <Button
            leftIcon={<FaLock />}
            onClick={onUpdatePassword}
            bg="gray.400"
            color="white"
            _hover={{ bg: 'gray.500' }}
            mr={3}
          >
            Actualizar Clave
          </Button>

          {/* Botón para probar la conexión */}
          <Button
            leftIcon={<FaCheckCircle />}
            onClick={onTestConnection}
            bg="green.400"
            color="white"
            _hover={{ bg: 'green.500' }}
            isLoading={loading}
          >
            Probar Conexión
          </Button>
        </Flex>
      </Stack>
    );
  };

  export default DatabaseConnectionDetails;
