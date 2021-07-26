import React, { useState, useEffect, useContext } from 'react';
import { AwsContext } from '../context/AwsProvider';
import { AuthContext } from '../context/AuthProvider';

function Dashboard() {
  const { awsClient } = React.useContext(AwsContext);
  const [state, setState] = useState({ data: '' });
  const { authState, dispatch } = useContext(AuthContext);

  const logout = () => {
    dispatch({
        type: 'LOGOUT',
    });
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
      </div>
    </div>
  );
}

export default Dashboard;
