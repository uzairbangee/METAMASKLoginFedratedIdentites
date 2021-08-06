import gql from "graphql-tag";

export const addTodo = gql`
  mutation AddTodo($todo: TodoInput!) {
    addTodo(todo: $todo) {
      id
      title
      done
    }
  }
`;