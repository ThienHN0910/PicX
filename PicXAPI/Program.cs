using DotNetEnv;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PicXAPI.Models;
using System.Text;
using PicXAPI.Controllers;
using PicXAPI.Services;
using PicXAPI.Helper;
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

            // Thêm dịch vụ
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddSignalR();

            builder.Services.AddHttpClient();
            builder.Services.AddScoped<CrawlExhibitionService>();

            builder.Services.AddDbContext<AppDbContext>(option =>
                option.UseSqlServer(builder.Configuration.GetConnectionString("PicX")));

            builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
            builder.Services.AddScoped<IEmailService, EmailService>();

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
            {
                options.Cookie.SameSite = SameSiteMode.None;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.HttpOnly = true;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false; // true nếu chạy production
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
                        if (context.Request.Cookies.ContainsKey("authToken"))
                        {
                            context.Token = context.Request.Cookies["authToken"];
                        }
                        else if (string.IsNullOrEmpty(context.Token))
                        {
                            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                            {
                                context.Token = authHeader.Substring(7);
                            }
                        }
                        if (string.IsNullOrEmpty(context.Token))
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
            })
            .AddGoogle(options =>
            {
                options.ClientId = builder.Configuration["Google:ClientId"];
                options.ClientSecret = builder.Configuration["Google:ClientSecret"];
                options.CallbackPath = "/api/auth/google/callback";
                options.SaveTokens = true;
                options.Scope.Add("https://www.googleapis.com/auth/userinfo.email");
                options.Scope.Add("https://www.googleapis.com/auth/userinfo.profile");
                options.CorrelationCookie.SameSite = SameSiteMode.None;
                options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;
                options.CorrelationCookie.Domain = "localhost";
                options.CorrelationCookie.HttpOnly = true;
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReact", policy =>
                    policy
                        .WithOrigins("https://localhost:5173", "https://localhost:5174")
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
            Console.WriteLine($"GOOGLE_APPLICATION_CREDENTIALS: {Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")}");

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowReact");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();
            app.MapHub<PrivateChatHub>("/chatHub");

            app.Run();
        }
    }
}