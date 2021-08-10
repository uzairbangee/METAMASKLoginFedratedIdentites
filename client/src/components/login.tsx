import React, { useEffect, useContext } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import MetaMaskOnboarding from '@metamask/onboarding';
import { AuthContext } from '../context/AuthProvider';
import { AwsContext } from '../context/AwsProvider';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import awsconfig from "../aws-exports";

const web3 = new Web3(Web3.givenProvider);
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
  const { dispatch } = React.useContext(AuthContext);
  const { setAwsClient } = React.useContext(AwsContext);

  const initialState = {
    isSubmitting: false,
    errorMessage: null,
    isMetamaskInstalled: true,
  };

  const [data, setData] = React.useState<initalDataProps>(initialState);

  useEffect(() => {
    checkMetaMaskClient();
  }, []);

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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });

    try {
      if (checkMetaMaskClient()) {
        const accounts = await window?.ethereum?.request({
          method: 'eth_requestAccounts',
        });
        const address = accounts[0];
        let {
          data: { nonce },
        } = await axios(
          `https://9d3y8d4bfc.execute-api.us-east-1.amazonaws.com/prod/getnonce?address=${address.toLowerCase()}`,
          {
            method: 'GET'
          }
        );
        console.log("nonce ", nonce)
        if (!nonce) {
          const { data } = await axios.post(
            `https://9d3y8d4bfc.execute-api.us-east-1.amazonaws.com/prod/signup`,
            { address: address.toLowerCase() },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          console.log("data ", data);
          if (data && data.Attributes) {
            nonce = data.Attributes.nonce;
          }
        }

        const signature = await web3.eth.personal.sign(
          web3.utils.sha3(`Welcome message, nonce: ${nonce}`) || "",
          address,
          ""
        );

        console.log("signature ", signature)

        const { data } = await axios.post(
          `https://9d3y8d4bfc.execute-api.us-east-1.amazonaws.com/prod/login`,
          {
            address,
            signature,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log("data", data);
      } else {
        setData({
          ...data,
          isSubmitting: false,
          errorMessage: "Metamask isn't installed, Please install Metamask",
        });
      }
    } catch (error) {
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: error.message || error.statusText,
      });
    }
  };

  return (
    <div className='login-container'>
      <div className='card'>
        <div className='container'>
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