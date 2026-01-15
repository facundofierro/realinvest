# Real Invest Wallet - Application Specification

## **General Overview**

The Real Invest Wallet is a mobile-first web application designed for real estate tokenization. It serves as the primary interface for investors to manage their digital property portfolio. The app bridges the gap between traditional real estate and decentralized finance, allowing users to:
- Invest in fractionalized real estate projects.
- Manage a portfolio of property-backed tokens.
- Trade tokens in a secondary market (Exchange).
- Fund and withdraw capital via stablecoins (USDT).
- Track performance with real-time market data.

---

## **Pages and Functionality**

### **1. Authentication (Login)**
- **Purpose**: Secure entry point for users.
- **Functionality**:
    - User identification via email/password.
    - Potential for social logins or wallet connections (Web3).
- **Logic**: Handles session management and redirects users to the Dashboard upon successful authentication.

### **2. Dashboard (Home)**
- **Purpose**: A high-level overview of the user's financial status and platform highlights.
- **Functionality**:
    - **Total Balance**: Displays the sum of available cash and invested assets.
    - **Quick Actions**: Buttons for "Deposit" and "Withdraw".
    - **Featured Projects**: A carousel (Stories/Similar Projects) highlighting new or trending investment opportunities.
    - **Recent Activity**: Quick view of latest transactions or portfolio changes.
- **Logic**: Aggregates data from wallet balances and current market prices of held tokens.

### **3. Invest (Marketplace)**
- **Purpose**: Discovery and filtering of available real estate projects.
- **Functionality**:
    - **Category Filtering**: Filter projects by status (Pre-sale, In Construction, Completed).
    - **Search**: Find projects by name or location.
    - **Project Cards**: Display key metrics like ROI, progress percentage, and price range.
- **Logic**: Fetches a list of projects and allows client-side filtering based on user selection.

### **4. Project Details**
- **Purpose**: Provide in-depth information about a specific real estate development.
- **Functionality**:
    - **Image Gallery**: Visuals of the project.
    - **Project Stats**: Detailed ROI, construction progress, and launch dates.
    - **Unit Selection**: Browse specific apartments or units within the project.
    - **Investment Flow**: Call-to-action to buy tokens for a specific unit.
- **Logic**: Dynamic routing based on `projectId`. Displays unit-specific data and connects to the investment/buy logic.

### **5. Assets (Portfolio)**
- **Purpose**: Detailed tracking of the user's investments.
- **Functionality**:
    - **Portfolio Value**: Visual representation of asset distribution.
    - **Holdings List**: Detailed list of owned tokens, including:
        - Token name and associated project.
        - Quantity owned.
        - Current market value vs. cost basis.
        - Percentage change in value.
- **Logic**: Maps user holdings to current market prices to calculate real-time portfolio performance.

### **6. Exchange (Secondary Market)**
- **Purpose**: Trading of property tokens between users.
- **Functionality**:
    - **Market Overview**: List of all tradable tokens with 24h/7d price changes.
    - **Token Search**: Find specific tokens for trading.
    - **Order Book/Trading**: Interfaces to place Buy or Sell orders.
    - **Open Positions**: View and manage active (unfilled) orders.
- **Logic**: Handles the matching of buy/sell orders and updates the user's wallet balances and holdings upon execution.

### **7. Deposit & Withdraw**
- **Purpose**: On-ramping and off-ramping of capital.
- **Functionality**:
    - **Deposit**: Displays a QR code and a USDT (TRC20) address for funding the wallet.
    - **Withdraw**: Form to specify amount and destination address.
- **Logic**: 
    - Deposits are passive (waiting for blockchain confirmation).
    - Withdrawals require validation of available balance and network rules.

---

## **Data Types**

The application uses a structured set of TypeScript interfaces to ensure data consistency across the platform.

### **Core Wallet Types**
- **`WalletBalance`**: Represents available and locked funds in a specific currency (e.g., USDT).
- **`MoneyAmount`**: A simple structure for currency and numerical value.

### **Real Estate Entities**
- **`Project`**: The top-level development entity.
    - `status`: Enum (PRE_SALE, IN_CONSTRUCTION, COMPLETED).
    - `roiPct`: Projected annual return.
    - `progressPct`: Construction completion percentage.
- **`ProjectUnit`**: A specific unit (e.g., Apartment 12A) within a project.
    - `tokenSymbol`: The unique identifier for the unit's tokens.

### **Market & Trading**
- **`MarketToken`**: Data for the secondary market.
    - Includes pricing (`priceUsd`), changes (`change24hPct`), and market capitalization.
- **`Holding`**: Represents a user's ownership of a specific token.
    - Tracks quantity (`tokens`) and calculates performance relative to `marketPriceUsd`.
- **`Position`**: Represents an active order in the exchange.
    - `side`: BUY or SELL.
    - `status`: OPEN, PARTIALLY_FILLED, FILLED, CANCELLED.

### **Transactions**
- **`Transaction`**: A record of any financial movement.
    - `type`: DEPOSIT, WITHDRAWAL, BUY, SELL, DIVIDEND.
    - `status`: PENDING, COMPLETED, FAILED.
