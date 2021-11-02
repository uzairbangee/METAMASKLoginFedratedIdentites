// import gql from "graphql-tag";

export const findUser = /* GraphQL */ `
  query findUser($address: ID!) {
    findUser(address: $address) {
      address
      nonce
    }
  }
`;

export const authUser = /* GraphQL */ `
  query authUser {
    authUser {
      address
      nonce
      name
    }
  }
`;

export const signup = /* GraphQL */ `
  mutation signup($address: ID!) {
    signup(address: $address) {
      address
      nonce
    }
  }
`;

export const authenticate = /* GraphQL */ `
  mutation authenticate($address: ID!, $signature: String!) {
    authenticate(address: $address, signature: $signature)
  }
`;