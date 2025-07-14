CREATE TABLE [dbo].[Wallets] (
    [wallet_id] INT IDENTITY(1,1) PRIMARY KEY,
    [user_id] INT NOT NULL UNIQUE,
    [balance] DECIMAL(18, 2) NOT NULL DEFAULT 0,
    FOREIGN KEY ([user_id]) REFERENCES [Users]([user_id]) ON DELETE CASCADE
);
go
CREATE TABLE [dbo].[WalletTransactions] (
    [transaction_id] INT IDENTITY(1,1) PRIMARY KEY,
    [wallet_id] INT NOT NULL,
    [type] NVARCHAR(50) NOT NULL, -- 'deposit', 'purchase', 'sale', 'withdraw_request', 'withdraw_success'
    [amount] DECIMAL(18,2) NOT NULL,
    [description] NVARCHAR(500) NULL,
    [created_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([wallet_id]) REFERENCES [Wallets]([wallet_id]) ON DELETE CASCADE
);
go
If OBJECT_ID('sp_ProcessOrderWithWallet','P') IS NOT NULL
DROP PROC sp_ProcessOrderWithWallet
go
CREATE PROCEDURE sp_ProcessOrderWithWallet
    @OrderId INT,
    @BuyerId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @TotalAmount DECIMAL(18,2);

        -- Tính tổng tiền đơn
        SELECT @TotalAmount = total_amount FROM Orders WHERE order_id = @OrderId AND buyer_id = @BuyerId;

        IF @TotalAmount IS NULL
        BEGIN
            THROW 50001, 'Đơn hàng không tồn tại hoặc không thuộc về buyer.', 1;
        END

        -- Kiểm tra số dư ví buyer
        DECLARE @BuyerWalletId INT, @BuyerBalance DECIMAL(18,2);
        SELECT @BuyerWalletId = wallet_id, @BuyerBalance = balance FROM Wallets WHERE user_id = @BuyerId;

        IF @BuyerBalance < @TotalAmount
        BEGIN
            THROW 50002, 'Ví buyer không đủ tiền.', 1;
        END

        -- Trừ tiền buyer
        UPDATE Wallets
        SET balance = balance - @TotalAmount
        WHERE wallet_id = @BuyerWalletId;

        INSERT INTO WalletTransactions(wallet_id, type, amount, description)
        VALUES (@BuyerWalletId, 'purchase', -@TotalAmount, CONCAT('Thanh toán đơn hàng #', @OrderId));

        -- Ghi log và cộng tiền cho từng artist
        DECLARE @ProductId INT, @ProductPrice DECIMAL(18,2), @ArtistId INT, @ArtistWalletId INT, @Commission DECIMAL(18,2), @NetAmount DECIMAL(18,2);

        DECLARE cur CURSOR FOR
        SELECT od.product_id, od.total_price, p.artist_id
        FROM OrderDetails od
        JOIN Products p ON od.product_id = p.product_id
        WHERE od.order_id = @OrderId;

        OPEN cur;
        FETCH NEXT FROM cur INTO @ProductId, @ProductPrice, @ArtistId;

        WHILE @@FETCH_STATUS = 0
BEGIN
    SET @Commission = @ProductPrice * 0.1;
    SET @NetAmount = @ProductPrice - @Commission;

    -- Lấy ví của artist, nếu chưa có thì tạo
    SELECT @ArtistWalletId = wallet_id FROM Wallets WHERE user_id = @ArtistId;
    IF @ArtistWalletId IS NULL
    BEGIN
        INSERT INTO Wallets(user_id, balance) VALUES (@ArtistId, 0);
        SET @ArtistWalletId = SCOPE_IDENTITY();
    END

    -- Cộng tiền cho artist
    UPDATE Wallets
    SET balance = balance + @NetAmount
    WHERE wallet_id = @ArtistWalletId;

    -- Log giao dịch
    INSERT INTO WalletTransactions(wallet_id, type, amount, description)
    VALUES (@ArtistWalletId, 'sale', @NetAmount, CONCAT('Bán sản phẩm #', @ProductId, ' từ đơn hàng #', @OrderId));

    FETCH NEXT FROM cur INTO @ProductId, @ProductPrice, @ArtistId;
END
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @Commission = @ProductPrice * 0.1;
    SET @NetAmount = @ProductPrice - @Commission;

    -- Lấy ví của artist, nếu chưa có thì tạo
    SELECT @ArtistWalletId = wallet_id FROM Wallets WHERE user_id = @ArtistId;
    IF @ArtistWalletId IS NULL
    BEGIN
        INSERT INTO Wallets(user_id, balance) VALUES (@ArtistId, 0);
        SET @ArtistWalletId = SCOPE_IDENTITY();
    END

    -- Cộng tiền cho artist
    UPDATE Wallets
    SET balance = balance + @NetAmount
    WHERE wallet_id = @ArtistWalletId;

    -- Log giao dịch
    INSERT INTO WalletTransactions(wallet_id, type, amount, description)
    VALUES (@ArtistWalletId, 'sale', @NetAmount, CONCAT('Bán sản phẩm #', @ProductId, ' từ đơn hàng #', @OrderId));

    FETCH NEXT FROM cur INTO @ProductId, @ProductPrice, @ArtistId;
END


        CLOSE cur;
        DEALLOCATE cur;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50003, @ErrMsg, 1;
    END CATCH
END
go

DROP TABLE IF EXISTS WithdrawRequests;
GO

CREATE TABLE [dbo].[WithdrawRequests] (
    [request_id] INT IDENTITY(1,1) PRIMARY KEY,
    [user_id] INT NOT NULL,
    [amount_requested] DECIMAL(18, 2) NOT NULL,
    [amount_received] AS ([amount_requested] * 0.9) PERSISTED,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    [admin_note] NVARCHAR(500),
    [requested_at] DATETIME DEFAULT GETDATE(),
    [processed_at] DATETIME NULL,
    FOREIGN KEY ([user_id]) REFERENCES [Users]([user_id]) ON DELETE CASCADE
);
GO

IF OBJECT_ID('sp_RequestWithdraw', 'P') IS NOT NULL
    DROP PROCEDURE sp_RequestWithdraw;
GO

CREATE PROCEDURE sp_RequestWithdraw
    @UserId INT,
    @Amount DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @WalletId INT, @Balance DECIMAL(18,2);

        SELECT @WalletId = wallet_id, @Balance = balance
        FROM Wallets
        WHERE user_id = @UserId;

        IF @WalletId IS NULL
        BEGIN
            THROW 60003, 'Người dùng chưa có ví.', 1;
        END

        IF @Balance < @Amount
        BEGIN
            THROW 60001, 'Số dư không đủ để rút.', 1;
        END

        -- Trừ tiền ví
        UPDATE Wallets
        SET balance = balance - @Amount
        WHERE wallet_id = @WalletId;

        -- Ghi log giao dịch
        INSERT INTO WalletTransactions(wallet_id, type, amount, description)
        VALUES (@WalletId, 'withdraw_request', -@Amount, 'Yêu cầu rút tiền');

        -- Tạo yêu cầu rút tiền
        INSERT INTO WithdrawRequests(user_id, amount_requested)
        VALUES (@UserId, @Amount);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 60002, @Err, 1;
    END CATCH
END
GO


ALTER TABLE WalletTransactions add external_transaction_id BIGINT NULL;

ALTER TABLE Users add bank_account_number NVARCHAR(100) NULL, bank_name NVARCHAR(100) NULL, momo_number NVARCHAR(100) NULL;