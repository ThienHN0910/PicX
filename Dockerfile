# Build React app
FROM node:22 AS client-build
WORKDIR /app
COPY PicXAPI/ClientApp ./ClientApp
WORKDIR /app/ClientApp
RUN npm install
RUN npm run build

# Build .NET app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY PicXAPI/*.sln .
COPY PicXAPI/PicXAPI.csproj ./PicXAPI/
COPY PicXAPI/. ./PicXAPI/
WORKDIR /src/PicXAPI
RUN dotnet restore
COPY --from=client-build /app/ClientApp/dist ./ClientApp/dist
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PicXAPI.dll"]
