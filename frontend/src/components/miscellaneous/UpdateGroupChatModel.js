import React, { useState } from "react";
import { ViewIcon } from "@chakra-ui/icons";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    IconButton,
    Box,
    Input,
    Spinner,
    FormControl,
    useToast
} from "@chakra-ui/react";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
import axios from "axios";



const UpdateGroupChatModel = ( { fetchAgain, setFetchAgain ,fetchMessages} ) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {selectedChat,setSelectedChat,user} = ChatState();

    const[groupChatName,setGroupChatName] = useState();
    const[search,setSearch] = useState("");
    const[searchResult,setSearchResult] = useState([]);
    const[loading,setLoading] = useState(false);
    const[renameloading,setRenameLoading] = useState(false);
    const toast = useToast();

    const renameHandler = async() =>{
         if(!groupChatName) return;

           try{
            setRenameLoading(true);
            const config = {
                headers:{
                    Authorization :`Bearer ${user.token}`
                },
             };
    
             const {data} = await axios.put("/api/chat/rename",{
                 chatId:selectedChat._id,
                chatName:groupChatName
             },config);


             setSelectedChat(data);
             setFetchAgain(!fetchAgain);
             setRenameLoading(false);


           }catch(error){
            toast({
                title: "Error Occured!",
                description:error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
              });
              setRenameLoading(false);
           }
         setGroupChatName("");
    };

    const addUserHandler = async(user1) =>{
      if(selectedChat.users.find( (u) => u._id === user1._id)){
        toast({
            title: "User Already in group!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          return;
      }


      //admin or not

      if(selectedChat.groupAdmin._id !== user._id) {
        toast({
            title: "Only Admin Can Add Someone!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          return;
      } 


      try{
       
        setLoading(true);
        const config = {
            headers:{
                Authorization : `Bearer ${user.token}`,
            },
        };

        const {data} = await axios.put("/api/chat/groupadd",{
            chatId:selectedChat._id,
            userId:user1._id,
        },config);
        
        setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        fetchMessages();
        setLoading(false);

      }catch(error){
        toast({
            title: "Error Occured!",
            description:error.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false);
      }
    };



    const removeHandler = async(user1) =>{
        if(selectedChat.groupAdmin._id !== user._id && user1._id !== user._id){
            toast({
                title: "Only Admin Can Remove Someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
              });
              return;
        }


        try{
            setLoading(true);
            const config = {
                headers:{
                    Authorization : `Bearer ${user.token}`,
                },
            };
    
            const {data} = await axios.put("/api/chat/groupremove",{
                chatId:selectedChat._id,
                userId:user1._id,
            },config);
            
         user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
         setFetchAgain(!fetchAgain);
         setLoading(false);

        }catch(error){
            toast({
                title: "Error Occured!",
                description:error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
              });
              setLoading(false);
        }
    };


    const searchHandler = async(query) =>{
        setSearch(query);
        if (!query) {
          return;
        }
    
        try {
          setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.get(`/api/user?search=${search}`, config);
        //   console.log(data);
          setLoading(false);
          setSearchResult(data);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to Load the Search Results",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
    };

    return (
        <>
            <IconButton d={ { base: "flex" } } icon={ <ViewIcon /> } onClick={ onOpen } />
            <Modal onClose={ onClose } isOpen={ isOpen } isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >
                        { selectedChat.chatName }
                    </ModalHeader>

                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <Box w="100%" display="flex" flexWrap="wrap" pb={ 3 }>
                            { selectedChat.users.map( ( u ) => (
                                <UserBadgeItem
                                    key={ u._id }
                                    user={ u }
                                    admin={ selectedChat.groupAdmin }
                                    handleFunction={ () => removeHandler( u ) }
                                />
                            ) ) }
                        </Box>
                        <FormControl display="flex">
                            <Input
                                placeholder="Chat Name"
                                mb={ 3 }
                                value={ groupChatName }
                                onChange={ ( e ) => setGroupChatName( e.target.value ) }
                            />
                            <Button
                                variant="solid"
                                colorScheme="teal"
                                ml={ 1 }
                                isLoading={ renameloading }
                                onClick={ renameHandler }
                            >
                                Update
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add User to group"
                                mb={ 1 }
                                onChange={ ( e ) => searchHandler( e.target.value ) }
                            />
                        </FormControl>

                        { loading ? (
                            <Spinner size="lg" />
                        ) : (
                            searchResult?.map( ( user ) => (
                                <UserListItem
                                    key={ user._id }
                                    user={ user }
                                    handleFunction={ () => addUserHandler( user ) }
                                />
                            ) )
                        ) }
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={ () => removeHandler( user ) } colorScheme="red">
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModel;