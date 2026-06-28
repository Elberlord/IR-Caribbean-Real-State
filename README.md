# I&R Caribbean Real Estate - Public Site

This folder is the one you should upload to your public GitHub repository.

## Put these files in the root of the repo

- `index.html`
- `properties.html`
- `styles.css`
- `script.js`
- `properties.js`
- `data/properties.json`

## Important

Do **not** upload the private admin files to the public repo.

## How to update listings

1. Open the private admin version on your computer.
2. Add or edit properties there.
3. Export `properties.json`.
4. Replace `data/properties.json` in this public folder or repo.
5. Commit and push to GitHub.

## Contact placeholders to update

Open `script.js` and replace:

- `whatsappNumber`
- `whatsappDisplay`
- `email`

## Video de bienvenida

La portada ya está preparada para cargar el video principal desde:

`assets/videos/hero-bienvenida.mp4`

Crea la carpeta `assets/videos` si no existe y sube ahí tu archivo MP4 con ese nombre exacto. Si usas otro nombre, cambia la ruta en `index.html` dentro de la etiqueta `<source>`.

Recomendación: usa un MP4 horizontal 16:9, 1080p, corto y optimizado para web.

## Firebase admin panel

This version includes a hidden admin page at `manage-properties.html`. Do not link it in the public navigation. Share that URL only with the owner.

1. Open `firebase-config.js` and paste the Firebase Web App config.
2. In Firebase Authentication, enable Email/Password sign-in and create the owner account.
3. In Firestore, create/use the collection named `properties`.
4. Suggested Firestore rules for this setup:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{propertyId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

Public visitors can read listings without an account. Only authenticated Firebase users can create, edit, or delete listings.
