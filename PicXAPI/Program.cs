using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PicXAPI.Controllers;
using PicXAPI.Models;
using PicXAPI.Services;
using System.Security.Claims;
using System.Text;
using IronPdf;

namespace PicXAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            DotNetEnv.Env.Load();

            var jwtSettings = builder.Configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

            IronPdf.License.LicenseKey = builder.Configuration["IronPdf:LicenseKey"];


            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddSignalR();

            builder.Services.AddHttpClient();
            builder.Services.AddScoped<CrawlExhibitionService>();
            builder.Services.AddScoped<IWatermarkService, WatermarkService>();
            builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.AddScoped<CertificateService>();
            builder.Services.AddSingleton<S3Service>();
            builder.Services.AddDbContext<AppDbContext>(option =>
                option.UseSqlServer(builder.Configuration.GetConnectionString("PicX")));

            builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
            builder.Services.AddScoped<IEmailService, EmailService>();

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false; // true nếu production
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSettings["Issuer"],
                        ValidAudience = jwtSettings["Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(key)
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            // Lấy token từ header Authorization
                            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                            {
                                context.Token = authHeader.Substring(7);
                            }
                            // Hỗ trợ lấy token từ query string cho SignalR nếu cần
                            else if (string.IsNullOrEmpty(context.Token))
                            {
                                var accessToken = context.Request.Query["access_token"];
                                if (!string.IsNullOrEmpty(accessToken))
                                {
                                    context.Token = accessToken;
                                }
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReact", policy =>
                    policy
                        .WithOrigins(
                            "https://picx-client.onrender.com", // Chỉ cho phép domain production
                            "https://picxapi.onrender.com" // Chỉ cho phép domain production
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
            });

            builder.Services.AddControllers().AddNewtonsoftJson();

            builder.Services.Configure<FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 104857600; // 100MB
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowReact");
            app.UseAuthentication();
            app.UseAuthorization();

            // Serve static files FE build
            app.UseDefaultFiles();
            // app.UseStaticFiles(new StaticFileOptions
            // {
            //     FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
            //         Path.Combine(Directory.GetCurrentDirectory(), "ClientApp", "dist")
            //     ),
            //     RequestPath = ""
            // });

            app.MapControllers();
            app.MapHub<PrivateChatHub>("/chatHub");
            app.MapHub<NotificationHub>("/notificationHub");

            // Listen trên 0.0.0.0:7162
            app.Run("http://0.0.0.0:7162");
        }
    }
}