import React, { useState, useEffect } from 'react';
import { useQuery, gql } from "@apollo/client";
import {
  Box,
  Flex,
  Stat,
  Text,
  StatLabel,
  StatNumber,
  StatHelpText,
  Stack,
  useColorModeValue,
  useBreakpointValue
} from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { MdCallMade, MdCallReceived } from "react-icons/md";
import Header from "../layout/Header";
import Sidebar from "../layout/Sidebar";
import Footer from "../layout/Footer";
import { useNavigate } from "react-router-dom";
import Auth from "../utils/auth";
import { getDataDistribution } from "../utils/api";

const DASHBOARD_DATA = gql`
  query GetDashboardData {
    products {
      name
      quantity
    }
    categories {
      name
      products {
        name
        quantity
      }
    }
  }
`;

function Dashboard() {
  const { loading: Ploading, error: Perror, data: Pdata } = useQuery(DASHBOARD_DATA);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useBreakpointValue({ base: true, md: false }); // Determine if mobile or not

  const navigate = useNavigate();
  const bg = useColorModeValue("white", "gray.800");

  const fetchData = async () => {
    try {
      const inventoryData = await getDataDistribution();
      setData(inventoryData);
      console.log(inventoryData);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Auth.loggedIn()) {
      console.log("error");
      navigate("/"); // Redirect if not logged in
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  if (Ploading) return <p>Loading...</p>;
  if (Perror) return <p>Error: {Perror.message}</p>;

  const totalProducts = Pdata.products.length;
  const totalCategories = Pdata.categories.length + 2;  // Adding 2 categories as per your logic
  const totalQuantity = Pdata.products.reduce((sum, product) => sum + product.quantity, 0);

  const right = {
    padding: "25px",
    flex: "80%"
  };

  const table_text = {
    fontSize: "20px",
  };

  const ReceiveIcon = {
    color: 'green'
  };

  const DistributeIcon = {
    color: 'red'
  };

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" className='main' flex="1" p={1}>
        <Sidebar />
        <Box style={right} bg={bg} borderRadius="md" flex="1">
          <Stack spacing={2}>
            <Flex justify="space-between">
              <Stat>
                <StatLabel>Total Products</StatLabel>
                <StatNumber>{totalProducts}</StatNumber>
                <StatHelpText>Available in inventory</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Total Categories</StatLabel>
                <StatNumber>{totalCategories}</StatNumber>
                <StatHelpText>Product categories</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Total Quantity</StatLabel>
                <StatNumber>{totalQuantity}</StatNumber>
                <StatHelpText>Total kg in stock</StatHelpText>
              </Stat>
            </Flex>
            <Box overflowX="auto">
              {data ? (
                <Table variant="simple" m={0} p={0}>
                  <Thead>
                    <Tr>
                      <Th>Op.</Th>
                      {!isMobile && <Th>Operation</Th>}
                      <Th>Products No.</Th>
                      <Th>Units</Th>
                      <Th>Total</Th>
                      {!isMobile && (
                        <>
                          <Th>Purpose</Th>
                          <Th>BatchSize</Th>
                          <Th>Date</Th>
                        </>
                      )}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.map((transaction, index) => (
                      <Tr key={index}>
                        <Td style={table_text}>
                          {transaction.operation === "Receive" ? <MdCallReceived style={ReceiveIcon} /> : <MdCallMade style={DistributeIcon} />}
                        </Td>
                        {!isMobile && <Td style={table_text}>{transaction.operation}</Td>}
                        <Td style={table_text}>{transaction.product.length}</Td>
                        <Td style={table_text}>{transaction.unit}</Td>
                        <Td style={table_text}>
                          {transaction.product.map(product => product.quantity * transaction.unit).reduce((sum, quantity) => sum + quantity, 0)}
                        </Td>
                        {!isMobile && (
                          <>
                            <Td style={table_text}>{transaction.purpose}</Td>
                            <Td style={table_text}>{transaction.batchSize}</Td>
                            <Td style={table_text}>{new Date(transaction.createdAt).toLocaleDateString()}</Td>
                          </>
                        )}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (false)}
              {loading && <Text mb={4}>Loading...</Text>}
              {error && <Text mb={4}>Error: {error.message}</Text>}
            </Box>
          </Stack>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default Dashboard;
