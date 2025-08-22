This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

Build the production code with:

```bash
npm run build
```

Then run ```npm run start```.

## Deployment

To deploy this app using Docker, use the following commands. Run the commands on project root:

1. **Build the Docker image:**
   ```bash
   docker build -f containers/frontend/Dockerfile --tag frontend-cloud-native-pizza-ovens .
   ```

2. **Run the Docker container:**
   ```bash
   docker run -p 3000:3000 -d frontend-cloud-native-pizza-ovens
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).