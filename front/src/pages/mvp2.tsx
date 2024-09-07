import { Button, VStack, HStack, Box, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from '@chakra-ui/react';
import { useState } from 'react';

export default function mvp2() {
  const { isOpen, onOpen, onClose } = useDisclosure(); // モーダルの制御
  const [text, setText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [inputText, setInputText] = useState(""); // モーダル内で入力されたテキスト
  const handleClick = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'cotomi/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: inputText })
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
        setConvertedText((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <HStack spacing={0} align="stretch" height="100vh">
      <VStack
        w="250px"
        p={4}
        bg="gray.100"
        align="start"
        spacing={4}
      >
        <Button width="100%" colorScheme="blue" size="lg">
          画像をアップロード
        </Button>
      </VStack>
      <VStack flex="1" p={4} bg="gray.200" align="start" spacing={4}>
        <Box flex="1" p={4}>
          <Text fontSize="xl">{text || ""}</Text>
        </Box>
        <Box flex="1" p={4}>
          <Text fontSize="xl">{convertedText || ""}</Text>
        </Box>
      </VStack>
      {/* モーダル */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
      </Modal>
    </HStack>
  );
};