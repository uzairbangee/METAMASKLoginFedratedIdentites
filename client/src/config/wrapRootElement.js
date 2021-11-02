import React from "react";
import { Web3ReactProvider } from '@web3-react/core';
import {AuthProvider} from "../context/AuthProvider"
import {getLibrary} from "./getLibrary";
import Amplify, { Auth } from "aws-amplify";
import awsmobile from "../aws-exports";
import store from '../store/index';

export const wrapRootElement = ({ element }) => {
    console.log("awsmobile ", awsmobile)
    Amplify.configure({
        ...awsmobile, 
        Analytics: {
            disabled: true,
        }
    });
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
                {element}
        </Web3ReactProvider>
    )
}