const { ApolloServer, gql } = require('apollo-server');
const {buildFederatedSchema} = require("@apollo/federation");
const fetch = require("node-fetch");

const port = 4001;
const apiUrl = "http://localhost:3000";

const typeDefs = gql`
    type User @key(fields: "id") {
        id: ID!
        name: String
        posts: [Post]
    }

    extend type Post @key(fields: "id") {
        id: ID! @external
        users: [User]
    }

    extend type Query {
        fetchUser(id: ID!): User
        fetchAllUsers: [User]
    }
`;

const resolvers = {
    User: {
        posts(user) {
            return user.posts.map(id => ({__typename: "User", id}));
        }
    },
    Post: {
       async users(post) {
            const res = await fetch(`${apiUrl}/users`);
            const users = res.json();

            return users.filter(({posts}) => post.includes(parseInt(post.id)));
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