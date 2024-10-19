'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import { Box, Portal, useToast, Flex, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/navigation'; // Cambiado a next/navigation
import routes from '@/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import Navbar from '@/components/navbar/NavbarAdmin';
import Footer from '@/components/Footer'; // Importamos el nuevo Footer
import { getActiveRoute, getActiveNavbar } from '@/utils/navigation';
import { usePathname, useParams } from 'next/navigation'; // También desde next/navigation
import '@/styles/App.css';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import '@/styles/MiniCalendar.css';
import AppWrappers from './AppWrappers';
import config from '../src/config/env';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // Cambiado a la versión correcta de next/navigation
  const [isAllowed, setIsAllowed] = useState(false);
  const toast = useToast();
  const { uuid } = useParams(); // Obtenemos el parámetro de la URL

  const isPublicRoute = pathname?.startsWith('/publico'); // Verifica si la ruta es de clientes
  const isExternal = pathname?.startsWith('/register') || pathname?.startsWith('/login'); // Rutas externas

  const [loading, setLoading] = useState(!isExternal); // Estado de carga

  // Verificar si hay un token para rutas no públicas o para login/register
  useEffect(() => {
    const token = localStorage.getItem('token'); // Verificar la existencia del token
    const id_pasteleria = !isExternal
      ? isPublicRoute
        ? uuid
        : localStorage.getItem('id_pasteleria')
      : null;

    if (isExternal && token) {
      // Si está en login o register y ya tiene un token, redirigir a la raíz (/)
      router.push('/');
    } else if (!isPublicRoute && !isExternal) {
      // Para rutas no públicas, redirigir al login si no hay token
      if (!token) {
        setIsAllowed(false);
        router.push('/login');
      } else {
        setIsAllowed(true);
      }
    } else {
      setIsAllowed(true); // Permitido en rutas públicas o externas sin token
    }

    // Si el token está presente, hacemos la llamada al endpoint
    if (id_pasteleria) {
      fetchBakeryData(id_pasteleria);
    }
  }, [isPublicRoute, isExternal, router]);

  // Función para hacer la llamada al endpoint de la pastelería
  const fetchBakeryData = async (id_pasteleria: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.backendHost}/pastelerias/${id_pasteleria}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

      const data = await response.json();

      let logo_menu_url = "";
      let logo_fondo_url = "";
      if (data?.logos?.length > 0) {
        logo_menu_url = data.logos.find((logo: any) => logo.file_name === 'logo_menu')?.url || '';
        logo_fondo_url = data.logos.find((logo: any) => logo.file_name === 'logo_fondo')?.url || '';
      }

      localStorage.setItem('email_pasteleria', data.email);
      localStorage.setItem('website_pasteleria', data.url_website);
      localStorage.setItem('nombre_pasteleria', data.nombre);
      localStorage.setItem('logo_menu', logo_menu_url);
      localStorage.setItem('logo_fondo', logo_fondo_url);

      // toast({
      //   title: 'Datos obtenidos',
      //   description: 'Datos de la pastelería cargados correctamente.',
      //   status: 'success',
      //   duration: 3000,
      //   isClosable: true,
      // });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron obtener los datos de la pastelería.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <html lang="en">
        <body id={'root'}>
          <Flex justify="center" align="center" height="100vh">
            <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
          </Flex>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body id={'root'}>
        {isAllowed && (
          <AppWrappers>
            {isExternal ? (
              children // Mostrar login o register
            ) : (
              <Box>
                <Sidebar isPublicRoute={isPublicRoute} routes={routes} />
                <Box
                  pt={{ base: '60px', md: '0px' }}
                  float="right"
                  minHeight="100vh"
                  height="100%"
                  overflow="auto"
                  position="relative"
                  maxHeight="100%"
                  w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
                  maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
                  transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
                  transitionDuration=".2s, .2s, .35s"
                  transitionProperty="top, bottom, width"
                  transitionTimingFunction="linear, linear, ease"
                >
                  <Portal>
                    <Box>
                      <Navbar
                        brandText={getActiveRoute(routes, pathname, isPublicRoute)}
                        secondary={getActiveNavbar(routes, pathname)}
                      />
                    </Box>
                  </Portal>
                  <Box
                    mx="auto"
                    p={{ base: '20px', md: '30px 30px 10px 30px' }}
                    pe="20px"
                    pt="50px"
                  >
                    {children}
                  </Box>
                  {/* Agregamos el footer aquí */}
                  <Footer />
                </Box>
              </Box>
            )}
          </AppWrappers>
        )}
      </body>
    </html>
  );
}
