import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { createAttachmentUrl } from './attachmentUtils'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ) { }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting All todos with user's id ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todosTable, KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise()

        const items = result.Items

        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`Creating a todo with id ${todo.todoId}`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    async updateTodo(todo: TodoUpdate, todoId: string, userId: string): Promise<TodoItem> {
        logger.info(`Update todo with id ${todoId}`)

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todo.name,
                ':dueDate': todo.dueDate,
                ':done': todo.done
            },
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ReturnValues: "ALL_NEW"
        }).promise()

        return result.Attributes as TodoItem
    }

    async deleteTodo(todoId: string, userId: string): Promise<TodoItem> {
        logger.info(`Delete todo with id ${todoId}`)

        const result = await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            ReturnValues: 'ALL_OLD'
        }).promise()

        return result.Attributes as TodoItem
    }

    async addAttachmentUrlToTodo(userId: string, todoId: string): Promise<void> {

        logger.info(`Add attachment to todo with id ${todoId}`)
        const attachmentUrl = createAttachmentUrl(todoId)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set attachmentUrl=:attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl
            }
        }).promise()


    }


}