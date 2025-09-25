This is a **TypeScript WebSocket backend** project.  
It is implemented without Express or HTTP frameworks and runs as a plain WebSocket server.  
The project uses [`tsx`](https://github.com/esbuild-kit/tsx) for TypeScript execution and compilation.

## Getting Started

```bash
npm run start
```

## Deployment

To deploy this app using Docker, use the following commands. Run the commands on project root:

1. **Build the Docker image:**
   ```bash
   docker build -f containers/backend/Dockerfile --tag backend-cloud-native-pizza-ovens .
   ```

2. **Run the Docker container:**
   ```bash
   docker run -p 1234:1234 -d backend-cloud-native-pizza-ovens
   ```