import React from "react";
import { Web3ReactProvider } from '@web3-react/core';
import {AuthProvider} from "../context/AuthProvider"
import {getLibrary} from "./getLibrary";

export const wrapRootElement = ({ element }) => {

    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <AuthProvider>
                {element}
            </AuthProvider>
        </Web3ReactProvider>
    )
}