import { Button, VStack, Text } from '@chakra-ui/react';
import { useState } from 'react';

const App = () => {
  const [text, setText] = useState("");

  const handleClick = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'cotomi/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: "リコリコの第二シリーズの情報を教えて下さい" })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      while (true) {
        const { done, value } = await reader?.read()!;
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setText((prev) => prev + chunk);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <VStack spacing={4} align="center" justify="center" height="100vh">
      <Text fontSize="xl">{text || "Click the button to call the API"}</Text>
      <Button colorScheme="blue" size="lg" onClick={handleClick}>
        Call API
      </Button>
    </VStack>
  );
};

export default App;
