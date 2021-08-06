import React, { useState, useEffect, useContext } from 'react';
import { AwsContext } from '../context/AwsProvider';
import { AuthContext } from '../context/AuthProvider';
import {addTodo} from "../graphql/mutation";
import { ApolloProvider } from 'react-apollo';
import { Rehydrated } from 'aws-appsync-react';

function Dashboard() {
  const { client } = React.useContext(AwsContext);
  const [todo, setTodo] = useState("");
  const { authState, dispatch } = useContext(AuthContext);

  console.log("client ", client);

  const logout = () => {
    dispatch({
        type: 'LOGOUT',
    });
  }

  const add = async () => {
    if(client){
      try {
        const todoInput = {
          id: todo,
          title: todo,
          done: false
        }
        const added = await client.mutate({
          mutation: addTodo,
          variables: {
            todo: todoInput
          },
        });
        setTodo("")
        console.log("added ", added);
      } catch (error) {
        console.log("error ", error)
      }
    }
  }

//   useEffect(() => {
//     const fetchHelloAPI = async () => {
//       if (awsClient) {
//         const request = await awsClient.sign(
//           `${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_HELLO_PATH}?name=YA`,
//           {
//             method: 'GET',
//           }
//         );

//         const response = await fetch(request);
//         setState(await response.json());
//       }
//     };
//     fetchHelloAPI();
//   }, [awsClient]);

  return (
    <div className='home'>
      <div className='content'>
        <h1>Dashboard</h1>
        <button onClick={logout}>logout</button>
        <br/>
        <br/>
        <br/>
        <input name="todo" value={todo} onChange={(e) => setTodo(e.target.value)}/>
        <button onClick={add}>ADD</button>
      </div>
    </div>
  );
}

export default Dashboard;
