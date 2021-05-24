import {ApolloClient, gql, InMemoryCache, useQuery} from '@apollo/client'

const client = new ApolloClient({
    uri: "http://localhost:4000",
    cache: new InMemoryCache()
})
const getPosts = gql`
    query fetchPost {
        fetchAllPosts {
            id
            name,
            author {
                name
            }
        }
    }
`
function Posts() {
    const {loading, error, data} = useQuery(getPosts, {client:client});

    if (loading) return 'Loading posts...';
    if (error) return `Error! ${error.message}`;

    return (
        <ul>
            {data.fetchAllPosts.map((post) => (
                <li key={post.id}>
                    <h4> {post.name} </h4>
                    <p> Author: {post.author.name} </p>
                    </li>
            ))}
        </ul>
    );
}

function HomePage() {
    return <div>
        Welcome to Next.js!
        <Posts/>
        </div>
}
  
export default HomePage