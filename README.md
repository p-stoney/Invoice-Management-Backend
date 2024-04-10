## Invoice Management Backend

### Overview

This repository constitutes the early back-end development for a centralized invoice management application designed for small business owners in the food and beverage industry. Many operators rely on a suite of compartmentalized subscription-based solutions, and this often results in an expensive, time-consuming, and frustrating experience. The goal of this application is to consolidate various solutions and streamline the handling of invoices, distributor accounts, and routine revenue reconciliation. A more developed version of this application would provide an integrated solution for business owners and their employees to manage their data all in one place rather than through a number of different walled-garden technologies. 

At present, this application provides a robust backend foundation for managing users, products, invoices, associated business and distributor entities, and their relationships. Consistent and efficient data management has been prioritized throughout the development process to ensure a seamless integration between the frontend and backend and to enable type-safe API routing and database operations. Custom middleware is leveraged to provide JWT authentication, procedure-specific RBAC authorization, global logging, and centralized error management. Additional early security measures include SSL/TLS connections between the application and database and HTTP header protection through CORS and helmet. Early testing through Vitest has resulted in substantial backend coverage.

### Technologies

**TypeScript:** Ensures type safety and improves code readability and maintainability allowing for easy modifications and extensions.

**tRPC:** Enables type-safe APIs to ensure seamless integration between the frontend and backend.

**PostgreSQL:** Relational database system facilitating complex queries and providing transactional integrity.

**Prisma:** Serves a single source of truth for database schema enabling type-safe database operations.

**Zod:** Employs schema validation for robust data integrity checks across the application.
