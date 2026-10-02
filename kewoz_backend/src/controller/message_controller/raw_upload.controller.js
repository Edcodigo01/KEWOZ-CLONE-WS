
const { generalResponse } = require("../../helper/response.helper");
const fs = require("fs");
const path = require("path");

// Parse multipart/form-data manually using simple boundary extraction
function parseMultipart(buf, boundary) {
  const parts = [];
  const str = buf.toString('binary');
  const boundaryMarker = '--' + boundary;
  const sections = str.split(boundaryMarker);
  
  for (const section of sections) {
    if (section.trim() === '--' || section.trim() === '') continue;
    
    const headerEnd = section.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    
    const headerStr = section.substring(0, headerEnd);
    const body = section.substring(headerEnd + 4);
    const bodyEnd = body.lastIndexOf('\r\n');
    const content = bodyEnd >= 0 ? body.substring(0, bodyEnd) : body;
    
    // Extract field name from Content-Disposition
    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    
    if (filenameMatch) {
      parts.push({ name: nameMatch ? nameMatch[1] : 'file', filename: filenameMatch[1], data: Buffer.from(content, 'binary'), isFile: true });
    } else if (nameMatch) {
      parts.push({ name: nameMatch[1], value: content.trim(), isFile: false });
    }
  }
  return parts;
}

async function rawUpload(req, res) {
  try {
    const user_id = req.authData.user_id;
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    
    if (!boundaryMatch) {
      return generalResponse(res, {}, 'Invalid content type', false, true, 400);
    }
    
    const boundary = boundaryMatch[1].trim();
    const parts = parseMultipart(req.body, boundary);
    
    let messageType = 'doc';
    let fileName = 'file';
    let chatId = null;
    let otherUserId = null;
    let fileData = null;
    
    for (const part of parts) {
      if (part.isFile) {
        fileData = part.data;
        fileName = part.filename || fileName;
      } else if (part.name === 'message_type') {
        messageType = part.value;
      } else if (part.name === 'message_content') {
        fileName = part.value || fileName;
      } else if (part.name === 'chat_id') {
        chatId = part.value;
      } else if (part.name === 'user_id') {
        otherUserId = part.value;
      }
    }
    
    if (!fileData) {
      return generalResponse(res, {}, 'No file found in request', false, true, 400);
    }
    
    const uploadDir = './uploads/others';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
    const savePath = path.join(uploadDir, timestamp + '-' + safeName);
    fs.writeFileSync(savePath, fileData);
    
    return generalResponse(res, {
      path: savePath,
      type: messageType,
      name: safeName,
      size: fileData.length,
    }, 'File uploaded successfully', true, false, 200);
  } catch (error) {
    console.error('rawUpload error:', error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

module.exports = { rawUpload };
