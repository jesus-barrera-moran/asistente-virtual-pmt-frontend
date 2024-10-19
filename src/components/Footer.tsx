'use client';
import {
  Flex,
  List,
  ListItem,
  Text,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiDownload, FiMail } from 'react-icons/fi';
// import Link from '@/components/link/Link';

export default function Footer() {
  const textColor = useColorModeValue('gray.500', 'white');
  
  const handleManualDownload = () => {
    // Lógica para descargar el manual
    // PENDIENTE: Cambiar la ruta del manual
    const manualUrl = '/manual_de_usuario.pdf'; // Ruta del archivo del manual
    window.open(manualUrl, '_blank'); // Abrir el archivo en una nueva pestaña
  };

  return (
    <Flex
      zIndex="3"
      flexDirection={{
        base: 'column',
        xl: 'row',
      }}
      alignItems="center"
      justifyContent="space-evenly"
      px={{ base: '30px', md: '50px' }}
      pb="10px"
    >
      {/* Información de copyright */}
      <Text
        color={textColor}
        fontSize={{ base: 'xs', md: 'sm' }}
        textAlign={{
          base: 'center',
          xl: 'start',
        }}
        fontWeight="500"
        mb={{ base: '10px', xl: '0px' }}
      >
        &copy; {new Date().getFullYear()}
        <Text as="span" fontWeight="500" ms="4px">
          Asistente Virtual. Todos los derechos reservados.
        </Text>
      </Text>

      {/* Íconos para soporte y descarga */}
      <Flex alignItems="center" justifyContent="center">
        <Tooltip label="Contactar Soporte Técnico" aria-label="Correo soporte técnico">
          <IconButton
            aria-label="Correo de soporte técnico"
            icon={<FiMail />}
            fontSize="20px"
            color={textColor}
            variant="ghost"
            as="a"
            // PENDIENTE: Cambiar el correo de soporte
            href="mailto:asistente.virtual.pastelerias@gmail.com"
            me={{ base: '10px', md: '20px' }}
          />
        </Tooltip>
        
        <Tooltip label="Descargar Manual de Usuario" aria-label="Descargar manual">
          <IconButton
            aria-label="Descargar Manual"
            icon={<FiDownload />}
            fontSize="20px"
            color={textColor}
            variant="ghost"
            onClick={handleManualDownload}
          />
        </Tooltip>
      </Flex>

      {/* Links de información adicional */}
      {/* <List display="flex">
        <ListItem
          me={{
            base: '10px',
            md: '44px',
          }}
        >
          <Link
            fontWeight="500"
            fontSize={{ base: 'xs', md: 'sm' }}
            color={textColor}
            href="/license"
          >
            License
          </Link>
        </ListItem>
        <ListItem
          me={{
            base: '10px',
            md: '44px',
          }}
        >
          <Link
            fontWeight="500"
            fontSize={{ base: 'xs', md: 'sm' }}
            color={textColor}
            href="/terms"
          >
            Terms of Use
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight="500"
            fontSize={{ base: 'xs', md: 'sm' }}
            color={textColor}
            href="/privacy"
          >
            Privacy Policy
          </Link>
        </ListItem>
      </List> */}
    </Flex>
  );
}
