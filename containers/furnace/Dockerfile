# Get dotnet sdk
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project files, restore dependencies and build
COPY containers/furnace/*.csproj ./
RUN dotnet restore

COPY containers/furnace/. ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/out .

# Expose HTTP port 8080
EXPOSE 8080

# Start the app
ENTRYPOINT ["dotnet", "furnace.dll"]