const { ApolloServer, gql } = require('apollo-server');
const {buildFederatedSchema} = require("@apollo");
const fetch = require("node-fetch");
const port = 4001;
const apiUrl = "http://localhost:3000";

const typeDefs = gql`
    type 
`;
