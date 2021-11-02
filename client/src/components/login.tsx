import React, { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { metaMask } from '../config/connector';
// import { formatEther } from '@ethersproject/units';
import { useEagerConnect, useInactiveListener } from '../hooks/connection';
import axios from 'axios';
import MetaMaskOnboarding from '@metamask/onboarding';
// import { AuthContext } from '../context/AuthProvider';
// import { AwsContext } from '../context/AwsProvider';
// import awsconfig from "../aws-exports";
import { API } from "aws-amplify";
import {findUser, signup, authenticate, authUser} from "../graphql/mutation";
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';

const forwarderOrigin = 'http://localhost:8000';
const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

declare global {
  interface Window {
      ethereum: any;
  }
}

const isMetaMaskInstalled = () => {
  const { ethereum }: any = window;
  return Boolean(ethereum && ethereum.isMetaMask);
};

interface initalDataProps {
  isSubmitting: boolean,
  errorMessage: string | null,
  isMetamaskInstalled: boolean,
}

export const Login = () => {
  // const { dispatch } = React.useContext(AuthContext);
  // const { setAwsClient } = React.useContext(AwsContext);

  const {
    connector,
    library,
    account,
    chainId,
    activate,
    deactivate,
    active,
    error,
  } = useWeb3React();

  console.log("account", account)

  const [blockNumber, setBlockNumber] = useState<any>(undefined);
  const [ethBalance, setEthBalance] = useState<any>();
  const [activatingConnector, setActivatingConnector] = useState<any>();

  let connected = connector === metaMask;
  const disabled = !!activatingConnector || connected || !!error;

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  const initialState = {
    isSubmitting: false,
    errorMessage: null,
    isMetamaskInstalled: true,
  };

    const [data, setData] = React.useState<initalDataProps>(initialState);

  const installMetamask = () => {
    onboarding.startOnboarding();
  };

  const checkMetaMaskClient = () => {
    if (isMetaMaskInstalled()) {
      data.isMetamaskInstalled === false &&
        setData({
          ...data,
          isMetamaskInstalled: true,
        });
      return true;
    }
    return false;
  };

  useEffect(() => {
    checkMetaMaskClient();
  }, []);

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  useEffect(() => {
    if (library) {
      let stale = false;
      library
        .getBlockNumber()
        .then(blockNumber => {
          if (!stale) {
            setBlockNumber(blockNumber);
          }
        })
        .catch(() => {
          if (!stale) {
            setBlockNumber(null);
          }
        });

      const updateBlockNumber = blockNumber => {
        setBlockNumber(blockNumber);
      };
      library.on("block", updateBlockNumber);

      return () => {
        library.removeListener("block", updateBlockNumber);
        stale = true;
        setBlockNumber(undefined);
      };
    }
  }, [library, chainId]);

  useEffect(() => {
    if (library && account) {
      let stale = false;

      library
        .getBalance(account)
        .then(balance => {
          if (!stale) {
            setEthBalance(balance);
          }
        })
        .catch(() => {
          if (!stale) {
            setEthBalance(null);
          }
        });

      return () => {
        stale = true;
        setEthBalance(undefined);
      };
    }
  }, [library, account, chainId]);

  // const onClickActivate = async () => {
  //   activate(metaMask);
  //   setActivatingConnector(metaMask);
  // };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    await activate(metaMask);
    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });

    try {
      if (checkMetaMaskClient() && account) {
        console.log("innn", findUser)
        // const accounts = await window?.ethereum?.request({
        //   method: 'eth_requestAccounts',
        // });
        let nonce: string = ""
        const address = account;
        const find: any = await API.graphql({
          query: findUser,
          variables: {address},
        })

        if (!find?.data.findUser.nonce) {
          const sign: any = await API.graphql({
            query: signup,
            variables: {address},
          })
          nonce = sign?.data.signup.nonce;
        }
        else{
          nonce = find?.data.findUser.nonce;
        }

        const signature = await library.getSigner(address).signMessage(`My App Auth Service Signing nonce: ${nonce}`)

        console.log("signature ", signature)
        const login: any = await API.graphql({
          query: authenticate,
          variables: {address, signature},
        })

        console.log("login ", login.data.authenticate)

        const auth: any = await API.graphql({
          query: authUser,
          authMode: GRAPHQL_AUTH_MODE.AWS_LAMBDA,
          authToken: `Bearer ${login.data.authenticate}`
        })

        console.log("auth ", auth.data)

      //     const { data } = await axios.post(
      //       `https://e0lf4f0407.execute-api.us-east-1.amazonaws.com/prod/signup`,
      //       { publicAddress: address.toLowerCase() },
      //       {
      //         headers: {
      //           'Content-Type': 'application/json',
      //         },
      //       }
      //     );
      //     console.log("dataSignup ", data);
      //     if (data && data.nonce) {
      //       nonce = data.nonce;
      //     }
      //   }
      //   else{
      //     nonce = nonce.data.nonce;
      //   }
          
      //   // const signature1 = await web3.eth.personal.sign(
      //   //   web3.utils.sha3(`Welcome message, nonce: ${nonce}`) || "",
      //   //   address,
      //   //   ""
      //   // );

      //   // console.log("signature1 ", signature1)


      //   const signature = await library.getSigner(address).signMessage(`My App Auth Service Signing nonce: ${nonce}`)

      //   console.log("signature ", signature)


      //   const { data } = await axios.post(
      //     `https://e0lf4f0407.execute-api.us-east-1.amazonaws.com/prod/authenticate`,
      //     {
      //       publicAddress: address.toLowerCase(),
      //       signature,
      //     },
      //     {
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //     }
      //   );
      //   console.log("data", data);

      //   const authUser = await axios.get(`https://e0lf4f0407.execute-api.us-east-1.amazonaws.com/prod/authuser`,
      //   {
      //       headers: {
      //           Authorization: `Bearer ${data}`,
      //       },
      //   }
      // );

      // console.log("authUser ", data);

        setActivatingConnector(metaMask);
      } else {
        setData({
          ...data,
          isSubmitting: false,
          errorMessage: "Metamask isn't installed, Please install Metamask",
        });
      }
    } catch (error) {

      console.log("erorr", error)
      setData({
        ...data,
        isSubmitting: false,
      });
    }
  };

  return (
    <div className='login-container'>
      <div className='card'>
        <div className='container'>
          {active ? "🟢" : error ? "🔴" : "🟠"}
          {/* <button
            onClick={(e) => {
              handleFormSubmit(e);
            }}>
            Login with Metamask
          </button> */}
          <form onSubmit={handleFormSubmit}>
            <h1>Login</h1>
            {data.errorMessage && (
              <span className='form-error'>{data.errorMessage}</span>
            )}
            {data.isMetamaskInstalled ? (
              <button disabled={data.isSubmitting}>
                {data.isSubmitting ? (
                   <p> Loading ...</p>
                ) : (
                  'Login with Metamask'
                )}
              </button>
            ) : (
              <button type='button' onClick={installMetamask}>
                Install Metamask'
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;