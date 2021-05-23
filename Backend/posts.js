const { ApolloServer, gql } = require('apollo-server');
const {buildFederatedSchema} = require("@apollo/federation");
const fetch = require("node-fetch");

const port = 4002;
const apiUrl = "http://localhost:3000";

// Subgraph for Posts service.
const typeDefs = gql`
    type Post @key(fields: "id"){
        id: ID!
        name: String
        updatedAt: String
        createdAt: String!
    }

    extend type User @key(fields: "id") {
        id: ID! @external
    }

    extend type Query {
        fetchPost(id: ID!): Post!
        fetchAllPosts: [Post!]!
    }
`;

// All data is fetched from json datastore under the /posts resource "Table" of sorts.
const resolvers = {
    Post: {
        __resolveReference(ref) {
            return fetch(`${apiUrl}/posts/${ref.id}`).then(res => res.json());
        },
    },
    Query: {
        fetchPost(_, { id }) {
            return fetch(`${apiUrl}/posts/${id}`).then(res => res.json());
        },
        fetchAllPosts() {
            return fetch(`${apiUrl}/posts`).then(res => res.json());
        }
    }
};

const server = new ApolloServer({
    schema: buildFederatedSchema([{typeDefs, resolvers}])
});


server.listen({port}).then(({url, port}) => {
    console.log(`Posts subgraph on port:${port} ready at: ${url}`);
});