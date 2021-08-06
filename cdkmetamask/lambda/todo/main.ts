import addTodo from './addTodo';
import getTodos from './getTodos';


import Todo from './Todo';

type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        todoId: string,
        todo: Todo
    }
}

exports.handler = async (event: AppSyncEvent) => {
    console.log("event", event)
    switch (event.info.fieldName) {

        case "addTodo":
            return await addTodo(event.arguments.todo);
        case "getTodos":
            return await getTodos();
        default:
            return null;
    }
}