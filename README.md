# bwxBASIC

**bwxBASIC** is a modern, web-based implementation of the classic BASIC programming language. Inspired by Applesoft BASIC, it enhances the traditional experience with structured graphics commands, a modern full-screen code editor, and a vibrant 256-color palette. 

It runs entirely in the browser, providing a seamless environment for writing, running, and sharing classic BASIC programs without needing emulators or external dependencies.

bwxBASIC is officially served at: **[bwxbasic.org](https://bwxbasic.org)**

## Features
*   **Modern Editor**: Built-in syntax highlighting (via CodeJar) and reliable auto-indentation.
*   **Rich Graphics**: 256-color extended palette and structural drawing commands (Rectangles, Ellipses, Triangles).
*   **File Management**: Save, load, download, and upload `.bas` files locally or to/from your OS.
*   **Client-Side Execution**: Code is transpiled efficiently into JavaScript on the fly and executed securely entirely within the browser sandbox.

## Local Development (Running Locally)

Because bwxBASIC uses modern JavaScript ES Modules (`import`/`export`), you cannot simply double-click the `bwxBASIC.html` file to open it in a browser directly from your file system (due to CORS security restrictions on `file://` protocols). You must serve it over HTTP.

### Option 1: Python (Quickest)
If you have Python installed, you can spin up a quick local web server in the project directory:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open your browser to: `http://localhost:8000/bwxBASIC.html`

### Option 2: Node.js (http-server)
If you prefer Node.js, you can use `http-server`:

```bash
npx http-server -p 8000
```
Then open your browser to: `http://localhost:8000/bwxBASIC.html`

---

## Production Deployment

bwxBASIC requires no backend logic, databases, or build steps. It is a pure static site (HTML, CSS, JS). Deploying it is as simple as serving the static files.

### Nginx Configuration

To serve bwxBASIC using Nginx, point the `root` directive to your project directory.

```nginx
server {
    listen 80;
    server_name bwxbasic.org www.bwxbasic.org;

    root /path/to/BWXbasic2026;
    index bwxBASIC.html;

    location / {
        try_files $uri $uri/ /bwxBASIC.html;
    }

    # Optional: Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|bas)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### Apache Configuration

To serve bwxBASIC using Apache, ensure the DocumentRoot points to your project folder. You may also want an `.htaccess` file if you plan on rewriting URLs later, but for the base setup, only virtual host configuration is required:

```apache
<VirtualHost *:80>
    ServerName bwxbasic.org
    ServerAlias www.bwxbasic.org
    DocumentRoot /path/to/BWXbasic2026

    <Directory /path/to/BWXbasic2026>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Ensure bwxBASIC.html is loaded by default if someone hits the root
        DirectoryIndex bwxBASIC.html
    </Directory>
</VirtualHost>
```
