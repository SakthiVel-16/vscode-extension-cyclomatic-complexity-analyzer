# Cyclomatic Complexity Analyzer for VS Code

## 🚀 Overview

The **Cyclomatic Complexity Analyzer** is a Visual Studio Code extension that helps developers understand and improve the quality of their code by calculating its Cyclomatic Complexity. This metric quantifies the number of linearly independent paths through a program's source code, serving as a comprehensive metric for the structural complexity of a program.

**Why is Cyclomatic Complexity important?**

- **Identify complex code:** Pinpoint functions or methods that are hard to understand and maintain.
- **Reduce bugs:** Highly complex code often leads to more defects.
- **Improve testability:** Complex code is harder to test thoroughly.
- **Refactoring guidance:** Guides you on where to focus your refactoring efforts.

Our extension seamlessly integrates into your VS Code workflow, providing instant feedback for your Java, JavaScript, and Python code.

## ✨ Features

- **Real-time Analysis:** Get complexity metrics as you code.
- **Multi-Language Support:** Analyzes Java, JavaScript, and Python files.
- **Dedicated Webview Panel:** View detailed complexity breakdown for each method/function in a clean, interactive panel.
- **Cloud-Powered:** Leverages a robust Spring Boot backend for accurate and efficient analysis, ensuring your editor remains performant.

## 💡 How It Works

The **Cyclomatic Complexity Analyzer** operates on a client-server architecture:

1.  **Client-Side (VS Code Extension):** When you open or save a supported file (Java, JavaScript, Python), your VS Code extension securely sends the content of that file to our dedicated backend service.
2.  **Server-Side (Spring Boot Backend on Render.com):** Our highly optimized backend, hosted on Render.com, receives your code, performs the complex cyclomatic complexity calculations, and sends the results back to your VS Code extension.
3.  **Display Results:** The extension then beautifully presents these results in a dedicated "Cyclomatic Complexity" panel within your VS Code sidebar, offering insights into your code's structure.

This architecture ensures that the intensive computation doesn't slow down your local VS Code environment, providing a smooth development experience.

## 🚀 Getting Started

Follow these simple steps to install and start using the Cyclomatic Complexity Analyzer:

### 1. Installation

1.  Open Visual Studio Code.
2.  Go to the Extensions view by clicking on the Square icon on the Sidebar or pressing `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS).
3.  Search for "Cyclomatic Complexity Analyzer".
4.  Click the "Install" button.

### 2. Usage

Once installed, the extension works largely automatically!

1.  **Open a Supported File:** Open any `.java`, `.js`, or `.py` file in your VS Code editor.
2.  **View Results:** A new panel titled "Cyclomatic Complexity" will appear in your VS Code sidebar (you might need to enable it if it's hidden under the ellipsis `...` menu in the sidebar). This panel will automatically update with the complexity metrics for the active file.
3.  **Explore Details:** The panel will list each function or method found in your file along with its calculated cyclomatic complexity score.

    - **Screenshot:** [Add a clear screenshot showing the extension's panel displaying complexity results for a sample code file.]
    - _Example: A Java/JS/Python file open with the sidebar panel showing function names and their complexity scores._

### Important Notes:

- **Internet Connection Required:** This extension requires an active internet connection to communicate with the analysis backend.
- **Cold Start:** As the backend is hosted on a free tier, there might be a slight delay (a few seconds) for the very first analysis request after a period of inactivity (known as "cold start"). Subsequent analyses will be much faster.

## 📸 Screenshots

---

**Screenshot 1: The Cyclomatic Complexity Panel in Action**
![Cyclomatic Complexity Panel](https://raw.githubusercontent.com/SakthiVel-16/vscode-extension-cyclomatic-complexity-analyzer/main/images/image.png)

_Description: A view of the extension's dedicated sidebar panel, showing complexity scores for functions within a sample code file._

**Screenshot 2: How to Access the Panel**

![Cyclomatic Complexity Panel](https://raw.githubusercontent.com/SakthiVel-16/vscode-extension-cyclomatic-complexity-analyzer/main/images/image-1.png)

_Description: Illustrates how to find and open the "Cyclomatic Complexity" panel if it's not immediately visible._

---

## 🤝 Contributing

We welcome contributions! If you have suggestions, bug reports, or want to contribute code, please visit our GitHub repository:

- **Extension Repository:** [https://github.com/SakthiVel-16/vscode-extension-cyclomatic-complexity-analyzer](https://github.com/SakthiVel-16/vscode-extension-cyclomatic-complexity-analyzer)

- **Backend Repository:** [https://github.com/SakthiVel-16/cyclomatic-complexity-analyzer](https://github.com/SakthiVel-16/cyclomatic-complexity-analyzer)

## 📄 License

This extension is released under the [MIT License](https://github.com/SakthiVel-16/vscode-extension-cyclomatic-complexity-analyzer/blob/main/LICENSE).

---
