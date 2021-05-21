const { ApolloServer, gql } = require('apollo-server');
const {buildFederatedSchema} = require("@apollo/federation");
const fetch = require("node-fetch");

const port = 4001;
const apiUrl = "http://localhost:3000";

// Subgraph for Users Service.
const typeDefs = gql`
    type User @key(fields: "id") {
        id: ID!
        name: String
        posts: [Post]
    }

    extend type Post @key(fields: "id") {
        id: ID! @external
        author: User
    }

    extend type Query {
        fetchUser(id: ID!): User!
        fetchAllUsers: [User!]!
    }
`;

// All data is fetched from json datastore under the /users resource "Table" of sorts.
const resolvers = {
   User: {
        __resolveReference(ref) {
            return fetch(`${apiUrl}/users/${ref.id}`).then(res => res.json());
        },
        posts(user) {
            return user.posts.map(id => ({__typename: "Post", id}));
        }
    },
    Post: {
       async author(post) {
            const res = await fetch(`${apiUrl}/users`);
            const users = await res.json();

            // NOTE: This is the key line of code for the link between the post back to the authoer/user.
            return users.filter(({posts}) => posts.includes(parseInt(post.id)))[0];
        }
    },
 
    Query: {
        fetchUser(_, { id }) {
            return fetch(`${apiUrl}/users/${id}`).then(res => res.json());
        },
        fetchAllUsers() {
            return fetch(`${apiUrl}/users`).then(res => res.json());
        }
}
};

const server = new ApolloServer({
    schema: buildFederatedSchema([{typeDefs, resolvers}])
});


server.listen({port}).then(({url, port}) => {
    console.log(`User subgraph on port:${port} \n ready at: ${url}`);
});