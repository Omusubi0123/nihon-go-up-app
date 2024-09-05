import { Button, VStack, Text } from '@chakra-ui/react';
import { useState } from 'react';

export default function App3() {
  const [text, setText] = useState("");

  const handleClick = async () => {
    try {
      const response = await fetch("https://my-fastapi-app-422440879565.asia-northeast1.run.app/", {
        method: 'GET',
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
      <Button colorScheme="teal" onClick={handleClick}>
        Call API
      </Button>
    </VStack>
  );
};
