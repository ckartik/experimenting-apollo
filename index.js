const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`

  type Post {
    title: String
    user: String!
  }
  type Query {
    posts: [Post]
  }
`;
