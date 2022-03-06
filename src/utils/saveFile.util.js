import request from 'request';
import fs from 'fs';


export function saveFileInTemp(url, filePath)
{
    return new Promise((resolve, reject) =>
    {
        try {

            console.log("this is filePath and url>>", filePath, url);
            const writeStream = fs.createWriteStream(filePath);

            const urlRes = request.get(url)

            urlRes.on('error', (e) =>
            {
                console.log("Error", e)
                resolve(false);
            })

            urlRes.pipe(writeStream);
            writeStream.on('error', (error) => 
            {
                console.log("Error while writing file", error)
                resolve(false);
            })

            writeStream.on('finish', () =>
            {
                resolve(true)
                return
            })
        }
        catch (error) {
            console.log("Error ::", error)
            resolve(false)
        }
    })

}