# SAR Project Manager

[cloudflarebutton]

SAR Project Manager is a sophisticated, desktop-style web application designed for streamlined project and task management. It features a clean, intuitive interface with a persistent sidebar for navigation and a global search header for quick access to information. The application provides multiple views for data, including a high-level Dashboard with key metrics and charts, detailed Project and Task management pages with toggleable Table and Kanban views, and an advanced Project Plan view with an interactive Gantt chart. Built with React, TypeScript, and Tailwind CSS, it leverages Zustand for efficient state management and provides a visually stunning, highly performant user experience for tracking project progress from inception to completion.

## ✨ Key Features

-   **Comprehensive Dashboard:** Get a high-level overview of all projects with key statistics, status charts, recent activity, and upcoming deadlines.
-   **Flexible Project & Task Views:** Seamlessly switch between a detailed Table view and an interactive drag-and-drop Kanban board.
-   **Interactive Gantt Chart:** Visualize project timelines, dependencies, and progress with an advanced Project Plan view.
-   **Modern UI/UX:** A clean, light-themed, and responsive interface built with shadcn/ui and Tailwind CSS for a professional look and feel.
-   **Robust & Performant:** Built with a modern tech stack for a fast, reliable, and scalable user experience.
-   **Simulated Backend:** Utilizes Hono on Cloudflare Workers to serve mock API data, allowing for a fully interactive frontend experience.

## 🛠️ Technology Stack

-   **Frontend:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
-   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/), [TanStack Query](https://tanstack.com/query/latest)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **Backend (API Simulation):** [Hono](https://hono.dev/) on [Cloudflare Workers](https://workers.cloudflare.com/)
-   **Data Visualization:** [Recharts](https://recharts.org/)
-   **Animation:** [Framer Motion](https://www.framer.com/motion/)
-   **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/) package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/sar_project_manager.git
    cd sar_project_manager
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

### Running the Application

To start the development server for the frontend and the Cloudflare Worker backend simultaneously, run:

```bash
bun dev
```

The application will be available at `http://localhost:3000` (or the port specified in your environment).

## ⚙️ Development

This project uses Vite for a fast development experience and Wrangler for managing the Cloudflare Worker.

### Available Scripts

-   `bun dev`: Starts the Vite development server and the Wrangler dev server.
-   `bun build`: Builds the React application for production.
-   `bun lint`: Lints the codebase using ESLint.
-   `bun deploy`: Builds and deploys the application to Cloudflare Workers.

### Project Structure

-   `src/`: Contains all the frontend React application code.
    -   `components/`: Reusable UI components, including shadcn/ui components.
    -   `pages/`: Top-level page components for each route.
    -   `lib/`: Utility functions and mock data.
    -   `hooks/`: Custom React hooks.
    -   `main.tsx`: The main entry point for the React application.
-   `worker/`: Contains the Cloudflare Worker code for the mock API.
    -   `index.ts`: The main entry point for the worker (do not modify).
    -   `userRoutes.ts`: Where custom API routes are defined.
-   `public/`: Static assets that are served directly.

## ☁️ Deployment

This application is designed to be deployed on the Cloudflare network.

### Deploy with one click

[cloudflarebutton]

### Manual Deployment via CLI

1.  **Login to Wrangler:**
    You will need to authenticate with your Cloudflare account.
    ```bash
    bunx wrangler login
    ```

2.  **Build and Deploy:**
    Run the deploy script to build the application and deploy it to your Cloudflare account.
    ```bash
    bun deploy
    ```

Wrangler will handle the process of building the frontend, bundling the worker, and publishing them to Cloudflare.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.