import { Web3Provider } from '@ethersproject/providers';

//this will give instance of library we want ether.js or web3.js i prefer use ether.js
export function getLibrary(provider: any) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 8000;
  return library;
}