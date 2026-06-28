# I&R Caribbean Real Estate

This version is ready for GitHub Pages + Firebase + Cloudinary.

## Public pages

- `index.html`
- `properties.html`

Visitors do not need an account. The public properties page reads published listings from Firestore.

## Hidden admin page

- `manage-properties.html`

This page is not linked in the public navigation. Share this URL only with the owner/admin.

The admin can:

- Sign in with Firebase Authentication.
- Add, edit, publish, hide, or delete properties.
- Upload a main image with Cloudinary.
- Upload multiple gallery images with Cloudinary.
- Save the generated image URLs automatically in Firestore.
- Click `Review public result` to open the public properties page.

## Firebase setup

1. Open `firebase-config.js` and confirm the Firebase Web App config is filled.
2. In Firebase Authentication, enable Email/Password sign-in.
3. Create the owner/admin user.
4. In Firestore, use the collection named `properties`.
5. Use these Firestore rules:

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

## Cloudinary setup

This project uses Cloudinary instead of Firebase Storage, so Firebase Blaze is not required for image uploads.

Current Cloudinary values are already placed in `admin.js`:

```txt
cloudName: dkw2nrrg4
uploadPreset: ir_properties_unsigned
folder: ir-caribbean/properties
```

Cloudinary upload preset requirements:

- Signing mode: `Unsigned`
- Asset folder: `ir-caribbean/properties`
- Public ID: auto-generated

The admin does not need to copy image links. Cloudinary generates the URLs and the admin panel saves them in Firestore.

## Contact placeholders to update

Open `script.js` and replace:

- `whatsappNumber`
- `whatsappDisplay`
- `email`

## Welcome video

The homepage is prepared to load:

`hero-bienvenida.mp4`

Keep that file in the root unless you change the video path in `index.html`.


## Listing data
Bundled sample listings were removed. The public properties page now shows only listings saved by the administrator in Firestore, or imported JSON/local browser data for testing.
