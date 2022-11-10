import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})


export async function createAttachmentPresignedUrl(imageId: string) {

    const uploadUrl = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: parseInt(urlExpiration)
    })

    return uploadUrl
}

export function createAttachmentUrl(imageId: string) {
    return `https://${bucketName}.s3.amazonaws.com/${imageId}`
}

export async function deleteAttachement(imageId: string) {
    s3.deleteObject({
        Bucket: bucketName,
        Key: imageId
    })
}