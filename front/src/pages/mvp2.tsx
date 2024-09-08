import {
  Button,
  VStack,
  HStack,
  Box,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Center,
  Image,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
// const imagePaths = [
//   'data/1.jpeg',
//   'data/11.jpeg',
//   'data/13.jpeg',
//   'data/15.jpeg',
//   'data/17.jpeg',
//   'data/19.jpeg',
//   'data/20.jpeg',
//   'data/22.jpeg',
//   'data/3.jpeg',
//   'data/5.jpeg',
//   'data/7.jpeg',
//   'data/9.jpeg',
//   'data/12.jpeg',
//   'data/14.jpeg',
//   'data/16.jpeg',
//   'data/18.jpeg',
//   'data/2.jpeg',
//   'data/21.jpeg',
//   'data/23.jpeg',
//   'data/4.jpeg',
//   'data/6.jpeg',
//   'data/8.jpeg',
// ];
const imagePaths = [
    'data/1.jpeg',
    'data/2.jpeg',
    'data/3.jpeg',
    'data/4.jpeg',
    'data/5.jpeg',
    'data/6.jpeg',
    'data/7.jpeg',
    'data/8.jpeg',
    'data/9.jpeg',
    'data/10.jpeg',
    'data/11.jpeg',
    'data/12.jpeg',
    'data/13.jpeg',
    'data/14.jpeg',
    'data/15.jpeg',
    'data/16.jpeg',
    'data/17.jpeg',
    'data/18.jpeg',
    'data/19.jpeg',
    'data/20.jpeg',
  ];
export default function Mvp2() {
  const { isOpen: isOpenModal1, onOpen: onOpenModal1, onClose: onCloseModal1 } = useDisclosure(); // モーダルの制御
  const { isOpen: isOpenModal2, onOpen: onOpenModal2, onClose: onCloseModal2 } = useDisclosure(); // モーダルの制御
  const [inputText, setInputText] = useState(""); // モーダル内で入力されたテキスト
  const [inputTextForRAG, setInputTextForRAG] = useState(""); // モーダル内で入力されたテキスト
  const [imageSrc, setImageSrc] = useState<File | undefined>(undefined);
  const [componentImageSrc, setComponentImageSrc] = useState<File | undefined>(undefined);
  const [imageExtension, setImageExtension] = useState<string | null>(null); // 画像の拡張子を格納
  const inputFileRef = useRef<HTMLInputElement | null>(null); // ファイル選択の参照
  const [convertedText, setConvertedText] = useState(""); // 変換後のテキストを格納
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sortedImagePaths, setSortedImagePaths] = useState<string[]>(imagePaths); // ソートされた画像パスを保持
  const [feedBackText, setFeedBackText] = useState("");
  const [mode1, setMode1] = useState(false);
  const [mode2, setMode2] = useState(false);
  const [selectedText, setSelectedText] = useState(""); // 選択されたテキストを保持


  const getFeedbackWithImage = async () => {
    try {
      if (imageExtension && imageSrc) {
        
        const formData = new FormData();
        const file = new Blob([imageSrc], { type: `image/${imageExtension}` });
        const fileName = "sample.png";
        formData.append('image', file, fileName);
        formData.append('mediatype', imageExtension);
        formData.append('llm_description', imageExtension);
        formData.append('user_description', imageExtension);
        const requestOptions = {
          method: "POST",
          body: formData,
        };
        const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'compare/', requestOptions);

        console.log("response: ", response);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await reader?.read()!;
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setFeedBackText((prev) => prev + chunk);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleModalSubmit = async () => {
    try {
      if (componentImageSrc && inputText && imageExtension) {
        const formData = new FormData();
        const file = new Blob([componentImageSrc], { type: "image/png" });
        const fileName = "sample.png";
        formData.append('image', file, fileName);
        formData.append('text', inputText);
        formData.append('mediatype', imageExtension);
        const requestOptions = {
          method: "POST",
          body: formData,
        };
        console.log("API呼び出し");
        const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'descript/', requestOptions);
        setMode1(true);
        setImageSrc(componentImageSrc);
        onCloseModal1();
        console.log(response);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await reader?.read()!;
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setConvertedText((prev) => prev + chunk);
        }
        
        
      }
    } catch (error) {
      console.error("There was an error!", error);
    }
  };


  const handleModalSubmitRAG = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_FASTAPI_URL + 'ai_search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputTextForRAG })
      });
      setMode2(true);
      const data = await response.json();
      console.log(data);
      const sortedPaths = await data.id.map((id: number) => imagePaths[id - 1]); // idに基づいてimagePathsを並び替え
      console.log(sortedPaths);
      setSortedImagePaths(sortedPaths);
      if (selectedIndex !== null) {
        console.log("oldIndex:", selectedIndex);
        const newIndex = data.id.indexOf(`${selectedIndex+1}`);
        setSelectedIndex(newIndex);
        console.log("newIndex:", selectedIndex);
      }
      onCloseModal2();
      
    } catch (error) {
      console.error("There was an error!", error);
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageExtension(file.name.split('.').pop() ?? 'unknown');
      const reader = new FileReader();
      setComponentImageSrc(file);
      reader.readAsDataURL(file);
    }
  };
  const handleUploadClick = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };
  // 画像がクリックされたときに選択状態を更新する関数
  const handleImageClick = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(null); // もう一度クリックしたら選択を解除
    } else {
      setSelectedIndex(index); // 選択された画像を更新
    }
    console.log(selectedIndex);
  };


  const handleMode1 = () => {
    setMode1(false);
    setMode2(false);
    onOpenModal1();
  }

  const handleMode2 = () => {
    setMode1(false);
    setMode2(false);
    onOpenModal2();  
  }

  const handleTextSelection = () => {
    const selectedText = window.getSelection()?.toString() || "";
    if (selectedText) {
      setSelectedText(selectedText);
      setIsTextModalOpen(true);
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
        {/* 隠れたファイル選択ボタン */}
        <input
          type="file"
          accept="image/*"
          ref={inputFileRef}
          style={{ display: 'none' }} // inputを非表示にする
          onChange={handleFileChange}
        />
        <Button width="100%" colorScheme="blue" size="lg" onClick={handleMode1}>
          画像説明モード1
        </Button>
        <Button width="100%" colorScheme="blue" size="lg" onClick={handleMode2}>
          画像説明モード2
        </Button>
      </VStack>
      {/* 右側のコンテンツ1 */}
      {mode1 && (
        <VStack flex="1" p={4} bg="gray.200" align="start" spacing={4}>
            
            <Button onClick={getFeedbackWithImage}>フィードバックをもらう</Button>
              <HStack justifyContent="center" width="100%">
                <Box flex="1" p={4} display="flex" justifyContent="center">
                  {imageSrc && (
                    <Image
                      src={URL.createObjectURL(imageSrc)}
                      alt="Uploaded Image"
                      maxH="300px"
                      objectFit="contain"
                    />
                  )}
                </Box>
              </HStack>
            {feedBackText && (
              <Box flex="1" p={4} cursor="text" border="1px solid black" borderRadius="md" bg="gray.100" ml={4}>
                  <Text>{feedBackText}</Text>  
              </Box>
            )}
            <HStack>
              {/* <Box flex="1" p={4} cursor="text" border="1px solid black" borderRadius="md" bg="gray.100" ml={4}>
                <Text fontSize="xl">
                  {inputText || ""}
                </Text>
              </Box> */}
              {inputText !== "" && (
                <VStack width="50%">
                  <Box 
                    flex="1" 
                    p={4} 
                    onMouseUp={handleTextSelection} 
                    cursor="text" 
                    border="1px solid black" 
                    borderRadius="md" 
                    bg="gray.100" 
                    ml={4} 
                  >
                    {!isHurigana1 ? (
                      <Text fontSize="xl">{text || ""}</Text>
                    ) : (
                      <Text fontSize="xl">{huriganaText1 || ""}</Text>
                    )}
                    
                  </Box>
                  <Button width="50%" colorScheme="blue" size="lg" onClick={toggleHurigana1}>
                    ふりがな切り替え
                  </Button>
                </VStack>
              )}



              <Box flex="1" p={4} cursor="text" border="1px solid black" borderRadius="md" bg="gray.100" ml={4}>
              <Text>{convertedText}</Text>
            </Box>
            </HStack>
        </VStack>
      )}
      {/* 右側のコンテンツ2 */}
      {mode2 && (
        <Box display="flex" flexWrap="wrap">
          {/* <Box flex="1" p={4} cursor="text" border="1px solid black" borderRadius="md" bg="gray.100" ml={4}>
          <Text>あなたの入力した文章とマッチする画像を、類似度が高い順に並べた結果以下の通りになりました。あなたの選んだ画像がより順番の先頭となるように上手く説明してみましょう！！！！</Text>  
          </Box> */}
            {sortedImagePaths.map((path, index) => (
              <VStack>
                <Box
                key={index}
                marginTop={10}
                marginLeft={20}
                marginRight={20}
                // width="120px" // Boxの幅を指定
                // height="120px" // Boxの高さを指定
                border={selectedIndex === index ? '8px solid red' : 'none'} // 選択された画像に赤い輪郭を表示
                borderRadius="md"
                display="flex" // 子要素を中央に配置するため
                justifyContent="center" // 水平方向に中央揃え
                alignItems="center" // 垂直方向に中央揃え
              >
                <Image
                  src={path}
                  alt={`image-${index}`}
                  boxSize="100px" // 画像のサイズを指定
                  objectFit="cover" // 画像の比率を保ちながら中央に収める
                  borderRadius="md"
                />
              </Box>
              <Text>
                {index}
              </Text>
            </VStack>
            ))}
        </Box>
      )}
      {/* モーダル1 */}
      <Modal isOpen={isOpenModal1} onClose={onCloseModal1}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>画像を選択してください</ModalHeader>
          <ModalBody>
            <Center>
              <Button width="90%" colorScheme="blue" onClick={handleUploadClick}>
                画像を選択
              </Button>
            </Center>
            {componentImageSrc && (
              <Box flex="1" p={4}>
                <Image src={URL.createObjectURL(componentImageSrc)} alt="Uploaded Image" maxH="300px" objectFit="contain" />
              </Box>
            )}
          </ModalBody>
          <ModalHeader>文章を入力してください</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="文章をここに入力"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              size="lg"
              resize="vertical"  // 必要に応じてリサイズを許可
              rows={10}  // 行数を指定
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleModalSubmit}>
              送信
            </Button>
            <Button variant="ghost" onClick={onCloseModal1}>キャンセル</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* モーダル2 */}
      <Modal isOpen={isOpenModal2} onClose={onCloseModal2}>
        <ModalOverlay />
        <ModalContent maxWidth={"50vw"}>
          <ModalHeader>画像を選択してください</ModalHeader>
          <ModalBody>
            <Box display="flex" flexWrap="wrap">
              {imagePaths.map((path, index) => (
                <Box
                  key={index}
                  m={2}
                  onClick={() => handleImageClick(index)}
                  border={selectedIndex === index ? '8px solid red' : 'none'} // 選択された画像に赤い輪郭を表示
                  borderRadius="md"
                  cursor="pointer" // クリック可能であることを示すためにカーソルを変更
                >
                  <Image
                    src={path}
                    alt={`image-${index}`}
                    boxSize="100px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  {index}
                </Box>
              ))}
            </Box>
          </ModalBody>
          <ModalHeader>文章を入力してください</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="文章をここに入力"
              value={inputTextForRAG}
              onChange={(e) => setInputTextForRAG(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleModalSubmitRAG}>
              送信
            </Button>
            <Button variant="ghost" onClick={onCloseModal2}>キャンセル</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </HStack>
  );
}