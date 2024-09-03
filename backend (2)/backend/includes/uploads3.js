const AWS = require('aws-sdk');

// Define the allowed extensions
const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv'];
const documentExtensions = ['.sql', '.pdf', '.docx', '.zip'];
const imageExtensions = ['.png', '.jpg', '.jpeg'];

// Define MIME types for each category
const videoMimeTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv'];
const documentMimeTypes = ['application/sql', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'];
const imageMimeTypes = ['image/png', 'image/jpeg'];

AWS.config.update({
    accessKeyId: 'AKIAQGYBPWNLUU33FWT7',
    secretAccessKey: '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',
    region: 'ap-southeast-2'
});

const getExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
};

const isValidExtension = (filename, validExtensions) => {
    const extension = getExtension(filename);
    return validExtensions.includes(extension);
};

const uploadToS3 = async (mediaItem) => {
    const s3 = new AWS.S3();

    try {
        let fileContent;
        if (mediaItem.data instanceof Buffer) {
            fileContent = mediaItem.data;
        } else if (typeof mediaItem.data === 'string') {
            fileContent = Buffer.from(mediaItem.data, 'base64');
        } else {
            throw new Error('Invalid data type for mediaItem');
        }

        // Determine allowed extensions based on the MIME type
        let validExtensions = [];
        if (videoMimeTypes.includes(mediaItem.type)) {
            validExtensions = videoExtensions;
        } else if (imageMimeTypes.includes(mediaItem.type)) {
            validExtensions = imageExtensions;
        } else if (documentMimeTypes.includes(mediaItem.type)) {
            validExtensions = documentExtensions;
        } else {
            throw new Error('The uploaded file is not a recognized media type');
        }

        // Validate the file extension
        if (!isValidExtension(mediaItem.filename, validExtensions)) {
            throw new Error('The file extension is not allowed');
        }

        const folder = validExtensions === videoExtensions ? 'video/' :
                        validExtensions === imageExtensions ? 'image/' :
                        'document/';

        const params = {
            Bucket: "project-mgt",
            Key: `${folder}${mediaItem.filename}`,
            Body: fileContent,
            ContentType: mediaItem.type,
        };

        const data = await s3.upload(params).promise();
        console.log("File uploaded to S3:", data.Location);
        return data.Location;
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw error;
    }
};

const uploadMedia = async (mediaArray = []) => {
    const results = [];
    for (let mediaItem of mediaArray) {
        try {
            console.log("Aws", mediaItem, mediaItem.filename, mediaItem.data, mediaItem.type);
            
            if (!mediaItem || !mediaItem.filename || !mediaItem.data || !mediaItem.type) {
                console.error('Invalid mediaItem format:', mediaItem);
                throw new Error('Invalid mediaItem format');
            }

            const s3Url = await uploadToS3(mediaItem);
            results.push(s3Url);
        } catch (error) {
            console.error("Error uploading media:", error);
            results.push(null);
        }
    }
    return results;
};

module.exports = {
    uploadMedia
};


// const AWS = require("aws-sdk");

// AWS.config.update({
//     accessKeyId: 'AKIAQGYBPWNLUU33FWT7',
//     secretAccessKey: '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',
//     region: 'ap-southeast-2'

// });

// const AWS = require('aws-sdk');

// // Define the allowed extensions
// const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv'];
// const documentExtensions = ['.sql', '.pdf', '.docx', '.zip'];
// const imageExtensions = ['.png', '.jpg', '.jpeg'];

// const getExtension = (filename) => {
//     const parts = filename.split('.');
//     return parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
// };

// const isValidExtension = (filename, validExtensions) => {
//     const extension = getExtension(filename);
//     return validExtensions.includes(extension);
// };

// const uploadToS3 = async (mediaItem) => {
//     const s3 = new AWS.S3();

//     try {
//         let fileContent;
//         if (mediaItem.data instanceof Buffer) {
//             fileContent = mediaItem.data;
//         } else if (typeof mediaItem.data === 'string') {
//             fileContent = Buffer.from(mediaItem.data, 'base64');
//         } else {
//             throw new Error('Invalid data type for mediaItem');
//         }

//         // Determine allowed extensions based on the MIME type
//         let validExtensions = [];
//         if (videoMimeTypes.includes(mediaItem.type)) {
//             validExtensions = videoExtensions;
//         } else if (imageMimeTypes.includes(mediaItem.type)) {
//             validExtensions = imageExtensions;
//         } else if (audioMimeTypes.includes(mediaItem.type)) {
//             validExtensions = audioExtensions;
//         } else {
//             throw new Error('The uploaded file is not a recognized media type');
//         }

//         // Validate the file extension
//         if (!isValidExtension(mediaItem.filename, validExtensions)) {
//             throw new Error('The file extension is not allowed');
//         }

//         const folder = validExtensions === videoExtensions ? 'video/' :
//                         validExtensions === imageExtensions ? 'image/' :
//                         'audio/';

//         const params = {
//             Bucket: "project-mgt",
//             Key: `${folder}${mediaItem.filename}`,
//             Body: fileContent,
//             ContentType: mediaItem.type,
//         };

//         const data = await s3.upload(params).promise();
//         console.log("File uploaded to S3:", data.Location);
//         return data.Location;
//     } catch (error) {
//         console.error("Error uploading file to S3:", error);
//         throw error;
//     }
// };




// const uploadMedia = async (mediaArray = []) => {
//     const results = [];
//     for (let mediaItem of mediaArray) {
//         try {
//             console.log("Aws" , mediaItem , mediaItem.filename , mediaItem.data , mediaItem.type);
            
//             if (!mediaItem || !mediaItem.filename || !mediaItem.data || !mediaItem.type) {
//                 console.error('Invalid mediaItem format:', mediaItem);
//                 throw new Error('Invalid mediaItem format');
//             }

//             const s3Url = await uploadToS3(mediaItem);
//             results.push(s3Url);
//         } catch (error) {
//             console.error("Error uploading media:", error);
//             results.push(null);
//         }
//     }
//     return results;
// };

// module.exports = {
//     uploadMedia
// };