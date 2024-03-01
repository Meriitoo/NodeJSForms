const http = require('http');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const { EOL } = require('os');

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, {
            'content-type': 'text/html'
        });

        res.write(`
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Node JS Form</title>
        </head>
        
        <body>
            <form action="/upload2" method="POST" enctype="multipart/form-data">
                <div>
                    <label for="username">Dog name:</label>
                    <input type="text" name="username" id="username" />
                </div>
                <div>
                    <label for="breed">Breed:</label>
                    <input type="text" name="breed" id="breed" />
                </div>
                <div>
                    <label for="breed">Age:</label>
                    <input type="text" name="age" id="age" />
                </div>
                <div>
                    <label for="avatar">Avatar</label>
                    <input type="file" name="avatar" id="avatar" />
                </div>
                <div>
                    <input type="submit" value="Register Dog">
                </div>
            </form>
        </body>
        
        </html>
        `);

        res.end();
        // Simple form
    } else if (req.url === '/' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('close', () => {
            const data = querystring.parse(body);

            console.log(data);

            res.end();
        });
    } else if (req.url === '/upload' && req.method === 'POST') {
        const body = [];

        req.on('data', chunk => {
            body.push(chunk);
        });

        req.on('close', () => {
            const dataBuffer = Buffer.concat(body);
            const data = dataBuffer.toString('binary');
            const bondary = req.headers['content-type'].split('boundary=').at(1);
            const parts = data.split(`--${bondary}`);

            const [meta, imageData] = parts[3].split(EOL + EOL);
            const fileName = meta.match(/filename="(.+)"/)[1];
            const savePath = path.join(__dirname, 'uploads', fileName);

            fs.writeFile(savePath, imageData, 'binary', (err) => {
                if (err) {
                    return res.end();
                }

                console.log('Image uploaded');

                res.writeHead(302, {
                    'location': '/'
                });
                res.end();
            });
        });
    } else if (req.url === '/upload2' && req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            res.writeHead(200, { 'content-type': 'text/html' });
            
            res.write(`<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Submitted Data</title>
            </head>
            <body>`);

            res.write('<h1>Submitted Data:</h1>');
            res.write('<ul>');

            Object.entries(fields).forEach(([key, value]) => {
                res.write(`<li><strong>${key}:</strong> ${value}</li>`);
            });

            res.write('</ul>');
            res.write('<a href="/">Back to form</a>');
            res.write('</body></html>');
            res.end();
        });
    }
});

server.listen(5000);
console.log('Server is listening on port 5000...');