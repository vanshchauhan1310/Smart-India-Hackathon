# Smart India Hackathon

## Development
 - Install dependencies: `npm install` or `yarn`

### OpenRouter API key
This project integrates with OpenRouter for AI responses. To avoid hard-coding API keys, set your OpenRouter API key using one of the methods below before running the app.

- Expo app config (recommended for local testing with Expo): add the key to `app.json`:

   {
      "expo": {
         "extra": {
            "OPENROUTER_API_KEY": "sk-or-..."
         }
      }
   }

- Environment variable (recommended for production/native builds or CI): set `OPENROUTER_API_KEY` in your environment.

The app will read `process.env.OPENROUTER_API_KEY` first, then `expo.extra.OPENROUTER_API_KEY`.

## Local Pose Server (MediaPipe + OpenCV + Google TTS + OpenRouter)

For higher accuracy and to offload heavy processing, this repo includes a small FastAPI server under `infra/pose_server`.

### Typography
- **Font Sizes**: 12px to 32px with consistent scaling

### Spacing
- **Scale**: 4px, 8px, 16px, 24px, 32px, 48px

- **Buttons**: Primary, Secondary, Outline, Ghost variants
- **Inputs**: Text, Email, Password, Multiline with validation
- **Modals**: Slide-up and overlay modals
- **Navigation**: Tab and drawer navigation
## 🔐 Authentication & Security

- **Role-based Access**: User, Admin, and Scouter roles
- **Data Encryption**: Secure data transmission and storage

## 🌐 Multilingual Support
### Supported Languages
- English (en)
- Bengali (bn)
- Telugu (te)
- Tamil (ta)
- Gujarati (gu)
- Malayalam (ml)
- Punjabi (pa)
### Implementation
- Native language UI with proper RTL support
- IndicNLP Library for script and language processing


### AI Capabilities
# Smart India Hackathon — Mobile app + Pose server

This repository contains a React Native (Expo) mobile app and a small MediaPipe-based pose server used to extract pose keypoints, run cheat checks and synthesize TTS feedback.

This README gives the exact steps to get the whole system running locally, and how to build Android and iOS binaries.

## Quick checklist

- [x] Install Node.js, npm/yarn and Expo CLI
- [x] Install mobile dependencies (`npm install`)
- [x] (Optional) Start the local pose server or run it in Docker
- [x] Start the Expo dev server and open the app on simulator/device
- [x] Build production app binaries with EAS (recommended)

## Prerequisites (macOS)

- Node.js 16+ (LTS recommended)
- npm or yarn
- Expo CLI (optional for local dev): `npm install -g expo-cli`
- For native builds and simulators:
   - Xcode (for iOS)
   - Android Studio + Android SDK (for Android)
- Docker (optional) — to run the pose server in a container

## Configure environment

The app and server use a few environment variables. Set them in your shell or via `app.json`/Expo `extra` for the mobile app.

- `OPENROUTER_API_KEY` — OpenRouter API key (used by server or client where configured)
- `POSE_SERVER_URL` — URL of the pose server (example: `http://10.0.2.2:8080` for Android emulator, `http://localhost:8080` for iOS simulator, or `http://<machine-ip>:8080` for a physical device)
- (Server) `GOOGLE_APPLICATION_CREDENTIALS` — path to Google service-account JSON for TTS (if you use server TTS)

Example: add to `app.json` (for Expo managed flow)

```json
{
   "expo": {
      "extra": {
         "OPENROUTER_API_KEY": "sk-or-...",
         "POSE_SERVER_URL": "http://10.0.2.2:8080"
      }
   }
}
```

Do not commit secrets to git. Use CI secrets or local environment variables for production builds.

## Install mobile dependencies

From repository root:

```bash
npm install
# or
yarn install
```

## Run the mobile app (development)

- Start the Expo dev server:

```bash
npm start
# or
expo start
```

- Open on device / emulator:

```bash
# Android emulator or attached device
expo start --android

# iOS simulator (macOS only)
expo start --ios
```

Notes for physical devices: make sure `POSE_SERVER_URL` points to a host reachable from the device (use your machine IP, not `localhost`).

## Pose server (local)

The pose server is located at `infra/pose_server`. You can run it directly (python) or inside Docker.

Python (local):

```bash
# create & activate venv
python3 -m venv .venv
# activate venv
python3 -m source .venv/bin/activate

# install dependencies
python3 -m pip install -r infra/pose_server/requirements.txt

# set required env vars
export OPENROUTER_API_KEY="sk-or-..."
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/google-creds.json" # if using TTS

# run server (defaults to port 8080)
python3 -m infra/pose_server/server.py
```

Docker (recommended if you don't want to install Python deps locally):

```bash
# build image
docker build -t pose_server infra/pose_server

# run container, map port 8080 and pass env vars (example)
docker run -p 8080:8080 \
   -e OPENROUTER_API_KEY="sk-or-..." \
   -e GOOGLE_APPLICATION_CREDENTIALS="/creds/google-creds.json" \
   -v /local/path/to/google-creds.json:/creds/google-creds.json:ro \
   pose_server
```

Server endpoints (summary):

- POST /predict — multipart file -> returns pose keypoints
- POST /cheat-check — multipart file -> returns cheat analysis
- POST /synthesize-tts — text -> returns audio (MP3)
- POST /feedback — forwards summary to OpenRouter and returns LLM response

## Build a production APK / AAB and iOS IPA

Recommendation: use Expo Application Services (EAS) for building production binaries. `expo build` is deprecated for many newer SDKs.

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Log in and configure (follow prompts):

```bash
eas login
eas build:configure
```

3. Build for Android (AAB or APK):

```bash
# Android (recommended produce .aab)
eas build -p android --profile production

# to create an APK for quick install (use a debug or development profile)
eas build -p android --profile preview
```

4. Build for iOS (macOS + Apple credentials required):

```bash
eas build -p ios --profile production
```

Notes:
- iOS builds require an Apple Developer account and credentials. EAS can help manage certificates and provisioning profiles interactively.
- The resulting artifacts (AAB / APK / IPA) will be available from the EAS build page or CLI output.

Alternate: local debug APK (requires Android SDK & Android Studio):

```bash
# run the native dev client (debug)
expo prebuild # (only if you need native code changes)
expo run:android
```

## Troubleshooting

- 401 / OpenRouter errors: ensure `OPENROUTER_API_KEY` is set in the environment or in `app.json` `extra`.
- Pose server 500 / import errors: install Python deps or use Docker. Check `infra/pose_server/requirements.txt`.
- Device can't reach server: use machine LAN IP for `POSE_SERVER_URL` or run an ngrok tunnel for quick testing.

## Where to look in the code

- Mobile app entry: `App.tsx`
- Camera & pose UI: `src/screens/user/CameraTestScreen.tsx`
- Pose client: `src/services/poseApiService.ts`
- OpenRouter client: `src/services/openRouterService.ts`
- Local pose server: `infra/pose_server/server.py`

## License

MIT

---

If you want, I can add a `npm run dev` script that starts the pose server (Docker) and the Expo server concurrently — tell me if you want that and whether you'd like Docker or a local Python venv preference.3