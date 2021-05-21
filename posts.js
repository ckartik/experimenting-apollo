const { ApolloServer, gql } = require('apollo-server');
const {buildFederatedSchema} = require("@apollo/federation");
const fetch = require("node-fetch");
const port = 4002;
const apiUrl = "http://localhost:3000";

const typeDefs = gql`
    type Post @key(fields: "id"){
        id: ID!
        name: String
        updatedAt: String
        createdAt: String!
        author: User
    }

    extend type User @key(fields: "id") {
        id: ID! @external
    }

    extend type Query {
        fetchPost(id: ID!): Post 
        fetchAllPosts: [Post]
    }
`;

const resolvers = {
    Post: {
        __resolveReference(ref) {
            return fetch(`${apiUrl}/posts/${ref.id}`).then(res => res.json());
        },
        author(post) {
            return { __typename: "User", id: post.id };
        }
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
    console.log(`Posts subgraph on port:${port} \n ready at: ${url}`);
});