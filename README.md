# PicX - Art Marketplace Website

**PicX** is a modern online platform that connects artists and buyers, enabling seamless discovery, trading, and interaction with digital and physical artwork. It supports artwork uploads, favoriting, ordering, real-time chat, and AI-assisted image recommendations.

## Live URL

> Access PicX online (if hosted) or clone locally and run.

## Features

- **User Authentication**: Register/Login with Email, Google, or Facebook.
- **Artwork Management**: Upload, edit, delete, and categorize artworks.
- **Interaction**: Like, comment, reply, and favorite artworks.
- **Shopping Cart**: Add/remove artworks and place orders.
- **Real-time Chat**: SignalR-based communication between artists and buyers.
- **Google Drive Integration**: Store and manage artwork images.
- **Admin Dashboard**: Manage users and financial data.
- **Deployment Ready**: CI/CD with Docker, Render, Azure, etc.

## Technology Stack

| Layer    | Technology                      |
| -------- | ------------------------------- |
| Backend  | ASP.NET Core 8.0 (Web API)      |
| Frontend | React.js + Tailwind CSS         |
| Database | SQL Server + EF Core            |
| Storage  | Google Drive API (Image upload) |
| Realtime | SignalR                         |
| Auth     | JWT, Google/Facebook OAuth      |
| CI/CD    | GitHub Actions, Docker, Render  |

## Database Design

Visualized on [dbdiagram.io](https://dbdiagram.io/d/PicX-682f95e5b9f7446da3c29cc6)

### Main Tables

- `Users` (Buyers, Artists, Admins)
- `Products` (Artworks)
- `Categories`
- `Orders`, `OrderDetails`
- `Cart`
- `Comments`, `Likes`
- `Payments`
- `Messages`

## Dependencies

| Name                                          | Version     |
| --------------------------------------------- | ----------- |
| DotNetEnv                                     | 3.1.1       |
| Google.Apis.Drive.v3                          | 1.69.0.3783 |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.16      |
| Microsoft.AspNetCore.Mvc.NewtonsoftJson       | 8.0.16      |
| Microsoft.AspNetCore.SignalR                  | 1.2.0       |
| Microsoft.EntityFrameworkCore                 | 8.0.16      |
| Microsoft.EntityFrameworkCore.SqlServer       | 8.0.16      |
| Microsoft.EntityFrameworkCore.Tools           | 8.0.16      |
| Swashbuckle.AspNetCore                        | 6.6.2       |
| System.IdentityModel.Tokens.Jwt               | 8.11.0      |
| AngleSharp                                    | 1.3.0       |

## Setup Instructions

1.  **Clone the Repository**:
```bash
git clone https://github.com/Meoleodeo/PicX
cd PicX
```
2.  **Environment Variables**:
- Create a `.env` file in the `PicXAPI` directory.
```plaintext
GOOGLE_APPLICATION_CREDENTIALS="./credentials.json"   //public cuz we lazy to do :))
```
- Create a `appsettings.json` file in the `PicXAPI` directory.
- Add necessary configurations (e.g., Google Drive API credentials, SQL Server connection string, JWT secret).
```json
"ConnectionStrings": {
   "PicX": "<your-sql-server-connection-string>"
},
"Jwt": {
   "Key": "<your-jwt-secret>",
   "Issuer": "https://localhost:7162",
   "Audience": "https://localhost:5173",
   "ExpireHours": 1
},
"ApiKeys": {
   "HarvardArtMuseums": "<ur-api-key>"
}
```
- To get Harvard Art Museums api key: [click here](https://docs.google.com/forms/d/e/1FAIpQLSfkmEBqH76HLMMiCC-GPPnhcvHC9aJS86E32dOd0Z8MpY2rvQ/viewform)
3.  **Restore Dependencies**:
```bash
dotnet restore
```
4.  **Apply Migrations**:
```bash
dotnet ef database update
```
5.  **Run the Backend**:
```bash
dotnet run
```
6.  **Frontend Setup**:
- Navigate to the `clientApp` directory.
- Install dependencies:
```bash
npm install
```
- Start the React app:
```bash
npm run dev
```
7.  **Access the Application**:
- Backend API: `https://localhost:7162/swagger` (Swagger UI)
- Frontend: `https://localhost:5173`

## Deployment

- **Docker**:
- Build the Docker image:
```bash
docker build -t picx .
```
- Run the container:
```bash
docker run -p 8080:80 picx
```
- **CI/CD**: Configure GitHub Actions or use platforms like Render or Azure for automated deployments.

## Notes

- Ensure Google Drive API is configured with proper credentials for image storage.
- SignalR requires a stable connection for real-time chat functionality.
- For production, secure the JWT secret and database connection strings.
