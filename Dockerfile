# Build .NET app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY PicXAPI/*.sln .
COPY PicXAPI/PicXAPI.csproj ./PicXAPI/
COPY PicXAPI/. ./PicXAPI/
WORKDIR /src/PicXAPI
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PicXAPI.dll"]
