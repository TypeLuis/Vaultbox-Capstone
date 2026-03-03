## Setup

- `git clone https://github.com/TypeLuis/auth-mongoose-boilerplate.git . && rm -rf .git` 

- `npm run env` & populate env,  
**node -e in package.json means to evaluate the JS code. makes it so we do have to create a file**

- `npm i`

- `npm run dev`

# Test route is merely there for testing and referencing.

-  minio setup
- multier upload in config
- device schema haveing an array of drive schemas
- file routes explaination
- install & start minio script


<!-- Install MinIO (Linux / WSL / Ubuntu / Debian)

Run this:

curl -fsSL https://dl.min.io/server/minio/release/linux-amd64/minio -o minio
chmod +x minio
sudo mv minio /usr/local/bin/minio

Now test:

minio --version

If that works, start MinIO:

mkdir -p ~/minio-data
minio server ~/minio-data --console-address ":9001"

You’ll see something like:

API: http://127.0.0.1:9000
Console: http://127.0.0.1:9001

Default credentials:

minioadmin
minioadmin
If you're on macOS
brew install minio

Then:

minio server ~/minio-data --console-address ":9001"
If you're on Windows (no WSL)

Download directly:
https://min.io/download#/windows

Then run in PowerShell:

.\minio.exe server .\minio-data --console-address ":9001" -->