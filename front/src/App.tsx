import React from 'react';
import { Button, VStack, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';

const App = () => {
  const toast = useToast();

  const handleClick = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/');
      console.log("Success:", response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <VStack spacing={4} align="center" justify="center" height="100vh">
      <Text fontSize="xl">Click the button to call the API</Text>
      <Button colorScheme="teal" onClick={handleClick}>
        Call API
      </Button>
    </VStack>
  );
};

export default App;