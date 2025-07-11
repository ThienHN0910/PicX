﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PicXAPI
{
    [Authorize]
    public class PrivateChatHub : Hub
    {
        private readonly AppDbContext _context;

        public PrivateChatHub(AppDbContext context)
        {
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
            {
                throw new HubException("Access denied");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, userId.Value.ToString());

            var users = await _context.Users
                .Where(u => u.UserId != userId.Value && u.IsActive == true)
                .Select(u => new { u.UserId, Name = u.Name ?? $"User #{u.UserId}" })
                .ToListAsync();
            await Clients.Caller.SendAsync("ReceiveUserList", users);

            await base.OnConnectedAsync();
        }

        public async Task SendPrivateMessage(int receiverId, string message)
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
            {
                throw new HubException("Access denied");
            }

            if (string.IsNullOrWhiteSpace(message))
            {
                throw new HubException("Message cannot be empty");
            }

            var receiver = await _context.Users.FindAsync(receiverId);
            if (receiver == null || receiver.IsActive != true)
            {
                throw new HubException("Recipient does not exist or is inactive");
            }

            var chatMessage = new Chat
            {
                SenderId = userId.Value,
                ReceiverId = receiverId,
                Message = message,
                IsRead = false,
                SentAt = DateTime.UtcNow
            };
            _context.Chats.Add(chatMessage);
            await _context.SaveChangesAsync();

            var sender = await _context.Users
                .Where(u => u.UserId == userId.Value)
                .Select(u => new { u.UserId, u.Name })
                .FirstOrDefaultAsync();

            var messageData = new
            {
                ChatId = chatMessage.ChatId,
                SenderId = sender.UserId,
                SenderName = sender.Name,
                ReceiverId = receiverId,
                Message = message,
                IsRead = chatMessage.IsRead,
                SentAt = chatMessage.SentAt
            };
            await Clients.Group(userId.Value.ToString()).SendAsync("ReceiveMessage", messageData);
            await Clients.Group(receiverId.ToString()).SendAsync("ReceiveMessage", messageData);
        }

        public async Task MarkMessageAsRead(int chatId)
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
            {
                throw new HubException("Access denied");
            }

            var message = await _context.Chats
                .Where(c => c.ChatId == chatId && c.ReceiverId == userId.Value)
                .FirstOrDefaultAsync();
            if (message != null)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
                await Clients.Group(message.SenderId.ToString()).SendAsync("MessageRead", chatId);
            }
        }

        public async Task GetChatHistory(int otherUserId)
        {
            var userId = await GetAuthenticatedUserId();
            Console.WriteLine($"GetChatHistory: userId={userId}, otherUserId={otherUserId}");

            if (!userId.HasValue)
            {
                throw new HubException("Access denied");
            }

            var messages = await _context.Chats
                .Where(c => (c.SenderId == userId.Value && c.ReceiverId == otherUserId) ||
                            (c.SenderId == otherUserId && c.ReceiverId == userId.Value))
                .OrderBy(c => c.SentAt)
                .Select(c => new
                {
                    ChatId = c.ChatId,
                    SenderId = c.SenderId,
                    SenderName = c.Sender.Name,
                    ReceiverId = c.ReceiverId,
                    Message = c.Message,
                    IsRead = c.IsRead,
                    SentAt = c.SentAt
                })
                .ToListAsync();

            await Clients.Caller.SendAsync("ReceiveChatHistory", messages);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = await GetAuthenticatedUserId();
            if (userId.HasValue)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.Value.ToString());
            }
            await base.OnDisconnectedAsync(exception);
        }

        private async Task<int?> GetAuthenticatedUserId()
        {
            var httpContext = Context.GetHttpContext();
            string token = null;

            // Prefer getting token from Authorization header
            var authHeader = httpContext?.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                token = authHeader.Substring("Bearer ".Length);
            }
            // If not available in header, fallback to query string (used by SignalR JS client)
            else if (string.IsNullOrEmpty(token))
            {
                token = httpContext?.Request.Query["access_token"].FirstOrDefault();
            }

            if (string.IsNullOrEmpty(token))
                return null;

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return null;
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null || user.IsActive == false)
                    return null;

                return user.UserId;
            }
            catch
            {
                return null;
            }
        }

        public async Task GetCurrentUserId()
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
            {
                throw new HubException("Access denied");
            }

            await Clients.Caller.SendAsync("ReceiveCurrentUserId", userId.Value);
        }
    }
}
