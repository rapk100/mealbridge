import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Stack, InputGroup, Input, InputLeftAddon, Button, Flex, Box, useColorModeValue } from '@chakra-ui/react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const ADD_PRODUCT = gql`
  mutation AddProduct($name: String!, $description: String, $image: String, $quantity: Int, $categoryId: ID) {
    addProduct(name: $name, description: $description, image: $image, quantity: $quantity, categoryId: $categoryId) {
      _id
      name
      description
      image
      quantity
    }
  }
`;

function AddItem() {
  const bg = useColorModeValue("gray.100", "gray.800"); // Define background color
  const color = useColorModeValue("gray.700", "gray.200"); // Define text color
  const inputLeftAddonStyle = { width: '150px' };

  const [inputValues, setInputValues] = useState({
    name: '',
    description: '',
    image: '',
    quantity: 0, // Set default value for quantity
    category: '',
  });

  const [addProduct] = useMutation(ADD_PRODUCT);

  const handleInputChange = (fieldName, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  const handleAddItem = async () => {
    try {
      const { data } = await addProduct({
        variables: {
          ...inputValues,
          quantity: parseInt(inputValues.quantity, 10), // Ensure quantity is an integer
        },
      });

      setInputValues({
        name: '',
        description: '',
        image: '',
        quantity: 0, // Reset quantity to default
        category: '',
      });
      console.log('Product added:', data.addProduct);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const buttonStyle = { width: '100px' };

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Box flex="1" ml={4} p={5} bg={bg} borderRadius="md" color={color}>
          <Stack spacing={4}>
            <InputGroup>
              <InputLeftAddon style={inputLeftAddonStyle} children="Name" />
              <Input
                placeholder="Item name"
                value={inputValues.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <InputLeftAddon style={inputLeftAddonStyle} children="Description" />
              <Input
                placeholder="Item description"
                value={inputValues.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <InputLeftAddon style={inputLeftAddonStyle} children="Image" />
              <Input
                placeholder="Image URL"
                value={inputValues.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <InputLeftAddon style={inputLeftAddonStyle} children="Quantity" />
              <Input
                placeholder="Enter quantity"
                type="number" // Set input type to number
                value={inputValues.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)} // Update quantity
              />
            </InputGroup>

            <InputGroup>
              <InputLeftAddon style={inputLeftAddonStyle} children="Category" />
              <Input
                placeholder="Fruit/Legumes/etc"
                value={inputValues.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              />
            </InputGroup>

            <Flex justifyContent="center">
              <Button size="sm" colorScheme="green" style={buttonStyle} onClick={handleAddItem}>
                Add Item
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default AddItem;
