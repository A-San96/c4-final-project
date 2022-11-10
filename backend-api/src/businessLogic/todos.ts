import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

import * as uuid from 'uuid'
import { createAttachmentPresignedUrl, deleteAttachement } from '../dataLayer/attachmentUtils'


const todosAccess = new TodosAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return await todosAccess.getTodosForUser(userId)

}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const itemId = uuid.v4()
    const createdAt = new Date().toISOString()
    const item: TodoItem = {
        todoId: itemId,
        userId,
        ...createTodoRequest,
        createdAt,
        done: false
    }


    return await todosAccess.createTodo(item)
}

export async function updateTodo(todo: UpdateTodoRequest, todoId: string, userId: string): Promise<TodoItem> {
    return todosAccess.updateTodo(todo, todoId, userId)
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
    const result = await todosAccess.deleteTodo(todoId, userId)

    if (result.attachmentUrl) {
        await deleteAttachement(result.todoId)
    }

}

export async function getUploadUrl(userId: string, todoId: string): Promise<string> {
    const uploadUrl = await createAttachmentPresignedUrl(todoId)
    await todosAccess.addAttachmentUrlToTodo(userId, todoId)

    return uploadUrl
}

