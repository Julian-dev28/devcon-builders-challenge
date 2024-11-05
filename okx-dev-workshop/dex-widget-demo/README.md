# OKX DEX Widget React Application

**Check out the live deployment of this repository:**
[Dex Widget Demo](https://dex-widget-demo-Juliandev28.replit.app)

This project is a React application that integrates the OKX DEX Widget, providing a seamless and user-friendly interface for swapping and bridging tokens.

## Features

- Integration of the OKX DEX Widget
- Responsive and stylish UI
- Boilerplate application

## Technologies Used

- React
- TypeScript
- OKX DEX Widget (@okxweb3/dex-widget)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v20 or later)
- npm (usually comes with Node.js)

## Set Up

## Using Replit

1. Fork the Repository
   - Click "Use Template" to fork this repl.

2. Install the dependencies
   - In Replit, open the shell terminal and run the following command:
   ```
   npm install
   ```
   
3. Run the project:
   - Use the `Run` button provided by Replit to start the application.
   - Once the server starts, it will provide a webview window with the application running live.

## Using GitHub
1. Clone the repository:
   ```
   git clone https://github.com/Julian-dev28/dex-widget-demo.git
   ```

2. Navigate to the project directory:
   ```
   cd okx-dex-widget-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the project:
   ```
   npm run dev
   ```

This will start the development server. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## Project Structure

- `src/App.tsx`: The main application component
- `src/Navigation.tsx`: The navigation component
- `src/LandingPage.tsx`: The home page component
- `src/WidgetPage.tsx`: The page containing the OKX DEX Widget
- `src/index.css`: Global styles and theme variables

## Customization

You can customize the application by modifying the following:

- Color scheme: Edit the CSS variables in `src/index.css`
- Navigation items: Update the `navItems` array in `src/Navigation.tsx`
- Widget parameters: Modify the `params` object in `src/WidgetPage.tsx`

## Contributing

Contributions to this project are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- OKX for providing the DEX Widget
- The React and TypeScript communities for their excellent documentation and support

## Contact

If you have any questions or feedback, please open an issue in this repository.
You can also contact us via the [OKX OS Discord Channel](https://discord.com/channels/1260193012223578164/1267467417848643585).