# Web Weaver

Web Weaver is a browser-based computer vision experiment that will transform
live hand movement into dynamic spider-web geometry.

The app runs entirely in the browser using React, TypeScript, Vite, MediaPipe
Tasks Vision, and HTML Canvas. It uses the webcam to detect hands, draw hand
landmarks, recognise basic interactions, and render procedural web effects.

<table>
  <tr>
    <td>
      <img width="368" height="290" alt="Web Weaver camera view" src="https://github.com/user-attachments/assets/641404a5-3dff-495a-9d06-d9acced65875" />
    </td>
    <td>
      <img width="575" height="390" alt="Web Weaver web view" src="https://github.com/user-attachments/assets/28f6031e-6914-473a-94ed-7b8db97d8a9c" />
    </td>
  </tr>
</table>

## Features

- Live webcam input
- Camera device selection
- Real-time hand landmark detection
- Debug controls for landmarks, gestures, geometry, and tracking
- Procedural web shooting
- Procedural web weaving between both hands
- Fully client-side processing

## Download And Run

Clone the repository:

```bash
git clone https://github.com/Ashlyn-Li/Web-Weaver.git
```

Open the project folder:

```bash
cd Web-Weaver
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

Allow camera access in the browser when prompted.

## Checks

Run linting:

```bash
npm run lint
```

Build the production bundle:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Notes

Webcam access requires a secure browser context. `localhost` works during local
development. For deployment, use HTTPS.
