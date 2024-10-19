import {
    Box,
    Button,
    Flex,
    Stack,
    Text,
    Icon,
    Divider,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
  } from '@chakra-ui/react';
  import { FaUser, FaEnvelope, FaUserAlt, FaEdit, FaLock } from 'react-icons/fa';
  
  interface UserProfileViewProps {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    toggleEdit: () => void;
    setUpdatePasswordMode: (value: boolean) => void;
  }
  
  const UserProfileView: React.FC<UserProfileViewProps> = ({
    firstName,
    lastName,
    username,
    email,
    toggleEdit,
    setUpdatePasswordMode,
  }) => {
    return (
      <Stack spacing={6}>
        <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4}>
          {firstName} {lastName}
        </Text>
        <Divider />
  
        {/* Tabla de visualización de perfil */}
        <Box>
          <Table variant="simple" size="md">
            <Tbody>
              <Tr>
                <Td>
                  <Flex align="center">
                    <Icon as={FaUserAlt} color="blue.400" mr={2} />
                    <Text fontWeight="semibold" color="gray.600">
                      Nombre:
                    </Text>
                  </Flex>
                </Td>
                <Td>{firstName}</Td>
              </Tr>
  
              <Tr>
                <Td>
                  <Flex align="center">
                    <Icon as={FaUser} color="blue.400" mr={2} />
                    <Text fontWeight="semibold" color="gray.600">
                      Apellido:
                    </Text>
                  </Flex>
                </Td>
                <Td>{lastName}</Td>
              </Tr>
  
              <Tr>
                <Td>
                  <Flex align="center">
                    <Icon as={FaUser} color="blue.400" mr={2} />
                    <Text fontWeight="semibold" color="gray.600">
                      Nombre de Usuario:
                    </Text>
                  </Flex>
                </Td>
                <Td>{username}</Td>
              </Tr>
  
              <Tr>
                <Td>
                  <Flex align="center">
                    <Icon as={FaEnvelope} color="blue.400" mr={2} />
                    <Text fontWeight="semibold" color="gray.600">
                      Correo Electrónico:
                    </Text>
                  </Flex>
                </Td>
                <Td>{email}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
  
        {/* Botones para editar y cambiar contraseña */}
        <Flex justify="center" mt={4}>
          <Button
            leftIcon={<FaEdit />}
            onClick={toggleEdit}
            bg="blue.400"
            color="white"
            _hover={{ bg: 'blue.500' }}
            mr={3}
          >
            Editar Perfil
          </Button>
          <Button
            leftIcon={<FaLock />}
            onClick={() => setUpdatePasswordMode(true)}
            bg="gray.400"
            color="white"
            _hover={{ bg: 'gray.500' }}
          >
            Actualizar Contraseña
          </Button>
        </Flex>
      </Stack>
    );
  };
  
  export default UserProfileView;
  