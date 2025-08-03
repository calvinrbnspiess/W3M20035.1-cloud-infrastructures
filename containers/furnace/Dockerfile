# Get dotnet sdk
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project files, restore dependencies and build
COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/out .

# Expose HTTP port (standard 80)
EXPOSE 80

# Start the app
ENTRYPOINT ["dotnet", "furnace.dll"]