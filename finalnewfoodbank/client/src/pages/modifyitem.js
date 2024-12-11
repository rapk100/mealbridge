import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { 
  InputGroup, 
  Input, 
  InputLeftAddon, 
  Button, 
  Flex, 
  Box, 
  List, 
  ListItem, 
  useColorModeValue 
} from '@chakra-ui/react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

// GraphQL Queries
const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      name
    }
  }
`;

const GET_PRODUCT_BY_NAME = gql`
  query GetProductByName($name: String!) {
    product(name: $name) {
      _id
      name
      description
      image
      quantity
      category
    }
  }
`;

function ModifyItem() {
  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.700", "gray.200");

  const [searchName, setSearchName] = useState('');
  const [showMessage, setShowMessage] = useState(false);  // State to show message after search

  const { loading, data } = useQuery(GET_PRODUCT_BY_NAME, {
    variables: { name: searchName },
    skip: !searchName, // Prevent query if searchName is empty
  });

  const { data: productsData } = useQuery(GET_PRODUCTS);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearchChange = (e) => {
    const value = e.target.value.trim();
    setSearchName(value);

    if (value && productsData) {
      const filteredProducts = productsData.products.filter((product) =>
        product.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredProducts.map((product) => product.name));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchName(suggestion);
    setSuggestions([]);
  };

  const handleSearchClick = () => {
    setShowMessage(true);  // Show the message when search button is clicked
  };

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4} direction="row" flexWrap="wrap">
        <Sidebar />
        <Box flex="1" bg={bg} color={color} borderRadius="md" p={4}>
          <InputGroup mb={4}>
            <InputLeftAddon children="Search by Name" />
            <Input
              placeholder="Product name"
              value={searchName}
              onChange={handleSearchChange}
            />
            <Button ml={2} onClick={handleSearchClick} isDisabled={!searchName}>
              Search
            </Button>
          </InputGroup>

          {suggestions.length > 0 && (
            <List mb={4}>
              {suggestions.map((suggestion, index) => (
                <ListItem
                  key={index}
                  cursor="pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </ListItem>
              ))}
            </List>
          )}

          {loading && <p>Loading...</p>}

          {showMessage && (
            <p style={{ marginTop: '20px', fontSize: '18px', color: 'green' }}>
              Yes, it is available!
            </p>
          )}

          {data && data.product && (
            <Box>
              <h3>{data.product.name}</h3>
              <p><strong>Description:</strong> {data.product.description}</p>
              <p><strong>Category:</strong> {data.product.category}</p>
              <p><strong>Quantity:</strong> {data.product.quantity}</p>
            </Box>
          )}
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default ModifyItem;
