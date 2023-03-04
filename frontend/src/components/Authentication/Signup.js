import React, { useState } from "react";
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useHistory } from "react-router-dom";




const Signup = () => {

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [pic, setPic] = useState();
  const [show, setShow] = useState( false );
  const [picLoading, setPicLoading] = useState( false );
  const toast = useToast();
  const history = useHistory();



  const passwordHandler = () => setShow( !show );
  const postDetails = ( pics ) => {

    setPicLoading( true );
    if ( pics === undefined ) {
      toast( {
        title: 'Please Select an Image!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      } )
      return;
    }

    if ( pics.type === "image/jpeg" || pics.type === "image/png" ) {
      const data = new FormData();
      data.append( "file", pics );
      data.append( "upload_preset", "chat-app" );
      data.append( "cloud_name","poojakasar" );
      fetch( "https://api.cloudinary.com/v1_1/poojakasar/image/upload", {
        method: "post",
        body: data,
      })
      .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          console.log(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    
  }

  const submitHandler = async () => {
   setPicLoading(true);
   //check all fileds
   if (!name || !email || !password || !confirmPassword) {
    toast({
      title: "Please Fill all the Feilds",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    setPicLoading(false);
    return;
  } 


  //check password === confirmPassword

  if (password !== confirmPassword) {
    toast({
      title: "Password Do Not Match",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    return;
  }

  //if all is good then save all data into database

   try{
    const config = {
      headers :{
        'Content-Type' : 'application/json',
      }
    }

    const {data} = await axios.post("api/user", {name,email,password,pic},config );
    toast({
      title: "Registration Successful",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });

    localStorage.setItem("userInfo", JSON.stringify(data));
    setPicLoading(false);

    history.push("/chats");
    window.location.reload();
   }catch(error){
    toast({
      title: "Error Occured!",
      description: error.response.data.message,
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    setPicLoading(false);
   }
  

  }

  return (
    <VStack spacing='5px' color='black'>
      <FormControl id='first-name' isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          onChange={ ( e ) => setName( e.target.value ) }
        />
      </FormControl>
      <FormControl id='email' isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          onChange={ ( e ) => setEmail( e.target.value ) }
        />
      </FormControl>
      <FormControl id='password' isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size='md'>
          <Input
            type={ show ? 'text' : 'password' }
            placeholder="Set Your Password"
            onChange={ ( e ) => setPassword( e.target.value ) }
          />
          <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm' onClick={ passwordHandler }>
              { show ? 'Hide' : 'Show' }
            </Button>
          </InputRightElement>
        </InputGroup>

      </FormControl>

      <FormControl id=' confirm-password' isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size='md'>
          <Input
            type={ show ? 'text' : 'password' }
            placeholder="Confirm Your Password"
            onChange={ ( e ) => setConfirmPassword( e.target.value ) }
          />
          <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm' onClick={ passwordHandler }>
              { show ? 'Hide' : 'Show' }
            </Button>
          </InputRightElement>
        </InputGroup>

      </FormControl>

      <FormControl id="pic">
        <FormLabel>Upload Your Picture</FormLabel>
        <Input
          type="file"
          p={ 1.5 }
          accept="image/*"
          onChange={ ( e ) => postDetails( e.target.files[0] ) }
        />
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        style={ { marginTop: 15 } }
        onClick={ submitHandler }
        isLoading={picLoading}
       >
        Sign Up
      </Button>
    </VStack>
  )
}

export default Signup;