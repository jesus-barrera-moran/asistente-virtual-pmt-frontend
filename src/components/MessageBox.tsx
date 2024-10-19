import ReactMarkdown from 'react-markdown'
import { useColorModeValue } from '@chakra-ui/react'
import Card from '@/components/card/Card'

// Define los estilos para las listas
const markdownComponents = {
  ul: ({ children }) => (
    <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: '1.5rem', listStyleType: 'decimal' }}>
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 'bold' }}>
      {children}
    </strong>
  ),
}

export default function MessageBox(props: { output: string }) {
  const { output } = props
  const textColor = useColorModeValue('navy.700', 'white')

  // Reemplazamos los saltos de línea \n con dobles saltos de línea para respetar los párrafos
  const formattedOutput = output.replace(/\\n/g, '\n\n').replace(/\"/g, '');

  return (
    <Card
      display={output ? 'flex' : 'none'}
      px="22px !important"
      pl="22px !important"
      color={textColor}
      minH="75px"
      fontSize={{ base: 'sm', md: 'md' }}
      lineHeight={{ base: '24px', md: '26px' }}
      fontWeight="500"
    >
      <ReactMarkdown components={markdownComponents}>
        {formattedOutput ? formattedOutput : ''}
      </ReactMarkdown>
    </Card>
  )
}
