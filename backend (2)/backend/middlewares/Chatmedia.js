const fs = require('fs');
const path = require('path');


// Serve static files from the 'uploads' directory

function saveFile(directory, fileName, fileData) {
    return new Promise((resolve, reject) => {
      // Ensure the directory exists
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
  
      const filePath = path.join(directory, fileName);
      fs.writeFile(filePath, Buffer.from(fileData), (err) => {
        if (err) {
          console.error('File saving failed', err);
          reject(err);
        } else {
          console.log('File received and saved successfully');
          resolve(filePath);
        }
      });
    });
  }
  
module.exports = saveFile;