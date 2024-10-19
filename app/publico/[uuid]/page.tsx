'use client';
/*eslint-disable*/
import React, { useEffect } from 'react';
import MessageBoxChat from '@/components/MessageBox';
import {
  Button,
  Flex,
  Icon,
  Img,
  Input,
  Text,
  useColorModeValue,
  useToast, // Importar useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { MdAutoAwesome, MdPerson } from 'react-icons/md';
import config from '../../../src/config/env';

export default function Chat(props: { apiKeyApp: string }) {
  // Input States
  const [inputOnSubmit, setInputOnSubmit] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  // Response message
  const [outputCode, setOutputCode] = useState<string>('');
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const { uuid } = useParams();
  const toast = useToast(); // Hook para mostrar mensajes de error/success
  const [logoFondo, setLogoFondo] = useState<string>('');

  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );

  const logo_fondo = localStorage.getItem('logo_fondo');

  useEffect(() => {
    setLogoFondo(logo_fondo ? logo_fondo : '');
  }, [logo_fondo]);

  const handleTranslate = async () => {
    setInputCode('');
    try {
      setInputOnSubmit(inputCode);
      setOutputCode(' ');
      setLoading(true);
      const controller = new AbortController();
      const body = {
        input: {
          input: inputCode,
        },
      };

      const token = localStorage.getItem('token');

      // -------------- Fetch --------------
      const response = await fetch(`${config.backendHost}/atencion_cliente/invoke/${uuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      // Check if response status is 401
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

      const data = response.body;

      if (!data) {
        setLoading(false);
        toast({
          title: 'Error en la solicitud',
          description: 'Algo salió mal, por favor intenta de nuevo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        setLoading(true);
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        const chunkValueJson = chunkValue ? JSON.parse(chunkValue) : chunkValue;
        const chunkValueJsonResponse = chunkValueJson?.output?.output;
        const chunkValueStringResponse = JSON.stringify(chunkValueJsonResponse);
        setOutputCode((prevCode) => chunkValueStringResponse ? prevCode + chunkValueStringResponse : prevCode);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({
        title: 'Error en la solicitud',
        description: 'Algo salió mal, por favor intenta de nuevo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (Event: any) => {
    setInputCode(Event.target.value);
  };

  return (
    <Flex
      w="100%"
      pt={{ base: '70px', md: '0px' }}
      direction="column"
      position="relative"
      minH={{ base: '85vh', '2xl': '85vh' }}
    >
      {logoFondo && (<Img
        src={logoFondo}
        position={'absolute'}
        w="700px"
        left="50%"
        top="50%"
        transform={'translate(-50%, -50%)'}
      />)}
      <Flex
        direction="column"
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        minH={{ base: '85vh', '2xl': '85vh' }}
        maxW="1000px"
        pt="75px"
        gap="10px"
        height="100%"
        justifyContent={outputCode ? "space-between" : "flex-end"}
      >
        {/* Main Box */}
        <Flex
          direction="column"
          w="100%"
          mx="auto"
          p="20px"
          width="95%"
          display={outputCode ? 'flex' : 'none'}
        >
          <Flex align={'center'} mb="10px">
            <Flex
              borderRadius="full"
              justify="center"
              align="center"
              bg={'transparent'}
              border="1px solid"
              borderColor={borderColor}
              me="20px"
              h="40px"
              minH="40px"
              minW="40px"
            >
              <Icon
                as={MdPerson}
                width="20px"
                height="20px"
                color={brandColor}
              />
            </Flex>
            <Flex
              p="22px"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="14px"
              w="93%"
              zIndex={'2'}
            >
              <Text
                color={textColor}
                maxW="-webkit-fill-available"
                fontWeight="600"
                fontSize={{ base: 'sm', md: 'md' }}
                lineHeight={{ base: '24px', md: '26px' }}
              >
                {inputOnSubmit}
              </Text>
            </Flex>
          </Flex>
          <Flex>
            <Flex
              borderRadius="full"
              justify="center"
              align="center"
              bg={'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'}
              me="20px"
              h="40px"
              minH="40px"
              minW="40px"
            >
              <Icon
                as={MdAutoAwesome}
                width="20px"
                height="20px"
                color="white"
              />
            </Flex>
            <MessageBoxChat output={outputCode} />
          </Flex>
        </Flex>
        {/* Chat Input */}
        <Flex
          ms={{ base: '0px', xl: '60px' }}
          justifySelf={'flex-end'}
        >
          <Input
            minH="54px"
            h="100%"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="45px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            _focus={{ borderColor: 'none' }}
            color={inputColor}
            _placeholder={placeholderColor}
            placeholder="Escribe tu consulta aquí..."
            onChange={handleChange}
            value={inputCode}
          />
          <Button
            variant="primary"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            ms="auto"
            w={{ base: '160px', md: '210px' }}
            h="54px"
            _hover={{
              boxShadow:
                '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
              _disabled: {
                bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
              },
            }}
            onClick={handleTranslate}
            isLoading={loading ? true : false}
          >
            Enviar
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
