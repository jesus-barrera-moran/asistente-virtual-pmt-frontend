'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Select,
  Text,
  Spinner,
  HStack,
  VisuallyHidden,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FiUpload, FiTrash } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import mammoth from 'mammoth';
import config from '../config/env';

type Document = {
  id: number;
  title: string;
  content: string;
  file?: File | null;
};

const DocumentsManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();
  const router = useRouter();

  const validFileTypes = ['text/plain', 'text/csv', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxFileSize = 2 * 1024 * 1024; // 2MB

  useEffect(() => {
    const fetchDocumentsData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const id_pasteleria = localStorage.getItem('id_pasteleria');

        // Llamada al primer endpoint (obtener documentos de la base de datos)
        const documentosResponse = await fetch(`${config.backendHost}/pastelerias/${id_pasteleria}/documentos`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (documentosResponse.status === 401) {
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

        const documentosData = await documentosResponse.json();

        // Llamada al segundo endpoint (obtener contenido de los archivos en la bucket)
        const filesResponse = await fetch(`${config.backendHost}/pastelerias/${id_pasteleria}/files`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const filesData = filesResponse.ok ? await filesResponse.json() : []; // Si no hay archivos, devolver un array vacío

        // Mapear documentos con el contenido del archivo
        const mappedDocuments = documentosData.map((doc: any, index: number) => {
          const matchingFile = filesData.find((file: any) => file.name === doc.nombre);
          return {
            id: index + 1,
            title: doc.nombre,
            content: matchingFile ? matchingFile.content : '', // Si no existe en bucket, mostrar vacío
          };
        });

        setDocuments(mappedDocuments);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Hubo un problema al cargar los documentos.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentsData();
  }, [toast, router]);

  const handleDocumentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(event.target.value, 10);
    setSelectedDocumentId(selectedId);
  
    // Buscar el documento seleccionado y actualizar el contenido
    const selectedDocument = documents.find(doc => doc.id === selectedId);
    if (selectedDocument) {
      setDocuments(prevDocuments => 
        prevDocuments.map(doc => 
          doc.id === selectedId ? { ...doc, content: selectedDocument.content } : doc
        )
      );
    }
  };

  const handleContentChange = (newContent: string) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === selectedDocumentId ? { ...doc, content: newContent } : doc
      )
    );
  };

  const handleFileChange = async (file: File | null) => {
    if (file && selectedDocumentId !== null) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      const isValidFile = validFileTypes.includes(file.type) || fileExtension === 'md';

      if (!isValidFile) {
        toast({
          title: 'Tipo de archivo no válido',
          description: `Por favor, selecciona un archivo de tipo válido. Los tipos permitidos son: .txt, .csv, .md, .docx`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (file.size > maxFileSize) {
        toast({
          title: 'Archivo demasiado grande',
          description: `El archivo excede el tamaño máximo permitido de 2MB.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const reader = new FileReader();

      if (file.type === 'text/plain' || file.type === 'text/csv' || fileExtension === 'md') {
        reader.onload = (event) => {
          const fileContent = event.target?.result as string;

          setDocuments((prevDocuments) =>
            prevDocuments.map((doc) =>
              doc.id === selectedDocumentId ? { ...doc, content: fileContent, file } : doc
            )
          );
        };
        reader.readAsText(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        reader.onload = (event) => {
          const arrayBuffer = event.target?.result;

          mammoth.extractRawText({ arrayBuffer })
            .then((result) => {
              const extractedText = result.value;

              setDocuments((prevDocuments) =>
                prevDocuments.map((doc) =>
                  doc.id === selectedDocumentId ? { ...doc, content: extractedText, file } : doc
                )
              );
            })
            .catch(() => {
              toast({
                title: 'Error al leer archivo .docx',
                description: 'Ocurrió un error al leer el archivo Word.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            });
        };
        reader.readAsArrayBuffer(file);
      }

      reader.onerror = () => {
        console.error('Error al leer el archivo');
      };
    }
  };

  const handleRemoveFile = () => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === selectedDocumentId ? { ...doc, file: null } : doc
      )
    );
  };

  const handleSaveChanges = async () => {
    setLoading(true);

    const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);
    if (selectedDocument) {
      try {
        const token = localStorage.getItem('token');
        const id_pasteleria = localStorage.getItem('id_pasteleria');

        const response = await fetch(`${config.backendHost}/writeFileContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: selectedDocument.title,  // Usar el título del documento como nombre del archivo
            content: selectedDocument.content,  // Usar el contenido actual del documento
          }),
        });

        if (response.status === 401) {
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
          throw new Error(errorData.message || 'Error al guardar el documento');
        }

        toast({
          title: 'Cambios guardados',
          description: `El documento '${selectedDocument.title}' ha sido guardado exitosamente.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: `No se pudo guardar el documento: ${(error as Error).message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }

    setLoading(false);
  };  

  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="85vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Flex minH="85vh" align="start" justify="center" bg="none">
      <Stack spacing={8} mx="auto" w="100%" bg="none" pt={16} px={6}>
        <Box w="100%" maxW="1000px" mx="auto" p={6} bg="none" rounded="lg">
          <FormControl id="select-document">
            <FormLabel>Seleccionar Documento</FormLabel>
            <Select placeholder="Selecciona un documento" onChange={handleDocumentChange}>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </Select>
          </FormControl>

          {selectedDocument && (
            <Box mt={6}>
              <FormControl id={`title-${selectedDocument.id}`}>
                <FormLabel>Título</FormLabel>
                <Input type="text" value={selectedDocument.title} readOnly isReadOnly />
              </FormControl>

              <FormControl id={`content-${selectedDocument.id}`} mt={4}>
                <FormLabel>Contenido</FormLabel>
                <Textarea
                  value={selectedDocument.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Escribe el contenido del documento aquí..."
                  rows={6}
                />
              </FormControl>

              <FormControl id={`file-${selectedDocument.id}`} mt={4}>
                <FormLabel>Cargar Archivo</FormLabel>
                <HStack spacing={4}>
                  <Box>
                    <VisuallyHidden>
                      <Input
                        type="file"
                        accept=".txt,.csv,.md,.docx"
                        id={`file-input-${selectedDocument.id}`}
                        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                      />
                    </VisuallyHidden>
                    <label htmlFor={`file-input-${selectedDocument.id}`}>
                      <IconButton
                        as="span"
                        aria-label="Subir archivo"
                        icon={<FiUpload />}
                        bg="blue.400"
                        color="white"
                        _hover={{ bg: 'blue.500' }}
                        size="md"
                      />
                    </label>
                  </Box>
                  {selectedDocument.file ? (
                    <>
                      <Text>{selectedDocument.file.name}</Text>
                      <IconButton
                        aria-label="Eliminar archivo"
                        icon={<FiTrash />}
                        colorScheme="red"
                        onClick={handleRemoveFile}
                      />
                    </>
                  ) : (
                    <Text>Ningún archivo seleccionado</Text>
                  )}
                </HStack>
              </FormControl>

              <Button
                mt={6}
                colorScheme="blue"
                isLoading={loading}
                onClick={handleSaveChanges}
              >
                Guardar Cambios
              </Button>
            </Box>
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default DocumentsManager;
